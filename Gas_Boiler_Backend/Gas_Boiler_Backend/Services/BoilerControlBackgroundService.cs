using Gas_Boiler_Backend.Interfaces;
using Gas_Boiler_Backend.Hubs;
using Gas_Boiler_Backend.Models;
using Microsoft.AspNetCore.SignalR;

namespace Gas_Boiler_Backend.Services
{
    public class BoilerControlBackgroundService : BackgroundService
    {
        private readonly IServiceProvider _serviceProvider;
        private readonly ILogger<BoilerControlBackgroundService> _logger;
        private readonly IHubContext<BoilerHub> _hubContext;

        // P-Controller constant
        private const double Kp = 3.0; // Proportional gain

        public BoilerControlBackgroundService(
            IServiceProvider serviceProvider,
            ILogger<BoilerControlBackgroundService> logger,
            IHubContext<BoilerHub> hubContext)
        {
            _serviceProvider = serviceProvider;
            _logger = logger;
            _hubContext = hubContext;
        }

        protected override async Task ExecuteAsync(CancellationToken stoppingToken)
        {
            _logger.LogInformation("🔥 P-Controller Background Service STARTED");
            _logger.LogInformation("Running every 1 minute (Kp = {Kp})", Kp);
            _logger.LogInformation("Waiting 30 seconds before first regulation...");

            await Task.Delay(TimeSpan.FromSeconds(30), stoppingToken);

            while (!stoppingToken.IsCancellationRequested)
            {
                try
                {
                    _logger.LogInformation("🔥 P-Controller executing...");
                    await RegulateAllBoilersAsync();
                    _logger.LogInformation("✅ P-Controller complete. Next run in 1 minute");

                    await Task.Delay(TimeSpan.FromMinutes(1), stoppingToken);
                }
                catch (TaskCanceledException)
                {
                    _logger.LogInformation("P-Controller service stopping...");
                    break;
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex, "❌ Error in P-Controller");
                    await Task.Delay(TimeSpan.FromSeconds(30), stoppingToken);
                }
            }

            _logger.LogInformation("🔥 P-Controller Background Service STOPPED");
        }

        private async Task RegulateAllBoilersAsync()
        {
            using (var scope = _serviceProvider.CreateScope())
            {
                var buildingRepo = scope.ServiceProvider.GetRequiredService<IBuildingObjectRepository>();
                var boilerRepo = scope.ServiceProvider.GetRequiredService<IGasBoilerRepository>();
                var readingRepo = scope.ServiceProvider.GetRequiredService<IBuildingReadingRepository>();
                var alarmService = scope.ServiceProvider.GetRequiredService<IAlarmService>();

                var buildings = await buildingRepo.GetAllAsync();

                foreach (var building in buildings)
                {
                    try
                    {
                        await RegulateBuildingAsync(building, boilerRepo, readingRepo, alarmService);
                    }
                    catch (Exception ex)
                    {
                        _logger.LogError(ex, "Error regulating building {BuildingId} ({BuildingName})",
                            building.Id, building.Name);
                    }
                }
            }
        }

