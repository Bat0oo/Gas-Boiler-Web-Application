using Gas_Boiler_Backend.DTO.Boiler;
using Gas_Boiler_Backend.Interfaces;
using Gas_Boiler_Backend.Models;

namespace Gas_Boiler_Backend.Services
{
    public class GasBoilerService : IGasBoilerService
    {
        private readonly IGasBoilerRepository _repository;
        private readonly IBuildingObjectRepository _buildingRepo;

        public GasBoilerService(
            IGasBoilerRepository repository,
            IBuildingObjectRepository buildingRepo)
        {
            _repository = repository;
            _buildingRepo = buildingRepo;
        }

        public async Task<GasBoilerResponseDto> CreateAsync(GasBoilerCreateDto dto, int ownerUserId)
        {
            var building = await _buildingRepo.GetByIdAsync(dto.BuildingObjectId);
            if (building == null)
                throw new KeyNotFoundException($"Building with ID {dto.BuildingObjectId} not found");

            if (building.UserId != ownerUserId)
                throw new UnauthorizedAccessException("You don't own this building");

            var gb = new GasBoiler
            {
                Name = dto.Name,
                MaxPower = dto.MaxPower,
                Efficiency = dto.Efficiency,
                CurrentPower = dto.CurrentPower,
                UserId = ownerUserId,
                BuildingObjectId = dto.BuildingObjectId,  // Just link to existing building
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };

            await _repository.AddAsync(gb);
            await _repository.SaveChangesAsync();

            gb.BuildingObject = building;
            return MapToDto(gb);
        }

        public async Task<GasBoilerResponseDto?> UpdateAsync(int id, GasBoilerUpdateDto dto, int requestingUserId, bool isAdmin)
        {
            var gb = await _repository.GetByIdAsync(id);
            if (gb == null) return null;

            // Block admin from updating - admins can only view
            if (isAdmin) return null;

            // Check ownership for regular users
            if (gb.UserId != requestingUserId) return null;

            // Update boiler only (can't change building)
            gb.Name = dto.Name;
            gb.MaxPower = dto.MaxPower;
            gb.Efficiency = dto.Efficiency;
            gb.CurrentPower = dto.CurrentPower;
            gb.UpdatedAt = DateTime.UtcNow;

            await _repository.UpdateAsync(gb);
            await _repository.SaveChangesAsync();
            return MapToDto(gb);
        }

        public async Task<bool> DeleteAsync(int id, int requestingUserId, bool isAdmin)
        {
            var gb = await _repository.GetByIdAsync(id);
            if (gb == null) return false;

            // Block admin from deleting - admins can only view
            if (isAdmin) return false;

            // Check ownership for regular users
            if (gb.UserId != requestingUserId) return false;

            await _repository.DeleteAsync(gb);
            await _repository.SaveChangesAsync();
            return true;
        }

        public async Task<IEnumerable<GasBoilerResponseDto>> GetAllAsync()
        {
            var list = await _repository.GetAllAsync();
            return list.Select(MapToDto);
        }

        public async Task<IEnumerable<GasBoilerResponseDto>> GetAllForUserAsync(int userId)
        {
            var list = await _repository.GetAllForUserAsync(userId);
            return list.Select(MapToDto);
        }

        public async Task<GasBoilerResponseDto?> GetByIdAsync(int id, int requestingUserId, bool isAdmin)
        {
            var gb = await _repository.GetByIdAsync(id);
            if (gb == null) return null;
            if (!isAdmin && gb.UserId != requestingUserId) return null;
            return MapToDto(gb);
        }

        public async Task<IEnumerable<object>> GetMapPointsAllAsync()
        {
            var points = await _repository.GetMapPointsAllAsync();
            return points.Select(p => new
            {
                id = p.BoilerId,
                name = p.Name,
                lat = p.Lat,
                lon = p.Lon,
                currentPower = p.CurrentPower
            });
        }

        public async Task<IEnumerable<object>> GetMapPointsForUserAsync(int userId)
        {
            var points = await _repository.GetMapPointsForUserAsync(userId);
            return points.Select(p => new
            {
                id = p.BoilerId,
                name = p.Name,
                lat = p.Lat,
                lon = p.Lon,
                currentPower = p.CurrentPower
            });
        }

        private GasBoilerResponseDto MapToDto(GasBoiler gb)
        {
            return new GasBoilerResponseDto
            {
                Id = gb.Id,
                Name = gb.Name,
                MaxPower = gb.MaxPower,
                Efficiency = gb.Efficiency,
                CurrentPower = gb.CurrentPower,
                CreatedAt = gb.CreatedAt,
                UpdatedAt = gb.UpdatedAt,
                UserId = gb.UserId,
                UserName = gb.User?.Username ?? string.Empty,
                BuildingObjectId = gb.BuildingObjectId,
                BuildingName = gb.BuildingObject?.Name ?? "Unknown",  
                BuildingObject = gb.BuildingObject == null ? null : new BuildingObjectDto
                {
                    Id = gb.BuildingObject.Id,
                    HeatingArea = gb.BuildingObject.HeatingArea,
                    DesiredTemperature = gb.BuildingObject.DesiredTemperature,
                    WallUValue = gb.BuildingObject.WallUValue,
                    WindowUValue = gb.BuildingObject.WindowUValue,
                    CeilingUValue = gb.BuildingObject.CeilingUValue,
                    FloorUValue = gb.BuildingObject.FloorUValue,
                    WallArea = gb.BuildingObject.WallArea,
                    WindowArea = gb.BuildingObject.WindowArea,
                    CeilingArea = gb.BuildingObject.CeilingArea,
                    FloorArea = gb.BuildingObject.FloorArea,
                    Latitude = gb.BuildingObject.Latitude,
                    Longitude = gb.BuildingObject.Longitude
                }
            };
        }
    }
}