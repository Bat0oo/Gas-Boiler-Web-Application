using Gas_Boiler_Backend.Data;
using Gas_Boiler_Backend.DTO.Auth;
using Gas_Boiler_Backend.Helpers;
using Gas_Boiler_Backend.Interfaces;
using Gas_Boiler_Backend.Models;
using Gas_Boiler_Backend.Repositories;
using Microsoft.EntityFrameworkCore;

namespace Gas_Boiler_Backend.Services
{
    public class AuthService : IAuthService
    {
        private readonly IUserRepository _userRepository;
        private readonly JwtHelper _jwtHelper;

        public AuthService(IUserRepository userRepository, JwtHelper jwtHelper)
        {
            _userRepository = userRepository;
            _jwtHelper = jwtHelper;
        }

        public async Task<AuthResponseDto> LoginAsync(LoginDto loginDto)
        {
            var user = await _userRepository.GetByEmailAsync(loginDto.Email);

            if (user == null)
                throw new Exception("Invalid email or password");

            if (!BCrypt.Net.BCrypt.Verify(loginDto.Password, user.PasswordHash))
                throw new Exception("Invalid email or password");

            var token = _jwtHelper.GenerateJwtToken(user);

            return new AuthResponseDto
            {
                Token = token,
                Username = user.Username,
                Email = user.Email,
                Role = user.Role,
                UserId = user.Id
            };
        }

        public async Task<AuthResponseDto> RegisterAsync(RegisterDto registerDto)
        {
            if (await _userRepository.EmailExistsAsync(registerDto.Email))
                throw new Exception("User with this email already exists");

            if (await _userRepository.UsernameExistsAsync(registerDto.Username))
                throw new Exception("Username is already taken");

            var user = new User
            {
                Username = registerDto.Username,
                Email = registerDto.Email,
                PasswordHash = BCrypt.Net.BCrypt.HashPassword(registerDto.Password),
                Role = "User",
                CreatedAt = DateTime.UtcNow
            };

            var createdUser = await _userRepository.CreateAsync(user);
            var token = _jwtHelper.GenerateJwtToken(createdUser);

            return new AuthResponseDto
            {
                Token = token,
                Username = createdUser.Username,
                Email = createdUser.Email,
                Role = createdUser.Role,
                UserId = createdUser.Id
            }; 
        }

    }
}
