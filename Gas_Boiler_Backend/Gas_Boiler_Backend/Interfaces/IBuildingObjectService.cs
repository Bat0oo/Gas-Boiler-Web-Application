using Gas_Boiler_Backend.DTO.Building;
using Gas_Boiler_Backend.Models;

namespace Gas_Boiler_Backend.Interfaces
{
    public interface IBuildingObjectService
    {
        Task<IEnumerable<BuildingObjectResponseDto>> GetAllBuildingsAsync(int userId, bool isAdmin);
        Task<BuildingObjectDetailDto?> GetBuildingByIdAsync(int id, int userId, bool isAdmin);
        Task<IEnumerable<BuildingMapPointDto>> GetMapPointsAsync(int userId, bool isAdmin);
        Task<BuildingObjectResponseDto> CreateBuildingAsync(BuildingObjectCreateDto dto, int userId);
        Task<BuildingObjectResponseDto> UpdateBuildingAsync(int id, BuildingObjectUpdateDto dto, int userId, bool isAdmin);
        Task<bool> DeleteBuildingAsync(int id, int userId, bool isAdmin);
        Task<BuildingObject?> GetBuildingEntityAsync(int buildingId, int userId, bool isAdmin);
    }
}