        private async Task RegulateBuildingAsync(
            BuildingObject building,
            IGasBoilerRepository boilerRepo,
            IBuildingReadingRepository readingRepo,
            IAlarmService alarmService)
        {
            var latestReading = await readingRepo.GetLatestByBuildingIdAsync(building.Id);
            if (latestReading == null)
            {
                _logger.LogWarning("No readings for building {BuildingName}, skipping", building.Name);
                return;
            }

            var indoorTemp = CalculateIndoorTemperature(building, latestReading);

            var error = building.DesiredTemperature - indoorTemp;

            var powerAdjustment = error * Kp;

            _logger.LogInformation(
                "Building {BuildingName}: Indoor={IndoorTemp:F1}°C, Desired={DesiredTemp:F1}°C, Error={Error:F1}°C, Adjustment={Adjustment:F1}kW",
                building.Name, indoorTemp, building.DesiredTemperature, error, powerAdjustment);

            var boilers = await boilerRepo.GetByBuildingIdAsync(building.Id);

            // Convert to list if needed
            var boilerList = boilers.ToList();

            if (!boilerList.Any())
            {
                _logger.LogWarning("No boilers found for building {BuildingName}", building.Name);
                return;
            }

            var totalAvailablePower = boilerList.Sum(b => b.MaxPower);
            var totalCurrentPower = boilerList.Sum(b => b.CurrentPower);

            var newTotalPower = Math.Clamp(
                totalCurrentPower + powerAdjustment,
                0,
                totalAvailablePower
            );

            var powerPerBoiler = newTotalPower / boilerList.Count;

            foreach (var boiler in boilerList)
            {
                var oldPower = boiler.CurrentPower;

                // Set new power for this boiler (clamped to its max)
                var newPower = Math.Clamp(powerPerBoiler, 0, boiler.MaxPower);

                if (Math.Abs(newPower - oldPower) > 0.1) // Only update if significant change
                {
                    boiler.CurrentPower = newPower;
                    await boilerRepo.UpdateAsync(boiler);
                    await boilerRepo.SaveChangesAsync();

                    _logger.LogInformation(
                        "  Boiler {BoilerName}: {OldPower:F1}kW → {NewPower:F1}kW",
                        boiler.Name, oldPower, newPower);

                    await _hubContext.Clients.All.SendAsync("BoilerPowerUpdated", new
                    {
                        boilerId = boiler.Id,
                        boilerName = boiler.Name,
                        buildingId = building.Id,
                        buildingName = building.Name,
                        oldPower = oldPower,
                        newPower = newPower,
                        maxPower = boiler.MaxPower,
                        timestamp = DateTime.UtcNow
                    });
                }
            }

            await _hubContext.Clients.All.SendAsync("IndoorTemperatureUpdated", new
            {
                buildingId = building.Id,
                buildingName = building.Name,
                temperature = indoorTemp,
                desiredTemperature = building.DesiredTemperature,
                error = error,
                outdoorTemperature = latestReading.OutdoorTemperature,
                timestamp = DateTime.UtcNow
            });

            var requiredPower = latestReading.RequiredPowerKw;

            if (requiredPower > totalAvailablePower)
            {
                var deficit = requiredPower - totalAvailablePower;

                _logger.LogWarning(
                    "⚠️ INSUFFICIENT CAPACITY for {BuildingName}! Required: {Required:F1}kW, Available: {Available:F1}kW, Deficit: {Deficit:F1}kW",
                    building.Name, requiredPower, totalAvailablePower, deficit);

                await alarmService.CheckCapacityAlarmAsync(building.Id);

                await _hubContext.Clients.All.SendAsync("CapacityWarning", new
                {
                    buildingId = building.Id,
                    buildingName = building.Name,
                    requiredPower = requiredPower,
                    availablePower = totalAvailablePower,
                    deficit = deficit,
                    timestamp = DateTime.UtcNow
                });
            }
        }

        private double CalculateIndoorTemperature(BuildingObject building, BuildingReading reading)
        {
            var outdoorTemp = reading.OutdoorTemperature;
            var desiredTemp = building.DesiredTemperature;

            var outdoorInfluence = 0.15;
            var baseTemp = (desiredTemp * (1 - outdoorInfluence)) + (outdoorTemp * outdoorInfluence);

            var random = new Random(DateTime.UtcNow.Millisecond + building.Id);
            var oscillation = (random.NextDouble() - 0.5) * 3.0; // ±1.5°C

            var indoorTemp = baseTemp + oscillation;

            return Math.Clamp(indoorTemp, outdoorTemp - 5, desiredTemp + 5);
        }

        public override async Task StopAsync(CancellationToken cancellationToken)
        {
            _logger.LogInformation("🛑 P-Controller stop signal received");
            await base.StopAsync(cancellationToken);
        }
    }
}