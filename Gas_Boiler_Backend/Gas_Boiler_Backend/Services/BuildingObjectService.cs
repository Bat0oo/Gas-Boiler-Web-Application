using Gas_Boiler_Backend.DTO.Building;
using Gas_Boiler_Backend.Interfaces;
using Gas_Boiler_Backend.Models;

namespace Gas_Boiler_Backend.Services
{
    public class BuildingObjectService : IBuildingObjectService
    {
        private readonly IBuildingObjectRepository _buildingRepo;

        public BuildingObjectService(IBuildingObjectRepository buildingRepo)
        {
            _buildingRepo = buildingRepo;
        }

        public async Task<IEnumerable<BuildingObjectResponseDto>> GetAllBuildingsAsync(int userId, bool isAdmin)
        {
            IEnumerable<BuildingObject> buildings;

            if (isAdmin)
            {
                buildings = await _buildingRepo.GetAllAsync();
            }
            else
            {
                buildings = await _buildingRepo.GetByUserIdWithBoilersAsync(userId);
            }

            return buildings.Select(b => new BuildingObjectResponseDto
            {
                Id = b.Id,
                Name = b.Name,
                UserId = b.UserId,
                Latitude = b.Latitude,
                Longitude = b.Longitude,
                HeatingArea = b.HeatingArea,
                DesiredTemperature = b.DesiredTemperature,
                WallUValue = b.WallUValue,
                WindowUValue = b.WindowUValue,
                CeilingUValue = b.CeilingUValue,
                FloorUValue = b.FloorUValue,
                WallArea = b.WallArea,
                WindowArea = b.WindowArea,
                CeilingArea = b.CeilingArea,
                FloorArea = b.FloorArea,
                BoilerCount = b.GasBoilers?.Count ?? 0
            });
        }

