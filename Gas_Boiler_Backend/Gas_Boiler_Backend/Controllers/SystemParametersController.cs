using Gas_Boiler_Backend.DTO.SystemParameters;
using Gas_Boiler_Backend.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace Gas_Boiler_Backend.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class SystemParametersController : ControllerBase
    {
        private readonly ISystemParametersService _service;

        public SystemParametersController(ISystemParametersService service)
        {
            _service = service;
        }

        [HttpGet]
        [Authorize]
        public async Task<ActionResult<SystemParametersResponseDto>> GetParameters()
        {
            try
            {
                var parameters = await _service.GetParametersAsync();
                return Ok(parameters);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpPut]
        [Authorize(Roles = "Admin")]
        public async Task<ActionResult<SystemParametersResponseDto>> UpdateParameters(
            [FromBody] UpdateSystemParametersDto updateDto)
        {
            try
            {
                var username = User.FindFirst(ClaimTypes.Name)?.Value ?? "Unknown";

                var updated = await _service.UpdateParametersAsync(updateDto, username);

                return Ok(new
                {
                    message = "System parameters updated successfully",
                    data = updated
                });
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }
    }
}
