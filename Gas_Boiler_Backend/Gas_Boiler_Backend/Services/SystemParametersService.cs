using Gas_Boiler_Backend.DTO.SystemParameters;
using Gas_Boiler_Backend.Interfaces;
using Gas_Boiler_Backend.Models;

namespace Gas_Boiler_Backend.Services
{
    public class SystemParametersService : ISystemParametersService
    {
        private readonly ISystemParametersRepository _repository;

        public SystemParametersService(ISystemParametersRepository repository)
        {
            _repository = repository;
        }
        public async Task<SystemParametersResponseDto> GetParametersAsync()
        {
            var parameters = await _repository.GetAsync();

            if (parameters == null)
            {
                parameters = await _repository.InitializeAsync();
            }

            return MapToResponseDto(parameters);
        }

        public async Task<SystemParametersResponseDto> UpdateParametersAsync(UpdateSystemParametersDto updateDto, string username)
        {
            var parameters = await _repository.GetAsync();

            if (parameters == null)
            {
                throw new Exception("System parameters not initialized");
            }

            // Update all values
            parameters.WallUValue = updateDto.WallUValue;
            parameters.WindowUValue = updateDto.WindowUValue;
            parameters.CeilingUValue = updateDto.CeilingUValue;
            parameters.FloorUValue = updateDto.FloorUValue;
            parameters.OutdoorDesignTemp = updateDto.OutdoorDesignTemp;
            parameters.GroundTemp = updateDto.GroundTemp;
            parameters.GasPricePerKwh = updateDto.GasPricePerKwh;
            parameters.WindowToWallRatio = updateDto.WindowToWallRatio;           
            parameters.SafetyFactor = updateDto.SafetyFactor;                     
            parameters.DefaultBoilerEfficiency = updateDto.DefaultBoilerEfficiency;

            // Update metadata
            parameters.LastUpdated = DateTime.Now;
            parameters.UpdatedBy = username;

            var updated = await _repository.UpdateAsync(parameters);
            return MapToResponseDto(updated);
        }

        private SystemParametersResponseDto MapToResponseDto(SystemParameters parameters)
        {
            return new SystemParametersResponseDto
            {
                Id = parameters.Id,
                WallUValue = parameters.WallUValue,
                WindowUValue = parameters.WindowUValue,
                CeilingUValue = parameters.CeilingUValue,
                FloorUValue = parameters.FloorUValue,
                OutdoorDesignTemp = parameters.OutdoorDesignTemp,
                GroundTemp = parameters.GroundTemp,
                GasPricePerKwh = parameters.GasPricePerKwh,
                LastUpdated = parameters.LastUpdated,
                WindowToWallRatio = parameters.WindowToWallRatio,     
                SafetyFactor = parameters.SafetyFactor,               
                DefaultBoilerEfficiency = parameters.DefaultBoilerEfficiency,  
                UpdatedBy = parameters.UpdatedBy
            };
        }
    }
}
