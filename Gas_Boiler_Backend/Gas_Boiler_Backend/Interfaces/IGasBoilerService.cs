using Gas_Boiler_Backend.DTO.Boiler;

namespace Gas_Boiler_Backend.Interfaces
{
    public interface IGasBoilerService
    {
        Task<GasBoilerResponseDto?> GetByIdAsync(int id, int requestingUserId, bool isAdmin);
        Task<IEnumerable<GasBoilerResponseDto>> GetAllForUserAsync(int userId);
        Task<IEnumerable<GasBoilerResponseDto>> GetAllAsync(); // admin
        Task<GasBoilerResponseDto> CreateAsync(GasBoilerCreateDto dto, int ownerUserId);
        Task<GasBoilerResponseDto?> UpdateAsync(int id, GasBoilerUpdateDto dto, int requestingUserId, bool isAdmin);
        Task<bool> DeleteAsync(int id, int requestingUserId, bool isAdmin);
        Task<IEnumerable<object>> GetMapPointsForUserAsync(int userId);
        Task<IEnumerable<object>> GetMapPointsAllAsync();
    }
}
