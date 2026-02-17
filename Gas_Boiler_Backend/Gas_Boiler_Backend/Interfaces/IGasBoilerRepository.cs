using Gas_Boiler_Backend.Models;

namespace Gas_Boiler_Backend.Interfaces
{
    public interface IGasBoilerRepository
    {
        Task<GasBoiler?> GetByIdAsync(int id);
        Task<IEnumerable<GasBoiler>> GetAllForUserAsync(int userId);
        Task<IEnumerable<GasBoiler>> GetAllAsync(); // only for admin
        Task<IEnumerable<GasBoiler>> GetByBuildingIdAsync(int buildingId);
        Task AddAsync(GasBoiler gasBoiler);
        Task UpdateAsync(GasBoiler gasBoiler);
        Task DeleteAsync(GasBoiler gasBoiler);
        Task SaveChangesAsync();
        Task<bool> ExistsAsync(int id);
        Task<IEnumerable<(int BoilerId, double Lat, double Lon, string Name, double CurrentPower)>> GetMapPointsForUserAsync(int userId);
        Task<IEnumerable<(int BoilerId, double Lat, double Lon, string Name, double CurrentPower)>> GetMapPointsAllAsync();

    }
}
