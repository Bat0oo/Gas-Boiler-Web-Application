using Gas_Boiler_Backend.Data;
using Gas_Boiler_Backend.Interfaces;
using Gas_Boiler_Backend.Models;
using Microsoft.EntityFrameworkCore;

namespace Gas_Boiler_Backend.Repositories
{
    public class AlarmSettingsRepository : IAlarmSettingsRepository
    {
        private readonly AppDbContext _context;

        public AlarmSettingsRepository(AppDbContext context)
        {
            _context = context;
        }

        public async Task<AlarmSettings?> GetAsync()
        {
            return await _context.AlarmSettings.FirstOrDefaultAsync();
        }

        public async Task<AlarmSettings> UpdateAsync(AlarmSettings settings)
        {
            settings.LastUpdated = DateTime.UtcNow;
            _context.AlarmSettings.Update(settings);
            await _context.SaveChangesAsync();
            return settings;
        }

        public async Task<AlarmSettings> CreateDefaultAsync()
        {
            var settings = new AlarmSettings
            {
                HighIndoorTempThreshold = 28.0,
                LowIndoorTempThreshold = 18.0,
                HighOutdoorTempThreshold = 35.0,
                LowOutdoorTempThreshold = -15.0,
                HighDailyCostThreshold = 50.0,
                CapacityDeficitThreshold = 0.0,
                AlertCooldownMinutes = 60,
                CapacityAlertsEnabled = true,
                HighIndoorTempAlertsEnabled = true,
                LowIndoorTempAlertsEnabled = true,
                HighOutdoorTempAlertsEnabled = true,
                LowOutdoorTempAlertsEnabled = true,
                HighCostAlertsEnabled = false,
                LastUpdated = DateTime.UtcNow,
                UpdatedBy = "System"
            };

            _context.AlarmSettings.Add(settings);
            await _context.SaveChangesAsync();
            return settings;
        }
    }
}
