using Gas_Boiler_Backend.DTO.User;
using Gas_Boiler_Backend.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace Gas_Boiler_Backend.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class UserController : ControllerBase
    {
        private readonly IUserService _userService;
        public UserController(IUserService userService)
        {
            _userService = userService;
        }

        [HttpGet]
        [Authorize(Roles = "Admin")]
        public async Task<ActionResult<IEnumerable<UserResponseDto>>> GetAllUsers()
        {
            try
            {
                var users = await _userService.GetAllUsersAsync();
                return Ok(users);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<UserResponseDto>> GetUserById(int id)
        {
            try
            {
                var currentUserId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "0");
                var currentUserRole = User.FindFirst(ClaimTypes.Role)?.Value;

                // Users can only view their own profile, admins can view any
                if (currentUserRole != "Admin" && currentUserId != id)
                    return Forbid();

                var user = await _userService.GetUserByIdAsync(id);
                return Ok(user);
            }
            catch (Exception ex)
            {
                return NotFound(new { message = ex.Message });
            }
        }

        //[Authorize]
        [HttpGet("me")]
        public async Task<ActionResult<UserResponseDto>> GetCurrentUser()
        {
            try
            {
                var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "0");
                var user = await _userService.GetUserByIdAsync(userId);
                return Ok(user);
            }
            catch (Exception ex)
            {
                return NotFound(new { message = ex.Message });
            }
        }

        [HttpPut("{id}")]
        public async Task<ActionResult<UserResponseDto>> UpdateUser(int id, [FromBody] UpdateUserDto updateDto)
        {
            try
            {
                var currentUserId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "0");
                var currentUserRole = User.FindFirst(ClaimTypes.Role)?.Value;

                // Users can only update their own profile, admins can update any
                if (currentUserRole != "Admin" && currentUserId != id)
                    return Forbid();

                var updatedUser = await _userService.UpdateUserAsync(id, updateDto);
                return Ok(updatedUser);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpDelete("{id}")]
        public async Task<ActionResult> DeleteUser(int id)
        {
            try
            {
                var currentUserId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "0");
                var currentUserRole = User.FindFirst(ClaimTypes.Role)?.Value;

                // Users can only delete their own account, admins can delete any
                if (currentUserRole != "Admin" && currentUserId != id)
                    return Forbid();

                var result = await _userService.DeleteUserAsync(id);

                if (result)
                    return NoContent();

                return NotFound(new { message = "User not found" });
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }
    }
}
