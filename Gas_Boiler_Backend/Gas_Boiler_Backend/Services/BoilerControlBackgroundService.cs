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

        private const double Kp = 1.5; // Or 3.0
        private const double Deadband = 0.3; // ±0.3°C tolerance

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
            _logger.LogInformation("🔥 Boiler P-Controller Service STARTED");

            await Task.Delay(TimeSpan.FromSeconds(30), stoppingToken);

            while (!stoppingToken.IsCancellationRequested)
            {
                try
                {
                    await RegulateAllBoilersAsync();
                    await Task.Delay(TimeSpan.FromMinutes(1), stoppingToken);
                }
                catch (TaskCanceledException)
                {
                    break;
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex, "Controller error");
                    await Task.Delay(TimeSpan.FromSeconds(10), stoppingToken);
                }
            }

            _logger.LogInformation("🔥 Boiler P-Controller Service STOPPED");
        }

        private async Task RegulateAllBoilersAsync()
        {
            using var scope = _serviceProvider.CreateScope();

            var buildingRepo = scope.ServiceProvider.GetRequiredService<IBuildingObjectRepository>();
            var boilerRepo = scope.ServiceProvider.GetRequiredService<IGasBoilerRepository>();
            var readingRepo = scope.ServiceProvider.GetRequiredService<IBuildingReadingRepository>();
            var alarmService = scope.ServiceProvider.GetRequiredService<IAlarmService>();
            var sysParamsRepo = scope.ServiceProvider.GetRequiredService<ISystemParametersRepository>();

            var buildings = await buildingRepo.GetAllAsync();

            foreach (var building in buildings)
            {
                try
                {
                    await RegulateBuildingAsync(
                        building,
                        boilerRepo,
                        readingRepo,
                        alarmService,
                        sysParamsRepo);
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex,
                        "Error regulating building {BuildingId} ({BuildingName})",
                        building.Id, building.Name);
                }
            }
        }

        private async Task RegulateBuildingAsync(
            BuildingObject building,
            IGasBoilerRepository boilerRepo,
            IBuildingReadingRepository readingRepo,
            IAlarmService alarmService,
            ISystemParametersRepository sysParamsRepo)
        {
            var reading = await readingRepo.GetLatestByBuildingIdAsync(building.Id);
            if (reading == null) return;

            var sysParams = await sysParamsRepo.GetAsync();
            if (sysParams == null) return;

            var boilers = (await boilerRepo.GetByBuildingIdAsync(building.Id)).ToList();
            var hasBoilers = boilers.Any();

            var indoorTemp = CalculateIndoorTemperature(building, reading, boilers, sysParams);
            var error = building.DesiredTemperature - indoorTemp;

            _logger.LogInformation(
                "🏢 {Building}: Indoor={Indoor:F1}°C Target={Target:F1}°C Error={Error:F2}°C",
                building.Name, indoorTemp, building.DesiredTemperature, error);
            if (hasBoilers)
            {
                var totalAvailablePower = boilers.Sum(b => b.MaxPower);

                double newTotalPower;

                var feedForward = reading.HeatLossWatts / 1000.0; // kW

                // 🔴 1) Ako je pretoplo → potpuno ugasi
                if (indoorTemp > building.DesiredTemperature)
                {
                    newTotalPower = 0;
                    _logger.LogInformation("  🔴 Above target → boilers OFF");
                }
                // 🟡 2) Ako smo u deadband zoni → samo pokrij heat loss
                else if (Math.Abs(error) <= Deadband)
                {
                    newTotalPower = feedForward;
                    _logger.LogInformation("  🟡 Within deadband → maintain heat loss power");
                }
                // 🟢 3) Normalna P regulacija
                else
                {
                    var pComponent = error * Kp;

                    newTotalPower = Math.Clamp(
                        feedForward + pComponent,
                        0,
                        totalAvailablePower);
                }

                var powerPerBoiler = newTotalPower / boilers.Count;

                foreach (var boiler in boilers)
                {
                    boiler.CurrentPower = Math.Clamp(powerPerBoiler, 0, boiler.MaxPower);
                    await boilerRepo.UpdateAsync(boiler);
                }

                await boilerRepo.SaveChangesAsync(); // ✅ single commit

                var requiredPower = reading.RequiredPowerKw;
                if (requiredPower > totalAvailablePower)
                {
                    await alarmService.CheckCapacityAlarmAsync(building.Id);
                }
            }

            await _hubContext.Clients.All.SendAsync("IndoorTemperatureUpdated", new
            {
                buildingId = building.Id,
                buildingName = building.Name,
                temperature = indoorTemp,
                desiredTemperature = building.DesiredTemperature,
                error,
                outdoorTemperature = reading.OutdoorTemperature,
                hasBoilers,
                timestamp = DateTime.UtcNow
            });

            reading.IndoorTemperature = indoorTemp;
            await readingRepo.UpdateAsync(reading);
            await readingRepo.SaveChangesAsync();
        }

        private double CalculateIndoorTemperature(
            BuildingObject building,
            BuildingReading reading,
            List<GasBoiler> boilers,
            SystemParameters sysParams)
        {
            var previousIndoor = reading.IndoorTemperature > 0
                ? reading.IndoorTemperature
                : building.DesiredTemperature - 5;

            var heatGenerated = boilers.Sum(b => b.CurrentPower * b.Efficiency * 1000.0);
            var heatLost = reading.HeatLossWatts;

            var netHeat = heatGenerated - heatLost;

            var timeStep = (double)sysParams.TemperatureTimeStepSeconds;
            var thermalMass = (double)sysParams.ThermalMassCoefficient;
            var volume = building.Volume;

            var energyChange = netHeat * timeStep;

            var deltaT = energyChange / (thermalMass * volume);

            var newIndoor = previousIndoor + deltaT;

            // realistic clamp
            newIndoor = Math.Clamp(newIndoor,
                reading.OutdoorTemperature - 10,
                building.DesiredTemperature + 15);

            return newIndoor;
        }

        public override async Task StopAsync(CancellationToken cancellationToken)
        {
            _logger.LogInformation("🛑 Controller stopping...");
            await base.StopAsync(cancellationToken);
        }
    }
}