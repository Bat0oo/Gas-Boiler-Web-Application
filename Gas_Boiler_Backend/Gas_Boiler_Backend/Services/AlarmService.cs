using Gas_Boiler_Backend.DTO.Alarms;
using Gas_Boiler_Backend.Interfaces;
using Gas_Boiler_Backend.Models;
using System.Text.Json;

namespace Gas_Boiler_Backend.Services
{
    public class AlarmService : IAlarmService
    {
        private readonly IAlarmRepository _alarmRepo;
        private readonly IAlarmSettingsRepository _settingsRepo;
        private readonly IBuildingReadingRepository _readingRepo;
        private readonly IBuildingObjectRepository _buildingRepo;
        private readonly ILogger<AlarmService> _logger;

        public AlarmService(
            IAlarmRepository alarmRepo,
            IAlarmSettingsRepository settingsRepo,
            IBuildingReadingRepository readingRepo,
            IBuildingObjectRepository buildingRepo,
            ILogger<AlarmService> logger)
        {
            _alarmRepo = alarmRepo;
            _settingsRepo = settingsRepo;
            _readingRepo = readingRepo;
            _buildingRepo = buildingRepo;
            _logger = logger;
        }

        #region Alarm CRUD

        public async Task<AlarmDto?> GetByIdAsync(int id, int userId, bool isAdmin)
        {
            var alarm = await _alarmRepo.GetByIdAsync(id);
            if (alarm == null) return null;

            // Users can only see their own alarms
            if (!isAdmin && alarm.Building.UserId != userId)
                return null;

            return MapToDto(alarm);
        }

        public async Task<IEnumerable<AlarmDto>> GetAllAsync(AlarmFiltersDto? filters, int userId, bool isAdmin)
        {
            // If not admin, filter by userId
            if (!isAdmin)
            {
                filters ??= new AlarmFiltersDto();
                filters.UserId = userId;
            }

            var alarms = await _alarmRepo.GetAllAsync(filters);
            return alarms.Select(MapToDto);
        }

        public async Task<IEnumerable<AlarmDto>> GetActiveAlarmsAsync(int userId, bool isAdmin)
        {
            var alarms = await _alarmRepo.GetActiveAlarmsAsync(isAdmin ? null : userId);
            return alarms.Select(MapToDto);
        }

        public async Task<AlarmStatsDto> GetStatsAsync(int userId, bool isAdmin)
        {
            var filters = isAdmin ? null : new AlarmFiltersDto { UserId = userId };
            var allAlarms = await _alarmRepo.GetAllAsync(filters);

            var stats = new AlarmStatsDto
            {
                TotalAlarms = allAlarms.Count(),
                ActiveAlarms = allAlarms.Count(a => a.IsActive),
                AcknowledgedAlarms = allAlarms.Count(a => a.IsAcknowledged),
                ResolvedAlarms = allAlarms.Count(a => !a.IsActive),
                ByType = allAlarms.GroupBy(a => a.Type).ToDictionary(g => g.Key, g => g.Count()),
                BySeverity = allAlarms.GroupBy(a => a.Severity).ToDictionary(g => g.Key, g => g.Count())
            };

            return stats;
        }

        public async Task<AlarmDto?> AcknowledgeAsync(int id, int userId, bool isAdmin)
        {
            var alarm = await _alarmRepo.GetByIdAsync(id);
            if (alarm == null) return null;

            // Users can only acknowledge their own alarms
            if (!isAdmin && alarm.Building.UserId != userId)
                return null;

            alarm.IsAcknowledged = true;
            alarm.AcknowledgedAt = DateTime.UtcNow;

            await _alarmRepo.UpdateAsync(alarm);
            return MapToDto(alarm);
        }

