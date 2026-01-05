using Gas_Boiler_Backend.Models;

namespace Gas_Boiler_Backend.Interfaces
{
    public interface IBuildingObjectRepository
    {
        Task<BuildingObject?> GetByIdAsync(int id);
        Task<BuildingObject?> GetByIdWithBoilersAsync(int id);  // Include related boilers
        Task<IEnumerable<BuildingObject>> GetAllAsync();
        Task<IEnumerable<BuildingObject>> GetByUserIdAsync(int userId);
        Task<IEnumerable<BuildingObject>> GetByUserIdWithBoilersAsync(int userId);  // Include boilers
        Task AddAsync(BuildingObject buildingObject);
        Task UpdateAsync(BuildingObject buildingObject);
        Task DeleteAsync(BuildingObject buildingObject);
        Task<bool> ExistsAsync(int id);
        Task<bool> UserOwnsBuilding(int buildingId, int userId);
        Task SaveChangesAsync();
    }
}