        public async Task<BuildingObjectDetailDto?> GetBuildingByIdAsync(int id, int userId, bool isAdmin)
        {
            var building = await _buildingRepo.GetByIdWithBoilersAsync(id);

            if (building == null)
                return null;

            // Authorization check
            if (!isAdmin && building.UserId != userId)
                return null;

            return new BuildingObjectDetailDto
            {
                Id = building.Id,
                Name = building.Name,
                UserId = building.UserId,
                Latitude = building.Latitude,
                Longitude = building.Longitude,
                HeatingArea = building.HeatingArea,
                DesiredTemperature = building.DesiredTemperature,
                WallUValue = building.WallUValue,
                WindowUValue = building.WindowUValue,
                CeilingUValue = building.CeilingUValue,
                FloorUValue = building.FloorUValue,
                WallArea = building.WallArea,
                WindowArea = building.WindowArea,
                CeilingArea = building.CeilingArea,
                FloorArea = building.FloorArea,
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
            IEnumerable<BuildingObject> buildings;

            if (isAdmin)
            {
                buildings = await _buildingRepo.GetAllAsync();
            }
            else
            {
                buildings = await _buildingRepo.GetByUserIdWithBoilersAsync(userId);
            }

            return buildings.Select(b => new BuildingMapPointDto
            {
                Id = b.Id,
                Name = b.Name,
                Latitude = b.Latitude,
                Longitude = b.Longitude,
                BoilerCount = b.GasBoilers?.Count ?? 0,
                TotalMaxPower = b.GasBoilers?.Sum(gb => gb.MaxPower) ?? 0,
                TotalCurrentPower = b.GasBoilers?.Sum(gb => gb.CurrentPower) ?? 0
            });
        }

        public async Task<BuildingObjectResponseDto> CreateBuildingAsync(BuildingObjectCreateDto dto, int userId)
        {
            var building = new BuildingObject
            {
                Name = dto.Name,
                UserId = userId,  // Set the owner
                Latitude = dto.Latitude,
                Longitude = dto.Longitude,
                HeatingArea = dto.HeatingArea,
                DesiredTemperature = dto.DesiredTemperature,
                WallUValue = dto.WallUValue,
                WindowUValue = dto.WindowUValue,
                CeilingUValue = dto.CeilingUValue,
                FloorUValue = dto.FloorUValue,
                WallArea = dto.WallArea,
                WindowArea = dto.WindowArea,
                CeilingArea = dto.CeilingArea,
                FloorArea = dto.FloorArea
            };

            await _buildingRepo.AddAsync(building);
            await _buildingRepo.SaveChangesAsync();

            return new BuildingObjectResponseDto
            {
                Id = building.Id,
                Name = building.Name,
                UserId = building.UserId,
                Latitude = building.Latitude,
                Longitude = building.Longitude,
                HeatingArea = building.HeatingArea,
                DesiredTemperature = building.DesiredTemperature,
                WallUValue = building.WallUValue,
                WindowUValue = building.WindowUValue,
                CeilingUValue = building.CeilingUValue,
                FloorUValue = building.FloorUValue,
                WallArea = building.WallArea,
                WindowArea = building.WindowArea,
                CeilingArea = building.CeilingArea,
                FloorArea = building.FloorArea,
                BoilerCount = 0  // New building has no boilers yet
            };
        }

        public async Task<BuildingObjectResponseDto> UpdateBuildingAsync(int id, BuildingObjectUpdateDto dto, int userId, bool isAdmin)
        {
            var building = await _buildingRepo.GetByIdAsync(id);

            if (building == null)
                throw new KeyNotFoundException($"Building with ID {id} not found");

            // Authorization check
            if (!isAdmin && building.UserId != userId)
                throw new UnauthorizedAccessException("You don't have permission to update this building");

            // Update properties
            building.Name = dto.Name;
            building.Latitude = dto.Latitude;
            building.Longitude = dto.Longitude;
            building.HeatingArea = dto.HeatingArea;
            building.DesiredTemperature = dto.DesiredTemperature;
            building.WallUValue = dto.WallUValue;
            building.WindowUValue = dto.WindowUValue;
            building.CeilingUValue = dto.CeilingUValue;
            building.FloorUValue = dto.FloorUValue;
            building.WallArea = dto.WallArea;
            building.WindowArea = dto.WindowArea;
            building.CeilingArea = dto.CeilingArea;
            building.FloorArea = dto.FloorArea;

            await _buildingRepo.UpdateAsync(building);
            await _buildingRepo.SaveChangesAsync();

            // Get boiler count
            var buildingWithBoilers = await _buildingRepo.GetByIdWithBoilersAsync(id);

            return new BuildingObjectResponseDto
            {
                Id = building.Id,
                Name = building.Name,
                UserId = building.UserId,
                Latitude = building.Latitude,
                Longitude = building.Longitude,
                HeatingArea = building.HeatingArea,
                DesiredTemperature = building.DesiredTemperature,
                WallUValue = building.WallUValue,
                WindowUValue = building.WindowUValue,
                CeilingUValue = building.CeilingUValue,
                FloorUValue = building.FloorUValue,
                WallArea = building.WallArea,
                WindowArea = building.WindowArea,
                CeilingArea = building.CeilingArea,
                FloorArea = building.FloorArea,
                BoilerCount = buildingWithBoilers?.GasBoilers?.Count ?? 0
            };
        }

        public async Task<bool> DeleteBuildingAsync(int id, int userId, bool isAdmin)
        {
            var building = await _buildingRepo.GetByIdAsync(id);

            if (building == null)
                return false;

            // Authorization check
            if (!isAdmin && building.UserId != userId)
                throw new UnauthorizedAccessException("You don't have permission to delete this building");

            // Delete will cascade to all boilers in this building (configured in AppDbContext)
            await _buildingRepo.DeleteAsync(building);
            await _buildingRepo.SaveChangesAsync();
            return true;
        }
    }
}