        public async Task<AlarmDto?> ResolveAsync(int id, int userId, bool isAdmin)
        {
            // Only admin can resolve alarms
            if (!isAdmin) return null;

            var alarm = await _alarmRepo.GetByIdAsync(id);
            if (alarm == null) return null;

            alarm.IsActive = false;
            alarm.ResolvedAt = DateTime.UtcNow;

            await _alarmRepo.UpdateAsync(alarm);
            return MapToDto(alarm);
        }

        public async Task<bool> DeleteAsync(int id, int userId, bool isAdmin)
        {
            // Only admin can delete alarms
            if (!isAdmin) return false;

            return await _alarmRepo.DeleteAsync(id);
        }

        #endregion

        #region Alarm Settings

        public async Task<AlarmSettingsDto> GetSettingsAsync()
        {
            var settings = await _settingsRepo.GetAsync();
            if (settings == null)
            {
                settings = await _settingsRepo.CreateDefaultAsync();
            }

            return new AlarmSettingsDto
            {
                Id = settings.Id,
                HighIndoorTempThreshold = settings.HighIndoorTempThreshold,
                LowIndoorTempThreshold = settings.LowIndoorTempThreshold,
                HighOutdoorTempThreshold = settings.HighOutdoorTempThreshold,
                LowOutdoorTempThreshold = settings.LowOutdoorTempThreshold,
                HighDailyCostThreshold = settings.HighDailyCostThreshold,
                CapacityDeficitThreshold = settings.CapacityDeficitThreshold,
                AlertCooldownMinutes = settings.AlertCooldownMinutes,
                CapacityAlertsEnabled = settings.CapacityAlertsEnabled,
                HighIndoorTempAlertsEnabled = settings.HighIndoorTempAlertsEnabled,
                LowIndoorTempAlertsEnabled = settings.LowIndoorTempAlertsEnabled,
                HighOutdoorTempAlertsEnabled = settings.HighOutdoorTempAlertsEnabled,
                LowOutdoorTempAlertsEnabled = settings.LowOutdoorTempAlertsEnabled,
                HighCostAlertsEnabled = settings.HighCostAlertsEnabled,
                LastUpdated = settings.LastUpdated,
                UpdatedBy = settings.UpdatedBy
            };
        }

        public async Task<AlarmSettingsDto> UpdateSettingsAsync(UpdateAlarmSettingsDto dto, string updatedBy)
        {
            var settings = await _settingsRepo.GetAsync();
            if (settings == null)
            {
                settings = await _settingsRepo.CreateDefaultAsync();
            }

            // Update only provided values
            if (dto.HighIndoorTempThreshold.HasValue)
                settings.HighIndoorTempThreshold = dto.HighIndoorTempThreshold.Value;

            if (dto.LowIndoorTempThreshold.HasValue)
                settings.LowIndoorTempThreshold = dto.LowIndoorTempThreshold.Value;

            if (dto.HighOutdoorTempThreshold.HasValue)
                settings.HighOutdoorTempThreshold = dto.HighOutdoorTempThreshold.Value;

            if (dto.LowOutdoorTempThreshold.HasValue)
                settings.LowOutdoorTempThreshold = dto.LowOutdoorTempThreshold.Value;

            if (dto.HighDailyCostThreshold.HasValue)
                settings.HighDailyCostThreshold = dto.HighDailyCostThreshold.Value;

            if (dto.CapacityDeficitThreshold.HasValue)
                settings.CapacityDeficitThreshold = dto.CapacityDeficitThreshold.Value;

            if (dto.AlertCooldownMinutes.HasValue)
                settings.AlertCooldownMinutes = dto.AlertCooldownMinutes.Value;

            if (dto.CapacityAlertsEnabled.HasValue)
                settings.CapacityAlertsEnabled = dto.CapacityAlertsEnabled.Value;

            if (dto.HighIndoorTempAlertsEnabled.HasValue)
                settings.HighIndoorTempAlertsEnabled = dto.HighIndoorTempAlertsEnabled.Value;

            if (dto.LowIndoorTempAlertsEnabled.HasValue)
                settings.LowIndoorTempAlertsEnabled = dto.LowIndoorTempAlertsEnabled.Value;

            if (dto.HighOutdoorTempAlertsEnabled.HasValue)
                settings.HighOutdoorTempAlertsEnabled = dto.HighOutdoorTempAlertsEnabled.Value;

            if (dto.LowOutdoorTempAlertsEnabled.HasValue)
                settings.LowOutdoorTempAlertsEnabled = dto.LowOutdoorTempAlertsEnabled.Value;

            if (dto.HighCostAlertsEnabled.HasValue)
                settings.HighCostAlertsEnabled = dto.HighCostAlertsEnabled.Value;

            settings.UpdatedBy = updatedBy;
            await _settingsRepo.UpdateAsync(settings);

            return await GetSettingsAsync();
        }

