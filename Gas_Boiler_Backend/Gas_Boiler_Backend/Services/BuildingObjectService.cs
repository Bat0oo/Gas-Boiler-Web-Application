using Gas_Boiler_Backend.DTO.Building;
using Gas_Boiler_Backend.Interfaces;
using Gas_Boiler_Backend.Models;

namespace Gas_Boiler_Backend.Services
{
    public class BuildingObjectService : IBuildingObjectService
    {
        private readonly IBuildingObjectRepository _repository;

        public BuildingObjectService(IBuildingObjectRepository repository)
        {
            _repository = repository;
        }

        // Match interface method names!
        public async Task<IEnumerable<BuildingObjectResponseDto>> GetAllBuildingsAsync(int userId, bool isAdmin)
        {
            // Admin sees all buildings, regular users see only theirs
            var buildings = isAdmin
                ? await _repository.GetAllAsync()
                : await _repository.GetByUserIdAsync(userId);

            return buildings.Select(b => new BuildingObjectResponseDto
            {
                Id = b.Id,
                Name = b.Name,
                UserId = b.UserId,
                Latitude = b.Latitude,
                Longitude = b.Longitude,
                HeatingArea = b.HeatingArea,
                Height = b.Height,
                Volume = b.Volume,
                DesiredTemperature = b.DesiredTemperature,
                WallUValue = b.WallUValue,
                WindowUValue = b.WindowUValue,
                CeilingUValue = b.CeilingUValue,
                FloorUValue = b.FloorUValue,
                WallArea = b.WallArea,
                WindowArea = b.WindowArea,
                CeilingArea = b.CeilingArea,
                FloorArea = b.FloorArea,
                BoilerCount = b.GasBoilers.Count
            });
        }

        public async Task<BuildingObjectDetailDto?> GetBuildingByIdAsync(int id, int userId, bool isAdmin)
        {
            var building = await _repository.GetByIdWithBoilersAsync(id);
            if (building == null)
            {
                return null;
            }

            // Check ownership (admins bypass check)
            if (!isAdmin && building.UserId != userId)
            {
                return null;
            }

            return new BuildingObjectDetailDto
            {
                Id = building.Id,
                Name = building.Name,
                UserId = building.UserId,
                Latitude = building.Latitude,
                Longitude = building.Longitude,
                HeatingArea = building.HeatingArea,
                Height = building.Height,
                Volume = building.Volume,
                DesiredTemperature = building.DesiredTemperature,
                WallUValue = building.WallUValue,
                WindowUValue = building.WindowUValue,
                CeilingUValue = building.CeilingUValue,
                FloorUValue = building.FloorUValue,
                WallArea = building.WallArea,
                WindowArea = building.WindowArea,
                CeilingArea = building.CeilingArea,
                FloorArea = building.FloorArea,
                BoilerCount = building.GasBoilers.Count,
                GasBoilers = building.GasBoilers.Select(gb => new BuildingBoilerDto
                {
                    Id = gb.Id,
                    Name = gb.Name,
                    MaxPower = gb.MaxPower,
                    Efficiency = gb.Efficiency,
                    CurrentPower = gb.CurrentPower
                }).ToList()
            };
        }

        public async Task<IEnumerable<BuildingMapPointDto>> GetMapPointsAsync(int userId, bool isAdmin)
        {
            // Admin sees all buildings, regular users see only theirs
            var buildings = isAdmin
                ? await _repository.GetAllAsync()
                : await _repository.GetByUserIdAsync(userId);

            return buildings.Select(b => new BuildingMapPointDto
            {
                Id = b.Id,
                Name = b.Name,
                Latitude = b.Latitude,
                Longitude = b.Longitude,
                BoilerCount = b.GasBoilers.Count,
                TotalMaxPower = b.GasBoilers.Sum(gb => gb.MaxPower),
                TotalCurrentPower = b.GasBoilers.Sum(gb => gb.CurrentPower)
            });
        }

        // ADD THIS METHOD TO BuildingObjectService.cs
        // REPLACE the existing CreateBuildingAsync method with this version

