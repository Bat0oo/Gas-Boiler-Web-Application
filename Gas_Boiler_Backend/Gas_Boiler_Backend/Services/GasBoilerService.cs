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
        public Task<GasBoilerDto> CreateAsync(GasBoilerCreateDto dto, int ownerUserId)
        {
            throw new NotImplementedException();
        }

        public Task<bool> DeleteAsync(int id, int requestingUserId, bool isAdmin)
        {
            throw new NotImplementedException();
        }

        public Task<IEnumerable<GasBoilerDto>> GetAllAsync()
        {
            throw new NotImplementedException();
        }

        public Task<IEnumerable<GasBoilerDto>> GetAllForUserAsync(int userId)
        {
            throw new NotImplementedException();
        }

        public Task<GasBoilerDto?> GetByIdAsync(int id, int requestingUserId, bool isAdmin)
        {
            throw new NotImplementedException();
        }

        public Task<IEnumerable<object>> GetMapPointsAllAsync()
        {
            throw new NotImplementedException();
        }

        public Task<IEnumerable<object>> GetMapPointsForUserAsync(int userId)
        {
            throw new NotImplementedException();
        }

        public Task<GasBoilerDto?> UpdateAsync(int id, GasBoilerUpdateDto dto, int requestingUserId, bool isAdmin)
        {
            throw new NotImplementedException();
        }

        private GasBoilerDto MapToDto(GasBoiler gb)
        {
            return new GasBoilerDto
            {
                Id = gb.Id,
                Name = gb.Name,
                MaxPower = gb.MaxPower,
                Efficiency = gb.Efficiency,
                CurrentPower = gb.CurrentPower,
                CreatedAt = gb.CreatedAt,
                UpdatedAt = gb.UpdatedAt,
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
