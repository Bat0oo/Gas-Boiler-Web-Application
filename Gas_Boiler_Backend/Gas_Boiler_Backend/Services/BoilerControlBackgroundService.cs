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
            _logger.LogInformation("Using realistic thermodynamics for indoor temperature calculation");
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
                var sysParamsRepo = scope.ServiceProvider.GetRequiredService<ISystemParametersRepository>();

                var buildings = await buildingRepo.GetAllAsync();

                foreach (var building in buildings)
                {
                    try
                    {
                        await RegulateBuildingAsync(building, boilerRepo, readingRepo, alarmService, sysParamsRepo);
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
            IAlarmService alarmService,
            ISystemParametersRepository sysParamsRepo)
        {
            // 1. Get latest reading for outdoor temp and heat loss
            var latestReading = await readingRepo.GetLatestByBuildingIdAsync(building.Id);
            if (latestReading == null)
            {
                _logger.LogWarning("No readings for building {BuildingName}, skipping", building.Name);
                return;
            }

            // 2. Get system parameters for temperature calculation
            var sysParams = await sysParamsRepo.GetAsync();
            if (sysParams == null)
            {
                _logger.LogWarning("System parameters not found, skipping");
                return;
            }

            // 3. Get all boilers for this building
            var boilers = await boilerRepo.GetByBuildingIdAsync(building.Id);
            var boilerList = boilers.ToList();

            if (!boilerList.Any())
            {
                _logger.LogWarning("No boilers found for building {BuildingName}", building.Name);
                return;
            }

            // 4. Calculate current indoor temperature using realistic thermodynamics
            var indoorTemp = CalculateRealisticIndoorTemperature(
                building,
                latestReading,
                boilerList,
                sysParams);

            // 5. P-Controller: Calculate error
            var error = building.DesiredTemperature - indoorTemp;

            // 6. P-Controller: Calculate power adjustment
            var powerAdjustment = error * Kp;

            _logger.LogInformation(
                "Building {BuildingName}: Indoor={IndoorTemp:F1}°C, Desired={DesiredTemp:F1}°C, Error={Error:F1}°C, Adjustment={Adjustment:F1}kW",
                building.Name, indoorTemp, building.DesiredTemperature, error, powerAdjustment);

            // 7. Calculate boiler power distribution
            var totalAvailablePower = boilerList.Sum(b => b.MaxPower);
            var totalCurrentPower = boilerList.Sum(b => b.CurrentPower);

            var newTotalPower = Math.Clamp(
                totalCurrentPower + powerAdjustment,
                0,
                totalAvailablePower
            );

            var powerPerBoiler = newTotalPower / boilerList.Count;

            // 8. Update each boiler's power
            foreach (var boiler in boilerList)
            {
                var oldPower = boiler.CurrentPower;
                var newPower = Math.Clamp(powerPerBoiler, 0, boiler.MaxPower);

                if (Math.Abs(newPower - oldPower) > 0.1)
                {
                    boiler.CurrentPower = newPower;
                    await boilerRepo.UpdateAsync(boiler);
                    await boilerRepo.SaveChangesAsync();

                    _logger.LogInformation(
                        "  Boiler {BoilerName}: {OldPower:F1}kW → {NewPower:F1}kW",
                        boiler.Name, oldPower, newPower);

                    // Broadcast boiler power update
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

            // 9. Broadcast indoor temperature update
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

            // 10. SAVE INDOOR TEMPERATURE TO DATABASE
            latestReading.IndoorTemperature = indoorTemp;
            await readingRepo.UpdateAsync(latestReading);
            await readingRepo.SaveChangesAsync();

            // 11. Check for capacity alarm
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

        /// <summary>
        /// Calculate indoor temperature using realistic thermodynamics
        /// Based on heat balance equation and building thermal mass
        /// </summary>
        private double CalculateRealisticIndoorTemperature(
            BuildingObject building,
            BuildingReading reading,
            List<GasBoiler> boilers,
            SystemParameters sysParams)
        {
            // Get previous indoor temperature (or initialize if first run)
            var previousIndoorTemp = reading.IndoorTemperature > 0
                ? reading.IndoorTemperature
                : building.DesiredTemperature; // Start at desired temp on first run

            // === HEAT BALANCE CALCULATION ===

            // 1. Heat generated by boilers (Watts)
            // Q_in = Σ(CurrentPower × Efficiency) × 1000 (convert kW to W)
            var heatGenerated = boilers.Sum(b => b.CurrentPower * b.Efficiency * 1000.0);

            // 2. Heat lost through building envelope (Watts)
            // This is already calculated and stored in BuildingReading
            var heatLost = reading.HeatLossWatts;

            // 3. Net heat flow (Watts)
            // Positive = heating up, Negative = cooling down
            var netHeatFlow = heatGenerated - heatLost;

            // === TEMPERATURE CHANGE CALCULATION ===

            // 4. Calculate temperature change using thermal mass
            // Formula: ΔT = Q_net × Δt / (ρ × V × c_p)
            // Where:
            //   Q_net = net heat flow (W)
            //   Δt = time step (seconds)
            //   ρ × c_p = thermal mass coefficient (J/m³·K)
            //   V = building volume (m³)

            var timeStep = (double)sysParams.TemperatureTimeStepSeconds; // seconds
            var thermalMass = (double)sysParams.ThermalMassCoefficient; // J/m³·K
            var volume = building.Volume; // m³

            // Energy added/removed in time step (Joules)
            var energyChange = netHeatFlow * timeStep; // W × s = J

            // Temperature change from heat balance
            var tempChangeFromHeat = energyChange / (thermalMass * volume); // °C

            // === OUTDOOR INFLUENCE ===

            // 5. Add outdoor temperature influence (configurable factor)
            // This simulates imperfect insulation and air infiltration
            var outdoorInfluence = (double)sysParams.OutdoorInfluenceFactor; // 0.0 - 1.0
            var outdoorTemp = reading.OutdoorTemperature;

            // Pull indoor temp slightly toward outdoor temp
            var tempChangeFromOutdoor = (outdoorTemp - previousIndoorTemp) * outdoorInfluence * 0.01; // Small factor

            // === CALCULATE NEW INDOOR TEMPERATURE ===

            var newIndoorTemp = previousIndoorTemp + tempChangeFromHeat + tempChangeFromOutdoor;

            // Clamp to reasonable range (can't be colder than outdoor or much hotter than desired)
            var minTemp = Math.Min(outdoorTemp, building.DesiredTemperature - 10);
            var maxTemp = building.DesiredTemperature + 10;
            newIndoorTemp = Math.Clamp(newIndoorTemp, minTemp, maxTemp);

            // Log detailed thermodynamics (for debugging/demonstration)
            _logger.LogDebug(
                "Thermodynamics for {BuildingName}: Heat_in={HeatIn:F0}W, Heat_out={HeatOut:F0}W, Net={Net:F0}W, ΔT={DeltaT:F3}°C",
                building.Name, heatGenerated, heatLost, netHeatFlow, tempChangeFromHeat);

            return newIndoorTemp;
        }

        public override async Task StopAsync(CancellationToken cancellationToken)
        {
            _logger.LogInformation("🛑 P-Controller stop signal received");
            await base.StopAsync(cancellationToken);
        }
    }
}