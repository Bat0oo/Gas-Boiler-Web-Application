using Gas_Boiler_Backend.DTO.Boiler;
using Gas_Boiler_Backend.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace Gas_Boiler_Backend.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
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
        [Authorize]
        public async Task<IActionResult> GetAll()
        {
            if (IsAdmin())
            {
                var all = await _service.GetAllAsync();
                return Ok(all);
            }

            var userId = GetUserIdFromClaims();
            var list = await _service.GetAllForUserAsync(userId);
            return Ok(list);
        }

        [HttpGet("{id}")]
        [Authorize]
        public async Task<IActionResult> Get(int id)
        {
            var userId = GetUserIdFromClaims();
            var dto = await _service.GetByIdAsync(id, userId, IsAdmin());
            if (dto == null) return NotFound();
            return Ok(dto);
        }

        [HttpPost]
        [Authorize]
        public async Task<IActionResult> Create([FromBody] GasBoilerCreateDto dto)
        {
            var userId = GetUserIdFromClaims();
            var created = await _service.CreateAsync(dto, userId);
            return CreatedAtAction(nameof(Get), new { id = created.Id }, created);
        }

        [HttpPut("{id}")]
        [Authorize]
        public async Task<IActionResult> Update(int id, [FromBody] GasBoilerUpdateDto dto)
        {
            var userId = GetUserIdFromClaims();
            var updated = await _service.UpdateAsync(id, dto, userId, IsAdmin());
            if (updated == null) return NotFound();
            return Ok(updated);
        }

        [HttpDelete("{id}")]
        [Authorize]
        public async Task<IActionResult> Delete(int id)
        {
            var userId = GetUserIdFromClaims();
            var success = await _service.DeleteAsync(id, userId, IsAdmin());
            if (!success) return NotFound();
            return NoContent();
        }

        [HttpGet("map")]
        [Authorize]
        public async Task<IActionResult> MapPoints()
        {
            if (IsAdmin())
            {
                var result = await _service.GetMapPointsAllAsync();
                return Ok(result);
            }
            var userId = GetUserIdFromClaims();
            var resultUser = await _service.GetMapPointsForUserAsync(userId);
            return Ok(resultUser);
        }
    }
}
