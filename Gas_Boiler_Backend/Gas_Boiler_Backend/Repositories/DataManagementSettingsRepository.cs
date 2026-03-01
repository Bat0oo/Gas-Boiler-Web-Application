using Gas_Boiler_Backend.Data;
using Gas_Boiler_Backend.Models;
using Microsoft.EntityFrameworkCore;
using Gas_Boiler_Backend.Interfaces;

namespace Gas_Boiler_Backend.Repositories
{
    public class DataManagementSettingsRepository: IDataManagementSettingsRepository
    {
        private readonly AppDbContext _context;

        public DataManagementSettingsRepository(AppDbContext context)
        {
            _context = context;
        }

        public async Task<DataManagementSettings?> GetAsync()
        {
            var settings = await _context.DataManagementSettings.FirstOrDefaultAsync();

            if (settings == null)
            {
                settings = await CreateDefaultAsync();
            }

            return settings;
        }

        public async Task<DataManagementSettings> UpdateAsync(DataManagementSettings settings)
        {
            _context.DataManagementSettings.Update(settings);
            await _context.SaveChangesAsync();
            return settings;
        }

        public async Task<DataManagementSettings> CreateDefaultAsync()
        {
            var settings = new DataManagementSettings
            {
                RecordingIntervalMinutes = 60, // Default 1 hour
                LastUpdated = DateTime.UtcNow,
                UpdatedBy = "System"
            };

            _context.DataManagementSettings.Add(settings);
            await _context.SaveChangesAsync();

            return settings;
        }
    }
}
