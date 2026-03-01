using Gas_Boiler_Backend.DTO.User;

namespace Gas_Boiler_Backend.Interfaces
{
    public interface IUserService
    {
        Task<UserResponseDto> GetUserByIdAsync(int id);
        Task<IEnumerable<UserResponseDto>> GetAllUsersAsync();
        Task<UserResponseDto> UpdateUserAsync(int id, UpdateUserDto updateDto);
        Task<bool> DeleteUserAsync(int id);
        Task<bool> BlockUserAsync(int id);
        Task<bool> UnblockUserAsync(int id);
    }
}