        #endregion

        #region Alarm Detection Logic

        public async Task CheckAndCreateAlarmsAsync()
        {
            _logger.LogInformation("🚨 Starting alarm check...");

            try
            {
                var settings = await _settingsRepo.GetAsync();
                if (settings == null)
                {
                    _logger.LogWarning("No alarm settings found, creating defaults");
                    settings = await _settingsRepo.CreateDefaultAsync();
                }

                // Get all buildings
                var buildings = await _buildingRepo.GetAllAsync();

                _logger.LogInformation($"Checking alarms for {buildings.Count()} buildings");

                foreach (var building in buildings)
                {
                    await CheckBuildingAlarmsAsync(building, settings);
                }

                _logger.LogInformation("✅ Alarm check complete");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "❌ Error during alarm check");
            }
        }

        private async Task CheckBuildingAlarmsAsync(BuildingObject building, AlarmSettings settings)
        {
            // Get latest reading for this building
            var latestReading = await _readingRepo.GetLatestByBuildingIdAsync(building.Id);
            if (latestReading == null)
            {
                return; // No data to check
            }

            // 1. Capacity Alert
            if (settings.CapacityAlertsEnabled && !latestReading.HasSufficientCapacity)
            {
                await CheckCapacityAlarm(building, latestReading, settings);
            }

            // 2. High Indoor Temperature
            if (settings.HighIndoorTempAlertsEnabled &&
                latestReading.IndoorTemperature > settings.HighIndoorTempThreshold)
            {
                await CheckHighIndoorTempAlarm(building, latestReading, settings);
            }

            // 3. Low Indoor Temperature
            if (settings.LowIndoorTempAlertsEnabled &&
                latestReading.IndoorTemperature < settings.LowIndoorTempThreshold)
            {
                await CheckLowIndoorTempAlarm(building, latestReading, settings);
            }

            // 4. High Outdoor Temperature
            if (settings.HighOutdoorTempAlertsEnabled &&
                latestReading.OutdoorTemperature > settings.HighOutdoorTempThreshold)
            {
                await CheckHighOutdoorTempAlarm(building, latestReading, settings);
            }

            // 5. Low Outdoor Temperature
            if (settings.LowOutdoorTempAlertsEnabled &&
                latestReading.OutdoorTemperature < settings.LowOutdoorTempThreshold)
            {
                await CheckLowOutdoorTempAlarm(building, latestReading, settings);
            }

            // 6. High Daily Cost
            if (settings.HighCostAlertsEnabled &&
                latestReading.DailyCostEur > settings.HighDailyCostThreshold)
            {
                await CheckHighCostAlarm(building, latestReading, settings);
            }
        }

