using Gas_Boiler_Backend.Models;

namespace Gas_Boiler_Backend.Interfaces
{
    public interface IDataManagementSettingsRepository
    {
        Task<DataManagementSettings?> GetAsync();
        Task<DataManagementSettings> UpdateAsync(DataManagementSettings settings);
        Task<DataManagementSettings> CreateDefaultAsync();
    }
}
