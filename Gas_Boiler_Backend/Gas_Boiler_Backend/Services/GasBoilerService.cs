using Gas_Boiler_Backend.DTO.Boiler;
using Gas_Boiler_Backend.Interfaces;
using Gas_Boiler_Backend.Models;

namespace Gas_Boiler_Backend.Services
{
    public class GasBoilerService : IGasBoilerService
    {
        private readonly IGasBoilerRepository _repository;
        public GasBoilerService(IGasBoilerRepository repository)
        {
            _repository = repository;
        }
        public async Task<GasBoilerResponseDto> CreateAsync(GasBoilerCreateDto dto, int ownerUserId)
        {
            var gb = new GasBoiler
            {
                Name = dto.Name,
                MaxPower = dto.MaxPower,
                Efficiency = dto.Efficiency,
                CurrentPower = dto.CurrentPower,
                UserId = ownerUserId,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };

            gb.BuildingObject = new BuildingObject
            {
                HeatingArea = dto.BuildingObject.HeatingArea,
                DesiredTemperature = dto.BuildingObject.DesiredTemperature,
                WallUValue = dto.BuildingObject.WallUValue,
                WindowUValue = dto.BuildingObject.WindowUValue,
                CeilingUValue = dto.BuildingObject.CeilingUValue,
                FloorUValue = dto.BuildingObject.FloorUValue,
                WallArea = dto.BuildingObject.WallArea,
                WindowArea = dto.BuildingObject.WindowArea,
                CeilingArea = dto.BuildingObject.CeilingArea,
                FloorArea = dto.BuildingObject.FloorArea,
                Latitude = dto.BuildingObject.Latitude,
                Longitude = dto.BuildingObject.Longitude
            };

            await _repository.AddAsync(gb);
            await _repository.SaveChangesAsync();

            return MapToDto(gb);
        }

        public async Task<bool> DeleteAsync(int id, int requestingUserId, bool isAdmin)
        {
            var gb = await _repository.GetByIdAsync(id);
            if (gb == null) return false;
            if (!isAdmin && gb.UserId != requestingUserId) return false;

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

        public async Task<GasBoilerResponseDto?> UpdateAsync(int id, GasBoilerUpdateDto dto, int requestingUserId, bool isAdmin)
        {
            var gb = await _repository.GetByIdAsync(id);
            if (gb == null) return null;
            if (!isAdmin && gb.UserId != requestingUserId) return null;

            gb.Name = dto.Name;
            gb.MaxPower = dto.MaxPower;
            gb.Efficiency = dto.Efficiency;
            gb.CurrentPower = dto.CurrentPower;
            gb.UpdatedAt = DateTime.UtcNow;

            if (dto.BuildingObject != null)
            {
                if (gb.BuildingObject == null)
                {
                    gb.BuildingObject = new BuildingObject();
                }
                gb.BuildingObject.HeatingArea = dto.BuildingObject.HeatingArea;
                gb.BuildingObject.DesiredTemperature = dto.BuildingObject.DesiredTemperature;
                gb.BuildingObject.WallUValue = dto.BuildingObject.WallUValue;
                gb.BuildingObject.WindowUValue = dto.BuildingObject.WindowUValue;
                gb.BuildingObject.CeilingUValue = dto.BuildingObject.CeilingUValue;
                gb.BuildingObject.FloorUValue = dto.BuildingObject.FloorUValue;
                gb.BuildingObject.WallArea = dto.BuildingObject.WallArea;
                gb.BuildingObject.WindowArea = dto.BuildingObject.WindowArea;
                gb.BuildingObject.CeilingArea = dto.BuildingObject.CeilingArea;
                gb.BuildingObject.FloorArea = dto.BuildingObject.FloorArea;
                gb.BuildingObject.Latitude = dto.BuildingObject.Latitude;
                gb.BuildingObject.Longitude = dto.BuildingObject.Longitude;
            }

            await _repository.UpdateAsync(gb);
            await _repository.SaveChangesAsync();
            return MapToDto(gb);
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