        public async Task<BuildingObjectResponseDto> CreateBuildingAsync(BuildingObjectCreateDto dto, int userId)
        {
            // Auto-calculate perimeter (assuming approximately square building)
            var perimeter = 4 * Math.Sqrt(dto.HeatingArea);

            // Auto-calculate surface areas
            var wallArea = perimeter * dto.Height;
            var windowArea = wallArea * 0.15; // 15% of wall area is windows (default ratio)
            var ceilingArea = dto.HeatingArea;
            var floorArea = dto.HeatingArea;

            // Default U-values (W/m²·K) - standard insulation values
            // These will later come from SystemParameters
            var defaultWallUValue = 0.3;
            var defaultWindowUValue = 1.2;
            var defaultCeilingUValue = 0.25;
            var defaultFloorUValue = 0.5;

            var building = new BuildingObject
            {
                Name = dto.Name,
                UserId = userId,
                Latitude = dto.Latitude,
                Longitude = dto.Longitude,
                HeatingArea = dto.HeatingArea,
                Height = dto.Height,
                DesiredTemperature = dto.DesiredTemperature,

                // Auto-calculated U-values
                WallUValue = defaultWallUValue,
                WindowUValue = defaultWindowUValue,
                CeilingUValue = defaultCeilingUValue,
                FloorUValue = defaultFloorUValue,

                // Auto-calculated surface areas
                WallArea = wallArea,
                WindowArea = windowArea,
                CeilingArea = ceilingArea,
                FloorArea = floorArea
            };

            await _repository.AddAsync(building);
            await _repository.SaveChangesAsync();

            return new BuildingObjectResponseDto
            {
                Id = building.Id,
                Name = building.Name,
                UserId = building.UserId,
                Latitude = building.Latitude,
                Longitude = building.Longitude,
                HeatingArea = building.HeatingArea,
                Height = building.Height,
                Volume = building.Volume,
                DesiredTemperature = building.DesiredTemperature,
                WallUValue = building.WallUValue,
                WindowUValue = building.WindowUValue,
                CeilingUValue = building.CeilingUValue,
                FloorUValue = building.FloorUValue,
                WallArea = building.WallArea,
                WindowArea = building.WindowArea,
                CeilingArea = building.CeilingArea,
                FloorArea = building.FloorArea,
                BoilerCount = 0
            };
        }
        public async Task<BuildingObjectResponseDto> UpdateBuildingAsync(int id, BuildingObjectUpdateDto dto, int userId, bool isAdmin)
        {
            var building = await _repository.GetByIdAsync(id);

            if (building == null)
            {
                throw new KeyNotFoundException($"Building with ID {id} not found");
            }

            // Check ownership (admins bypass check)
            if (!isAdmin && building.UserId != userId)
            {
                throw new UnauthorizedAccessException("You don't have permission to update this building");
            }

            building.Name = dto.Name;
            building.Latitude = dto.Latitude;
            building.Longitude = dto.Longitude;
            building.HeatingArea = dto.HeatingArea;
            building.Height = dto.Height;
            building.DesiredTemperature = dto.DesiredTemperature;
            building.WallUValue = dto.WallUValue;
            building.WindowUValue = dto.WindowUValue;
            building.CeilingUValue = dto.CeilingUValue;
            building.FloorUValue = dto.FloorUValue;
            building.WallArea = dto.WallArea;
            building.WindowArea = dto.WindowArea;
            building.CeilingArea = dto.CeilingArea;
            building.FloorArea = dto.FloorArea;

            await _repository.UpdateAsync(building);
            await _repository.SaveChangesAsync();

            return new BuildingObjectResponseDto
            {
                Id = building.Id,
                Name = building.Name,
                UserId = building.UserId,
                Latitude = building.Latitude,
                Longitude = building.Longitude,
                HeatingArea = building.HeatingArea,
                Height = building.Height,
                Volume = building.Volume,
                DesiredTemperature = building.DesiredTemperature,
                WallUValue = building.WallUValue,
                WindowUValue = building.WindowUValue,
                CeilingUValue = building.CeilingUValue,
                FloorUValue = building.FloorUValue,
                WallArea = building.WallArea,
                WindowArea = building.WindowArea,
                CeilingArea = building.CeilingArea,
                FloorArea = building.FloorArea,
                BoilerCount = building.GasBoilers.Count
            };
        }

        public async Task<bool> DeleteBuildingAsync(int id, int userId, bool isAdmin)
        {
            var building = await _repository.GetByIdAsync(id);

            if (building == null)
            {
                return false;
            }

            // Check ownership (admins bypass check)
            if (!isAdmin && building.UserId != userId)
            {
                return false;
            }

            await _repository.DeleteAsync(building);
            await _repository.SaveChangesAsync();
            return true;
        }
    }
}