using Gas_Boiler_Backend.DTO.DataManagement;

namespace Gas_Boiler_Backend.Interfaces
{
    public interface IDataManagementService
    {
        Task<DataManagementSettingsDto> GetSettingsAsync();
        Task<DataManagementSettingsDto> UpdateSettingsAsync(UpdateDataManagementSettingsDto dto, string updatedBy);
        Task<DataStatisticsDto> GetStatisticsAsync();
        Task<byte[]> ExportDataAsCsvAsync();
        Task<byte[]> ExportUserDataAsCsvAsync(int userId); 
    }
}