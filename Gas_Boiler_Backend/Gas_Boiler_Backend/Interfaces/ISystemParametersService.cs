using Gas_Boiler_Backend.DTO.SystemParameters;

namespace Gas_Boiler_Backend.Interfaces
{
    public interface ISystemParametersService
    {
        Task<SystemParametersResponseDto> GetParametersAsync();
        Task<SystemParametersResponseDto> UpdateParametersAsync(UpdateSystemParametersDto updateDto, string username);

    }
}
