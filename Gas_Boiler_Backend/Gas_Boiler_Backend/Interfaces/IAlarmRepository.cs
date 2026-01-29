using Gas_Boiler_Backend.DTO.Alarms;
using Gas_Boiler_Backend.Models;

namespace Gas_Boiler_Backend.Interfaces
{
    public interface IAlarmRepository
    {
        Task<Alarm> CreateAsync(Alarm alarm);
        Task<Alarm?> GetByIdAsync(int id);
        Task<IEnumerable<Alarm>> GetAllAsync(AlarmFiltersDto? filters = null);
        Task<IEnumerable<Alarm>> GetActiveAlarmsAsync(int? userId = null);
        Task<Alarm?> UpdateAsync(Alarm alarm);
        Task<bool> DeleteAsync(int id);
        Task<int> GetCountAsync(AlarmFiltersDto? filters = null);
        Task<bool> ExistsRecentAlarmAsync(string type, int buildingId, int cooldownMinutes);
    }
}
