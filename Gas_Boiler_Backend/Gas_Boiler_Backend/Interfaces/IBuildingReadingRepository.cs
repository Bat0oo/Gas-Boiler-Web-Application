using Gas_Boiler_Backend.Models;

namespace Gas_Boiler_Backend.Interfaces
{
    public interface IBuildingReadingRepository
    {
        Task<BuildingReading> CreateAsync(BuildingReading reading);
        Task<IEnumerable<BuildingReading>> CreateManyAsync(IEnumerable<BuildingReading> readings);

        Task<IEnumerable<BuildingReading>> GetByBuildingIdAsync( int buildingId, DateTime? startDate = null, DateTime? endDate = null);

        Task<IEnumerable<BuildingReading>> GetAllAsync(DateTime? startDate = null, DateTime? endDate = null);

        Task<BuildingReading?> GetLatestByBuildingIdAsync(int buildingId);
        Task<int> GetCountAsync();

        Task DeleteAllAsync();
        Task DeleteByBuildingIdAsync(int buildingId);

        Task UpdateAsync(BuildingReading reading);
        Task SaveChangesAsync();
    }
}