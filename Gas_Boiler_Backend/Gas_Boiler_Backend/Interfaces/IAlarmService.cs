using Gas_Boiler_Backend.DTO.Alarms;

namespace Gas_Boiler_Backend.Interfaces
{
    public interface IAlarmService
    {
        Task<AlarmDto?> GetByIdAsync(int id, int userId, bool isAdmin);
        Task<IEnumerable<AlarmDto>> GetAllAsync(AlarmFiltersDto? filters, int userId, bool isAdmin);
        Task<IEnumerable<AlarmDto>> GetActiveAlarmsAsync(int userId, bool isAdmin);
        Task<AlarmStatsDto> GetStatsAsync(int userId, bool isAdmin);
        Task<AlarmDto?> AcknowledgeAsync(int id, int userId, bool isAdmin);
        Task<AlarmDto?> ResolveAsync(int id, int userId, bool isAdmin);
        Task<bool> DeleteAsync(int id, int userId, bool isAdmin);

        // Alarm Settings
        Task<AlarmSettingsDto> GetSettingsAsync();
        Task<AlarmSettingsDto> UpdateSettingsAsync(UpdateAlarmSettingsDto dto, string updatedBy);

        // Alarm Detection (called by background service)
        Task CheckAndCreateAlarmsAsync();

        Task CheckCapacityAlarmAsync(int buildingId);
    }
}
