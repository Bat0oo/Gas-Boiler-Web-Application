using Gas_Boiler_Backend.DTO.Boiler;

namespace Gas_Boiler_Backend.Interfaces
{
    public interface IGasBoilerService
    {
        Task<GasBoilerDto?> GetByIdAsync(int id, int requestingUserId, bool isAdmin);
        Task<IEnumerable<GasBoilerDto>> GetAllForUserAsync(int userId);
        Task<IEnumerable<GasBoilerDto>> GetAllAsync(); // admin
        Task<GasBoilerDto> CreateAsync(GasBoilerCreateDto dto, int ownerUserId);
        Task<GasBoilerDto?> UpdateAsync(int id, GasBoilerUpdateDto dto, int requestingUserId, bool isAdmin);
        Task<bool> DeleteAsync(int id, int requestingUserId, bool isAdmin);
        Task<IEnumerable<object>> GetMapPointsForUserAsync(int userId);
        Task<IEnumerable<object>> GetMapPointsAllAsync();
    }
}