        private async Task CheckCapacityAlarm(BuildingObject building, BuildingReading reading, AlarmSettings settings)
        {
            if (await _alarmRepo.ExistsRecentAlarmAsync("INSUFFICIENT_CAPACITY", building.Id, settings.AlertCooldownMinutes))
            {
                return; // Already alerted recently
            }

            var deficit = reading.RequiredPowerKw - reading.AvailablePowerKw;
            var severity = deficit > 5.0 ? "CRITICAL" : "WARNING";

            var details = new
            {
                RequiredPowerKw = reading.RequiredPowerKw,
                AvailablePowerKw = reading.AvailablePowerKw,
                DeficitKw = deficit,
                Timestamp = reading.Timestamp
            };

            var alarm = new Alarm
            {
                Type = "INSUFFICIENT_CAPACITY",
                Severity = severity,
                Message = $"Insufficient heating capacity in {building.Name}. Deficit: {deficit:F2} kW",
                Details = JsonSerializer.Serialize(details),
                BuildingId = building.Id,
                CreatedAt = DateTime.UtcNow,
                IsActive = true,
                IsAcknowledged = false
            };

            await _alarmRepo.CreateAsync(alarm);
            _logger.LogWarning($"🚨 Created INSUFFICIENT_CAPACITY alarm for building {building.Id} ({building.Name})");
        }

        private async Task CheckHighIndoorTempAlarm(BuildingObject building, BuildingReading reading, AlarmSettings settings)
        {
            if (await _alarmRepo.ExistsRecentAlarmAsync("HIGH_INDOOR_TEMP", building.Id, settings.AlertCooldownMinutes))
            {
                return;
            }

            var exceedance = reading.IndoorTemperature - settings.HighIndoorTempThreshold;
            var severity = exceedance > 5.0 ? "CRITICAL" : "WARNING";

            var details = new
            {
                CurrentTemp = reading.IndoorTemperature,
                Threshold = settings.HighIndoorTempThreshold,
                Exceedance = exceedance,
                Timestamp = reading.Timestamp
            };

            var alarm = new Alarm
            {
                Type = "HIGH_INDOOR_TEMP",
                Severity = severity,
                Message = $"High indoor temperature in {building.Name}: {reading.IndoorTemperature:F1}°C (threshold: {settings.HighIndoorTempThreshold}°C)",
                Details = JsonSerializer.Serialize(details),
                BuildingId = building.Id,
                CreatedAt = DateTime.UtcNow,
                IsActive = true,
                IsAcknowledged = false
            };

            await _alarmRepo.CreateAsync(alarm);
            _logger.LogWarning($"🚨 Created HIGH_INDOOR_TEMP alarm for building {building.Id} ({building.Name})");
        }

        private async Task CheckLowIndoorTempAlarm(BuildingObject building, BuildingReading reading, AlarmSettings settings)
        {
            if (await _alarmRepo.ExistsRecentAlarmAsync("LOW_INDOOR_TEMP", building.Id, settings.AlertCooldownMinutes))
            {
                return;
            }

            var shortfall = settings.LowIndoorTempThreshold - reading.IndoorTemperature;
            var severity = shortfall > 3.0 ? "CRITICAL" : "WARNING";

            var details = new
            {
                CurrentTemp = reading.IndoorTemperature,
                Threshold = settings.LowIndoorTempThreshold,
                Shortfall = shortfall,
                Timestamp = reading.Timestamp
            };

            var alarm = new Alarm
            {
                Type = "LOW_INDOOR_TEMP",
                Severity = severity,
                Message = $"Low indoor temperature in {building.Name}: {reading.IndoorTemperature:F1}°C (threshold: {settings.LowIndoorTempThreshold}°C)",
                Details = JsonSerializer.Serialize(details),
                BuildingId = building.Id,
                CreatedAt = DateTime.UtcNow,
                IsActive = true,
                IsAcknowledged = false
            };

            await _alarmRepo.CreateAsync(alarm);
            _logger.LogWarning($"🚨 Created LOW_INDOOR_TEMP alarm for building {building.Id} ({building.Name})");
        }

