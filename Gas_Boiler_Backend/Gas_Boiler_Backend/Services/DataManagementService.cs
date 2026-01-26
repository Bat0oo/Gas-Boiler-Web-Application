using Gas_Boiler_Backend.DTO.DataManagement;
using Gas_Boiler_Backend.Interfaces;
using System.Text;

namespace Gas_Boiler_Backend.Services
{
    public class DataManagementService : IDataManagementService
    {
        private readonly IDataManagementSettingsRepository _settingsRepository;
        private readonly IBuildingReadingRepository _readingRepository;
        private readonly ILogger<DataManagementService> _logger;

        public DataManagementService(
            IDataManagementSettingsRepository settingsRepository,
            IBuildingReadingRepository readingRepository,
            ILogger<DataManagementService> logger)
        {
            _settingsRepository = settingsRepository;
            _readingRepository = readingRepository;
            _logger = logger;
        }

        public async Task<DataManagementSettingsDto> GetSettingsAsync()
        {
            var settings = await _settingsRepository.GetAsync();

            if (settings == null)
            {
                settings = await _settingsRepository.CreateDefaultAsync();
            }

            return new DataManagementSettingsDto
            {
                Id = settings.Id,
                RecordingIntervalMinutes = settings.RecordingIntervalMinutes,
                LastUpdated = settings.LastUpdated,
                UpdatedBy = settings.UpdatedBy
            };
        }

        public async Task<DataManagementSettingsDto> UpdateSettingsAsync(
            UpdateDataManagementSettingsDto dto,
            string updatedBy)
        {
            var settings = await _settingsRepository.GetAsync();

            if (settings == null)
            {
                settings = await _settingsRepository.CreateDefaultAsync();
            }

            settings.RecordingIntervalMinutes = dto.RecordingIntervalMinutes;
            settings.LastUpdated = DateTime.UtcNow;
            settings.UpdatedBy = updatedBy;

            await _settingsRepository.UpdateAsync(settings);

            _logger.LogInformation($"Recording interval updated to {dto.RecordingIntervalMinutes} minutes by {updatedBy}");

            return new DataManagementSettingsDto
            {
                Id = settings.Id,
                RecordingIntervalMinutes = settings.RecordingIntervalMinutes,
                LastUpdated = settings.LastUpdated,
                UpdatedBy = settings.UpdatedBy
            };
        }

        public async Task<DataStatisticsDto> GetStatisticsAsync()
        {
            var allReadings = await _readingRepository.GetAllAsync();
            var readingsList = allReadings.ToList();

            if (!readingsList.Any())
            {
                return new DataStatisticsDto
                {
                    TotalReadings = 0,
                    TotalBuildings = 0,
                    DateRange = "No data available"
                };
            }

            var oldest = readingsList.Min(r => r.Timestamp);
            var newest = readingsList.Max(r => r.Timestamp);
            var buildingCount = readingsList.Select(r => r.BuildingId).Distinct().Count();

            return new DataStatisticsDto
            {
                TotalReadings = readingsList.Count,
                TotalBuildings = buildingCount,
                OldestReading = oldest,
                NewestReading = newest,
                DateRange = $"{oldest:MMM d, yyyy} - {newest:MMM d, yyyy}"
            };
        }

        public async Task<byte[]> ExportDataAsCsvAsync()
        {
            _logger.LogInformation("Exporting all historical data as CSV...");

            var allReadings = await _readingRepository.GetAllAsync();
            return GenerateCsvFromReadings(allReadings, "all");
        }

        public async Task<byte[]> ExportUserDataAsCsvAsync(int userId)
        {
            _logger.LogInformation($"Exporting historical data for user {userId} as CSV...");

            var allReadings = await _readingRepository.GetAllAsync();
            var userReadings = allReadings.Where(r => r.Building.UserId == userId);

            return GenerateCsvFromReadings(userReadings, $"user_{userId}");
        }

        private byte[] GenerateCsvFromReadings(IEnumerable<dynamic> readings, string scope)
        {
            var readingsList = readings.OrderBy(r => r.BuildingId).ThenBy(r => r.Timestamp).ToList();

            var csv = new StringBuilder();

            // CSV Header
            csv.AppendLine("BuildingName,Timestamp,IndoorTemp(°C),OutdoorTemp(°C),TempDiff(°C),HeatLoss(kW),RequiredPower(kW),AvailablePower(kW),HasSufficientCapacity,DailyCost(EUR)");

            // CSV Rows
            foreach (var reading in readingsList)
            {
                var buildingName = reading.Building?.Name ?? "Unknown";
                var timestamp = reading.Timestamp.ToString("yyyy-MM-dd HH:mm:ss");
                var indoorTemp = reading.IndoorTemperature.ToString("F1");
                var outdoorTemp = reading.OutdoorTemperature.ToString("F1");
                var tempDiff = reading.TemperatureDifference.ToString("F1");
                var heatLossKw = (reading.HeatLossWatts / 1000.0).ToString("F2");
                var requiredPower = reading.RequiredPowerKw.ToString("F2");
                var availablePower = reading.AvailablePowerKw.ToString("F2");
                var hasCapacity = reading.HasSufficientCapacity ? "Yes" : "No";
                var dailyCost = reading.DailyCostEur.ToString("F2");

                // Escape building name if it contains comma
                if (buildingName.Contains(','))
                {
                    buildingName = $"\"{buildingName}\"";
                }

                csv.AppendLine($"{buildingName},{timestamp},{indoorTemp},{outdoorTemp},{tempDiff},{heatLossKw},{requiredPower},{availablePower},{hasCapacity},{dailyCost}");
            }

            _logger.LogInformation($"Exported {readingsList.Count} readings to CSV (scope: {scope})");

            return Encoding.UTF8.GetBytes(csv.ToString());
        }
    }
}