using Gas_Boiler_Backend.DTO.Boiler;
using Gas_Boiler_Backend.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace Gas_Boiler_Backend.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class GasBoilerController : ControllerBase
    {
        private readonly IGasBoilerService _service;

        public GasBoilerController(IGasBoilerService service) => _service = service;

        private int GetUserIdFromClaims()
        {
            var idClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            return idClaim != null ? int.Parse(idClaim) : 0;
        }
        private bool IsAdmin() => User.IsInRole("Admin") || User.FindFirst(ClaimTypes.Role)?.Value == "Admin";

        [HttpGet]
        public async Task<ActionResult<IEnumerable<GasBoilerResponseDto>>> GetAll()
        {
            try
            {
                if (IsAdmin())
                {
                    var all = await _service.GetAllAsync();
                    return Ok(all);
                }

                var userId = GetUserIdFromClaims();
                var userBoilers = await _service.GetAllForUserAsync(userId);
                return Ok(userBoilers);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<GasBoilerResponseDto>> GetById(int id)
        {
            try
            {
                var userId = GetUserIdFromClaims();
                var gasBoiler = await _service.GetByIdAsync(id, userId, IsAdmin());

                if (gasBoiler == null)
                    return NotFound(new { message = "Gas boiler not found or access denied" });

                return Ok(gasBoiler);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpGet("map")]
        public async Task<ActionResult<IEnumerable<object>>> GetMapPoints()
        {
            try
            {
                if (IsAdmin())
                {
                    var allPoints = await _service.GetMapPointsAllAsync();
                    return Ok(allPoints);
                }

                var userId = GetUserIdFromClaims();
                var userPoints = await _service.GetMapPointsForUserAsync(userId);
                return Ok(userPoints);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpPost]
        [Authorize(Roles = "User")]
        public async Task<ActionResult<GasBoilerResponseDto>> Create([FromBody] GasBoilerCreateDto dto)
        {
            try
            {
                var userId = GetUserIdFromClaims();
                var created = await _service.CreateAsync(dto, userId);

                return CreatedAtAction(nameof(GetById), new { id = created.Id }, created);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpPut("{id}")]
        [Authorize(Roles = "User")]
        public async Task<ActionResult<GasBoilerResponseDto>> Update(int id, [FromBody] GasBoilerUpdateDto dto)
        {
            try
            {
                var userId = GetUserIdFromClaims();
                var updated = await _service.UpdateAsync(id, dto, userId, IsAdmin());

                if (updated == null)
                    return NotFound(new { message = "Gas boiler not found or access denied" });

                return Ok(updated);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpDelete("{id}")]
        [Authorize(Roles = "User")]
        public async Task<ActionResult> Delete(int id)
        {
            try
            {
                var userId = GetUserIdFromClaims();
                var success = await _service.DeleteAsync(id, userId, IsAdmin());

                if (!success)
                    return NotFound(new { message = "Gas boiler not found or access denied" });

                return NoContent();
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }
    }
}