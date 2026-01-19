using Gas_Boiler_Backend.DTO.HistoricalData;
using Gas_Boiler_Backend.Interfaces;
using Gas_Boiler_Backend.Models;

namespace Gas_Boiler_Backend.Services
{
    public class HistoricalDataService : IHistoricalDataService
    {
        private readonly IBuildingReadingRepository _readingRepository;
        private readonly IBuildingObjectRepository _buildingRepository;
        private readonly IBuildingCalculatorService _calculatorService;
        private readonly ISystemParametersRepository _parametersRepository;
        private readonly ILogger<HistoricalDataService> _logger;

        public HistoricalDataService(
            IBuildingReadingRepository readingRepository,
            IBuildingObjectRepository buildingRepository,
            IBuildingCalculatorService calculatorService,
            ISystemParametersRepository parametersRepository,
            ILogger<HistoricalDataService> logger)
        {
            _readingRepository = readingRepository;
            _buildingRepository = buildingRepository;
            _calculatorService = calculatorService;
            _parametersRepository = parametersRepository;
            _logger = logger;
        }

        public async Task RecordAllBuildingsAsync()
        {
            _logger.LogInformation("=== Recording historical data for all buildings ===");

            var buildings = await _buildingRepository.GetAllAsync();
            var timestamp = DateTime.UtcNow;
            int successCount = 0;

            foreach (var building in buildings)
            {
                try
                {
                    await RecordBuildingDataAsync(building, timestamp);
                    successCount++;
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex, $"Error recording data for building {building.Id} ({building.Name})");
                }
            }

            _logger.LogInformation($"=== Recorded data for {successCount}/{buildings.Count()} buildings ===");
        }
        private async Task RecordBuildingDataAsync(BuildingObject building, DateTime timestamp)
        {
            // Get current calculations
            var calculations = await _calculatorService.CalculateBuildingMetricsAsync(building);

            var reading = new BuildingReading
            {
                BuildingId = building.Id,
                Timestamp = timestamp,

                IndoorTemperature = calculations.IndoorTemperature,
                OutdoorTemperature = calculations.OutdoorTemperature,
                TemperatureDifference = calculations.TemperatureDifference,

                HeatLossWatts = calculations.TotalHeatLoss,

                RequiredPowerKw = calculations.RequiredPowerKw,
                AvailablePowerKw = calculations.CurrentBoilerCapacityKw,
                HasSufficientCapacity = calculations.HasSufficientCapacity,

                DailyCostEur = calculations.DailyCostEur,

                CreatedAt = DateTime.UtcNow
            };

            await _readingRepository.CreateAsync(reading);

            _logger.LogDebug($"Recorded data for building {building.Name}: " +
                           $"Outdoor: {reading.OutdoorTemperature:F1}°C, " +
                           $"Heat Loss: {(reading.HeatLossWatts / 1000):F2} kW, " +
                           $"Cost: €{reading.DailyCostEur:F2}");
        }
        public async Task<SeedHistoricalDataResponse> SeedHistoricalDataAsync(int daysToGenerate = 30)
        {
            _logger.LogInformation($"=== Seeding {daysToGenerate} days of historical data ===");

            var buildings = await _buildingRepository.GetAllAsync();
            var parameters = await _parametersRepository.GetAsync();
            var readings = new List<BuildingReading>();
            var random = new Random();

            foreach (var building in buildings)
            {
                _logger.LogInformation($"Generating data for building: {building.Name}");

                // Generate readings for the past N days (hourly)
                for (int day = daysToGenerate - 1; day >= 0; day--)
                {
                    for (int hour = 0; hour < 24; hour++)
                    {
                        var timestamp = DateTime.UtcNow
                            .Date // Start from midnight today
                            .AddDays(-day)
                            .AddHours(hour);

                        // Generate realistic weather
                        double outdoorTemp = GenerateRealisticOutdoorTemp(day, hour, random);

                        // Create reading with this temperature
                        var reading = CreateReadingForBuilding(
                            building,
                            parameters,
                            timestamp,
                            outdoorTemp);

                        readings.Add(reading);
                    }
                }
            }

            // Batch insert all readings
            _logger.LogInformation($"Inserting {readings.Count} readings into database...");
            await _readingRepository.CreateManyAsync(readings);

            var response = new SeedHistoricalDataResponse
            {
                Message = $"Successfully generated {readings.Count} historical readings",
                ReadingsGenerated = readings.Count,
                BuildingsProcessed = buildings.Count(),
                DaysGenerated = daysToGenerate
            };

            _logger.LogInformation($"=== Seeding complete! {readings.Count} readings for {buildings.Count()} buildings ===");

            return response;
        }

        private double GenerateRealisticOutdoorTemp(int daysAgo, int hour, Random random)
        {
            double baseTemp = -5.0;

            double dailyVariation = (random.NextDouble() - 0.5) * 16;

            double hourlyVariation = Math.Sin((hour - 6) * Math.PI / 12) * 6;

            double noise = (random.NextDouble() - 0.5) * 2;

            double temperature = baseTemp + dailyVariation + hourlyVariation + noise;

            return Math.Clamp(temperature, -20, 10);
        }

        private BuildingReading CreateReadingForBuilding(BuildingObject building, SystemParameters parameters, DateTime timestamp, double outdoorTemp)
        {
            double tempDiff = building.DesiredTemperature - outdoorTemp;
            double groundTemp = (double)parameters.GroundTemp;

            double wallLoss = (double)building.WallUValue * building.WallArea * tempDiff;
            double windowLoss = (double)building.WindowUValue * building.WindowArea * tempDiff;
            double ceilingLoss = (double)building.CeilingUValue * building.CeilingArea * tempDiff;
            double floorLoss = (double)building.FloorUValue * building.FloorArea *
                              (building.DesiredTemperature - groundTemp);

            double totalLossBeforeSafety = wallLoss + windowLoss + ceilingLoss + floorLoss;

            double totalLoss = totalLossBeforeSafety * (double)parameters.SafetyFactor;

            double requiredPower = totalLoss / 1000.0; // Convert to kW
            double availablePower = building.GasBoilers.Sum(b => (double)b.MaxPower);
            double dailyEnergy = (totalLoss * 24) / 1000.0; // kWh per day

            double avgEfficiency = building.GasBoilers.Any()
                ? building.GasBoilers.Average(b => (double)b.Efficiency)
                : (double)parameters.DefaultBoilerEfficiency;

            // Calculate daily cost using gas price from parameters
            double dailyCost = (dailyEnergy / avgEfficiency) * (double)parameters.GasPricePerKwh;

            return new BuildingReading
            {
                BuildingId = building.Id,
                Timestamp = timestamp,

                IndoorTemperature = building.DesiredTemperature,
                OutdoorTemperature = outdoorTemp,
                TemperatureDifference = tempDiff,

                HeatLossWatts = totalLoss,

                RequiredPowerKw = requiredPower,
                AvailablePowerKw = availablePower,
                HasSufficientCapacity = availablePower >= requiredPower,

                DailyCostEur = dailyCost,

                CreatedAt = DateTime.UtcNow
            };
        }

        /// <summary>
        /// Gets total count of all readings in database
        /// </summary>
        public async Task<int> GetTotalReadingsCountAsync()
        {
            return await _readingRepository.GetCountAsync();
        }
    }
}