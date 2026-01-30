using Gas_Boiler_Backend.Models;

namespace Gas_Boiler_Backend.Interfaces
{
    public interface IAlarmSettingsRepository
    {
        Task<AlarmSettings?> GetAsync();
        Task<AlarmSettings> UpdateAsync(AlarmSettings settings);
        Task<AlarmSettings> CreateDefaultAsync();
    }
}
