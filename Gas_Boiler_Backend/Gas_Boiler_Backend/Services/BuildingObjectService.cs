using Gas_Boiler_Backend.DTO.Building;
using Gas_Boiler_Backend.Interfaces;
using Gas_Boiler_Backend.Models;

namespace Gas_Boiler_Backend.Services
{
    public class BuildingObjectService : IBuildingObjectService
    {
        private readonly IBuildingObjectRepository _repository;
        private readonly ISystemParametersRepository _systemParametersRepository;
        private readonly IWeatherService _weatherService;

        public BuildingObjectService(
            IBuildingObjectRepository repository,
            ISystemParametersRepository systemParametersRepository,
            IWeatherService weatherService)
        {
            _repository = repository;
            _systemParametersRepository = systemParametersRepository;
            _weatherService = weatherService;
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

            WeatherInfo? weather = null;
            try
            {
                weather = await _weatherService.GetWeatherInfoAsync(building.Latitude, building.Longitude);
            }
            catch (Exception ex)
            {
                // Log error but continue (weather is optional)
                Console.WriteLine($"Failed to fetch weather: {ex.Message}");
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
                }).ToList(),

                CurrentTemperature = weather?.Temperature,
                WeatherDescription = weather?.Description ?? string.Empty,
                WeatherIcon = weather?.Icon ?? string.Empty
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

        public async Task<BuildingObjectResponseDto> CreateBuildingAsync(BuildingObjectCreateDto dto, int userId)
        {
            // Fetch system parameters from database
            var sysParams = await _systemParametersRepository.GetAsync();
            if (sysParams == null)
            {
                throw new InvalidOperationException("System parameters not found. Please ensure database is properly initialized.");
            }

            // Auto-calculate perimeter (assuming approximately square building)
            var perimeter = 4 * Math.Sqrt(dto.HeatingArea);

            // Auto-calculate surface areas
            var wallArea = perimeter * dto.Height;
            var windowArea = wallArea * 0.15; // 15% of wall area is windows (default ratio)
            var ceilingArea = dto.HeatingArea;
            var floorArea = dto.HeatingArea;

            var building = new BuildingObject
            {
                Name = dto.Name,
                UserId = userId,
                Latitude = dto.Latitude,
                Longitude = dto.Longitude,
                HeatingArea = dto.HeatingArea,
                Height = dto.Height,
                DesiredTemperature = dto.DesiredTemperature,

                // U-values from SystemParameters
                WallUValue = (double)sysParams.WallUValue,
                WindowUValue = (double)sysParams.WindowUValue,
                CeilingUValue = (double)sysParams.CeilingUValue,
                FloorUValue = (double)sysParams.FloorUValue,

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

            // Block admin from updating - admins can only view
            if (isAdmin)
            {
                throw new UnauthorizedAccessException("Administrators cannot modify buildings");
            }

            // Check ownership for regular users
            if (building.UserId != userId)
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

            // Block admin from deleting - admins can only view
            if (isAdmin)
            {
                return false;
            }

            // Check ownership for regular users
            if (building.UserId != userId)
            {
                return false;
            }

            await _repository.DeleteAsync(building);
            await _repository.SaveChangesAsync();
            return true;
        }
    }
}