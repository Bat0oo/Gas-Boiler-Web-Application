using Gas_Boiler_Backend.DTO.Building;
using Gas_Boiler_Backend.Interfaces;
using Gas_Boiler_Backend.Models;

namespace Gas_Boiler_Backend.Services
{
    public class BuildingObjectService : IBuildingObjectService
    {
        private readonly IBuildingObjectRepository _repository;
        private readonly IBuildingReadingRepository _readingRepository;
        private readonly ISystemParametersRepository _systemParametersRepository;
        private readonly IWeatherService _weatherService;

        public BuildingObjectService(
            IBuildingObjectRepository repository,
            IBuildingReadingRepository readingRepository,
            ISystemParametersRepository systemParametersRepository,
            IWeatherService weatherService)
        {
            _repository = repository;
            _readingRepository = readingRepository;
            _systemParametersRepository = systemParametersRepository;
            _weatherService = weatherService;
        }

        public async Task<IEnumerable<BuildingObjectResponseDto>> GetAllBuildingsAsync(int userId, bool isAdmin)
        {
            var buildings = isAdmin
                ? await _repository.GetAllAsync()
                : await _repository.GetByUserIdAsync(userId);

            var dtos = new List<BuildingObjectResponseDto>();

            foreach (var b in buildings)
            {
                var latestReading = await _readingRepository.GetLatestByBuildingIdAsync(b.Id);

                dtos.Add(new BuildingObjectResponseDto
                {
                    Id = b.Id,
                    Name = b.Name,
                    UserId = b.UserId,
                    Latitude = b.Latitude,
                    Longitude = b.Longitude,
                    HeatingArea = b.HeatingArea,
                    Height = b.Height,
                    Volume = b.Volume,
                    WallUValue = b.WallUValue,
                    WindowUValue = b.WindowUValue,
                    CeilingUValue = b.CeilingUValue,
                    FloorUValue = b.FloorUValue,
                    WallArea = b.WallArea,
                    WindowArea = b.WindowArea,
                    CeilingArea = b.CeilingArea,
                    FloorArea = b.FloorArea,
                    BoilerCount = b.GasBoilers.Count,

                    DesiredTemperature = b.DesiredTemperature,
                    CurrentTemperature = latestReading?.OutdoorTemperature,
                    IndoorTemperature = latestReading?.IndoorTemperature
                });
            }

            return dtos;
        }

        public async Task<BuildingObjectDetailDto?> GetBuildingByIdAsync(int id, int userId, bool isAdmin)
        {
            var building = await _repository.GetByIdWithBoilersAsync(id);
            if (building == null)
            {
                return null;
            }

            if (!isAdmin && building.UserId != userId)
            {
                return null;
            }

            var latestReading = await _readingRepository.GetLatestByBuildingIdAsync(id);

            WeatherInfo? weather = null;
            try
            {
                weather = await _weatherService.GetWeatherInfoAsync(building.Latitude, building.Longitude);
            }
            catch (Exception ex)
            {
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

                IndoorTemperature = latestReading?.IndoorTemperature,

                CurrentTemperature = weather?.Temperature,
                WeatherDescription = weather?.Description ?? string.Empty,
                WeatherIcon = weather?.Icon ?? string.Empty
            };
        }

        public async Task<IEnumerable<BuildingMapPointDto>> GetMapPointsAsync(int userId, bool isAdmin)
        {
            var buildings = isAdmin
                ? await _repository.GetAllAsync()
                : await _repository.GetByUserIdAsync(userId);

            var dtos = new List<BuildingMapPointDto>();

            foreach (var b in buildings)
            {
                var latestReading = await _readingRepository.GetLatestByBuildingIdAsync(b.Id);

                dtos.Add(new BuildingMapPointDto
                {
                    Id = b.Id,
                    Name = b.Name,
                    Latitude = b.Latitude,
                    Longitude = b.Longitude,
                    BoilerCount = b.GasBoilers.Count,
                    TotalMaxPower = b.GasBoilers.Sum(gb => gb.MaxPower),
                    TotalCurrentPower = b.GasBoilers.Sum(gb => gb.CurrentPower),

                    IndoorTemperature = latestReading?.IndoorTemperature,
                    CurrentTemperature = latestReading?.OutdoorTemperature,
                    DesiredTemperature = b.DesiredTemperature
                });
            }

            return dtos;
        }

        public async Task<BuildingObjectResponseDto> CreateBuildingAsync(BuildingObjectCreateDto dto, int userId)
        {
            var sysParams = await _systemParametersRepository.GetAsync();
            if (sysParams == null)
            {
                throw new InvalidOperationException("System parameters not found. Please ensure database is properly initialized.");
            }

            var perimeter = 4 * Math.Sqrt(dto.HeatingArea);

            var wallArea = perimeter * dto.Height;
            var windowArea = wallArea * (double)sysParams.WindowToWallRatio;
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

                WallUValue = (double)sysParams.WallUValue,
                WindowUValue = (double)sysParams.WindowUValue,
                CeilingUValue = (double)sysParams.CeilingUValue,
                FloorUValue = (double)sysParams.FloorUValue,

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
                BoilerCount = 0,
                IndoorTemperature = null // New building, no readings yet
            };
        }

        public async Task<BuildingObjectResponseDto> UpdateBuildingAsync(int id, BuildingObjectUpdateDto dto, int userId, bool isAdmin)
        {
            var building = await _repository.GetByIdAsync(id);

            if (building == null)
            {
                throw new KeyNotFoundException($"Building with ID {id} not found");
            }

            if (isAdmin)
            {
                throw new UnauthorizedAccessException("Administrators cannot modify buildings");
            }

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

            var latestReading = await _readingRepository.GetLatestByBuildingIdAsync(id);

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
                BoilerCount = building.GasBoilers.Count,

                IndoorTemperature = latestReading?.IndoorTemperature
            };
        }

        public async Task<bool> DeleteBuildingAsync(int id, int userId, bool isAdmin)
        {
            var building = await _repository.GetByIdAsync(id);

            if (building == null)
            {
                return false;
            }

            if (isAdmin)
            {
                return false;
            }

            if (building.UserId != userId)
            {
                return false;
            }

            await _repository.DeleteAsync(building);
            await _repository.SaveChangesAsync();
            return true;
        }

        public async Task<BuildingObjectResponseDto?> UpdateDesiredTemperatureAsync(int id, double desiredTemperature, int userId)
        {
            var building = await _repository.GetByIdAsync(id);

            if (building == null || building.UserId != userId)
                return null;

            building.DesiredTemperature = desiredTemperature;

            await _repository.UpdateAsync(building);
            await _repository.SaveChangesAsync();

            var latestReading = await _readingRepository.GetLatestByBuildingIdAsync(id);

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
                BoilerCount = building.GasBoilers.Count,
                IndoorTemperature = latestReading?.IndoorTemperature
            };
        }

        public async Task<BuildingObject?> GetBuildingEntityAsync(int buildingId, int userId, bool isAdmin)
        {
            var building = await _repository.GetByIdAsync(buildingId);

            if (building == null)
                return null;

            if (!isAdmin && building.UserId != userId)
                return null;

            return building;
        }
    }
}