        private async Task CheckHighOutdoorTempAlarm(BuildingObject building, BuildingReading reading, AlarmSettings settings)
        {
            if (await _alarmRepo.ExistsRecentAlarmAsync("HIGH_OUTDOOR_TEMP", building.Id, settings.AlertCooldownMinutes))
            {
                return;
            }

            var details = new
            {
                CurrentTemp = reading.OutdoorTemperature,
                Threshold = settings.HighOutdoorTempThreshold,
                Timestamp = reading.Timestamp
            };

            var alarm = new Alarm
            {
                Type = "HIGH_OUTDOOR_TEMP",
                Severity = "INFO",
                Message = $"Extreme outdoor heat in {building.Name}: {reading.OutdoorTemperature:F1}°C",
                Details = JsonSerializer.Serialize(details),
                BuildingId = building.Id,
                CreatedAt = DateTime.UtcNow,
                IsActive = true,
                IsAcknowledged = false
            };

            await _alarmRepo.CreateAsync(alarm);
            _logger.LogInformation($"🚨 Created HIGH_OUTDOOR_TEMP alarm for building {building.Id} ({building.Name})");
        }

        private async Task CheckLowOutdoorTempAlarm(BuildingObject building, BuildingReading reading, AlarmSettings settings)
        {
            if (await _alarmRepo.ExistsRecentAlarmAsync("LOW_OUTDOOR_TEMP", building.Id, settings.AlertCooldownMinutes))
            {
                return;
            }

            var details = new
            {
                CurrentTemp = reading.OutdoorTemperature,
                Threshold = settings.LowOutdoorTempThreshold,
                Timestamp = reading.Timestamp
            };

            var alarm = new Alarm
            {
                Type = "LOW_OUTDOOR_TEMP",
                Severity = "WARNING",
                Message = $"Extreme outdoor cold in {building.Name}: {reading.OutdoorTemperature:F1}°C",
                Details = JsonSerializer.Serialize(details),
                BuildingId = building.Id,
                CreatedAt = DateTime.UtcNow,
                IsActive = true,
                IsAcknowledged = false
            };

            await _alarmRepo.CreateAsync(alarm);
            _logger.LogWarning($"🚨 Created LOW_OUTDOOR_TEMP alarm for building {building.Id} ({building.Name})");
        }

        private async Task CheckHighCostAlarm(BuildingObject building, BuildingReading reading, AlarmSettings settings)
        {
            if (await _alarmRepo.ExistsRecentAlarmAsync("HIGH_DAILY_COST", building.Id, settings.AlertCooldownMinutes))
            {
                return;
            }

            var details = new
            {
                DailyCost = reading.DailyCostEur,
                Threshold = settings.HighDailyCostThreshold,
                Timestamp = reading.Timestamp
            };

            var alarm = new Alarm
            {
                Type = "HIGH_DAILY_COST",
                Severity = "INFO",
                Message = $"High heating cost in {building.Name}: €{reading.DailyCostEur:F2}/day (threshold: €{settings.HighDailyCostThreshold:F2})",
                Details = JsonSerializer.Serialize(details),
                BuildingId = building.Id,
                CreatedAt = DateTime.UtcNow,
                IsActive = true,
                IsAcknowledged = false
            };

            await _alarmRepo.CreateAsync(alarm);
            _logger.LogInformation($"🚨 Created HIGH_DAILY_COST alarm for building {building.Id} ({building.Name})");
        }

        #endregion

        #region Helpers

        private AlarmDto MapToDto(Alarm alarm)
        {
            return new AlarmDto
            {
                Id = alarm.Id,
                Type = alarm.Type,
                Severity = alarm.Severity,
                Message = alarm.Message,
                Details = alarm.Details,
                CreatedAt = alarm.CreatedAt,
                AcknowledgedAt = alarm.AcknowledgedAt,
                ResolvedAt = alarm.ResolvedAt,
                IsActive = alarm.IsActive,
                IsAcknowledged = alarm.IsAcknowledged,
                BuildingId = alarm.BuildingId,
                BuildingName = alarm.Building?.Name ?? "Unknown"
            };
        }

        #endregion
    }
}
