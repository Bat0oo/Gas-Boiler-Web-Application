using Gas_Boiler_Backend.DTO.User;
using Gas_Boiler_Backend.Interfaces;
using Gas_Boiler_Backend.Models;

namespace Gas_Boiler_Backend.Services
{
    public class UserService : IUserService
    {
        private readonly IUserRepository _userRepository;
        public UserService(IUserRepository userRepository)
        {
            _userRepository = userRepository;
        }

        public async Task<bool> DeleteUserAsync(int id)
        {
            if (!await _userRepository.ExistsAsync(id))
                throw new Exception("User not found");

            return await _userRepository.DeleteAsync(id);
        }

        public async Task<IEnumerable<UserResponseDto>> GetAllUsersAsync()
        {
            var users = await _userRepository.GetAllAsync();
            return users.Select(MapToResponseDto);
        }

        public async Task<UserResponseDto> GetUserByIdAsync(int id)
        {
            var user = await _userRepository.GetByIdAsync(id);

            if (user == null)
                throw new Exception("User not found");

            return MapToResponseDto(user);
        }

        public async Task<UserResponseDto> UpdateUserAsync(int id, UpdateUserDto updateDto)
        {
            var user = await _userRepository.GetByIdAsync(id);

            if (user == null)
                throw new Exception("User not found");

            // Check if username is being changed and if it's already taken
            if (!string.IsNullOrEmpty(updateDto.Username) &&
                updateDto.Username != user.Username)
            {
                if (await _userRepository.UsernameExistsAsync(updateDto.Username))
                    throw new Exception("Username is already taken");

                user.Username = updateDto.Username;
            }

            // Check if email is being changed and if it's already taken
            if (!string.IsNullOrEmpty(updateDto.Email) &&
                updateDto.Email != user.Email)
            {
                if (await _userRepository.EmailExistsAsync(updateDto.Email))
                    throw new Exception("Email is already taken");

                user.Email = updateDto.Email;
            }

            // Update password if both current and new password are provided
            if (!string.IsNullOrEmpty(updateDto.CurrentPassword) &&
                !string.IsNullOrEmpty(updateDto.NewPassword))
            {
                if (!BCrypt.Net.BCrypt.Verify(updateDto.CurrentPassword, user.PasswordHash))
                    throw new Exception("Current password is incorrect");

                user.PasswordHash = BCrypt.Net.BCrypt.HashPassword(updateDto.NewPassword);
            }

            // Admin only
            if (!string.IsNullOrEmpty(updateDto.Role))
                user.Role = updateDto.Role;

            if (updateDto.IsBlocked.HasValue)
                user.IsBlocked = updateDto.IsBlocked.Value;

            var updatedUser = await _userRepository.UpdateAsync(user);
            return MapToResponseDto(updatedUser);
        }

        public async Task<bool> BlockUserAsync(int id)
        {
            var user = await _userRepository.GetByIdAsync(id);

            if (user == null)
                throw new Exception("User not found");

            if (user.Role == "Admin")
                throw new Exception("Cannot block admin users");

            user.IsBlocked = true;
            await _userRepository.UpdateAsync(user);

            return true;
        }

        public async Task<bool> UnblockUserAsync(int id)
        {
            var user = await _userRepository.GetByIdAsync(id);

            if (user == null)
                throw new Exception("User not found");

            user.IsBlocked = false;
            await _userRepository.UpdateAsync(user);

            return true;
        }

        private UserResponseDto MapToResponseDto(User user)
        {
            return new UserResponseDto
            {
                Id = user.Id,
                Username = user.Username,
                Email = user.Email,
                Role = user.Role,
                CreatedAt = user.CreatedAt,
                GasBoilersCount = user.GasBoilers?.Count ?? 0,
                IsBlocked = user.IsBlocked  
            };
        }

    }
}
