using Gas_Boiler_Backend.DTO.Auth;

namespace Gas_Boiler_Backend.Interfaces
{
    public interface IAuthService
    {
        Task<AuthResponseDto> RegisterAsync(RegisterDto registerDto);
        Task<AuthResponseDto> LoginAsync(LoginDto loginDto);
    }
}
