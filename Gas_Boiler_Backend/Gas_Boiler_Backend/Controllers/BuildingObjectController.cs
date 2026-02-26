using Gas_Boiler_Backend.DTO.Building;
using Gas_Boiler_Backend.DTO.Calculations;
using Gas_Boiler_Backend.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace Gas_Boiler_Backend.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class BuildingObjectController : ControllerBase
    {
        private readonly IBuildingObjectService _service;
        private readonly IBuildingCalculatorService _heatLossCalculator;

        public BuildingObjectController(IBuildingObjectService service, IBuildingCalculatorService heatLossCalculator)
        {
            _service = service;
            _heatLossCalculator = heatLossCalculator;
        }

        private int GetUserIdFromClaims()
        {
            var idClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            return idClaim != null ? int.Parse(idClaim) : 0;
        }

        private bool IsAdmin() => User.IsInRole("Admin") || User.FindFirst(ClaimTypes.Role)?.Value == "Admin";

        [HttpGet]
        public async Task<ActionResult<IEnumerable<BuildingObjectResponseDto>>> GetAll()
        {
            try
            {
                var userId = GetUserIdFromClaims();
                var buildings = await _service.GetAllBuildingsAsync(userId, IsAdmin());
                return Ok(buildings);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<BuildingObjectDetailDto>> GetById(int id)
        {
            try
            {
                var userId = GetUserIdFromClaims();
                var building = await _service.GetBuildingByIdAsync(id, userId, IsAdmin());

                if (building == null)
                    return NotFound(new { message = "Building not found or access denied" });

                return Ok(building);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpGet("map")]
        public async Task<ActionResult<IEnumerable<BuildingMapPointDto>>> GetMapPoints()
        {
            try
            {
                var userId = GetUserIdFromClaims();
                var points = await _service.GetMapPointsAsync(userId, IsAdmin());
                return Ok(points);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpPost]
        [Authorize(Roles = "User")]
        public async Task<ActionResult<BuildingObjectResponseDto>> CreateBuilding([FromBody] BuildingObjectCreateDto dto)
        {
            try
            {
                var userId = GetUserIdFromClaims();
                var created = await _service.CreateBuildingAsync(dto, userId);

                return CreatedAtAction(nameof(GetById), new { id = created.Id }, created);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpPut("{id}")]
        [Authorize(Roles = "User")]
        public async Task<ActionResult<BuildingObjectResponseDto>> UpdateBuilding(
            int id,
            [FromBody] BuildingObjectUpdateDto dto)
        {
            try
            {
                var userId = GetUserIdFromClaims();
                var updated = await _service.UpdateBuildingAsync(id, dto, userId, IsAdmin());

                if (updated == null)
                    return NotFound(new { message = "Building not found or access denied" });

                return Ok(updated);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpPatch("{id}/desired-temperature")]
        [Authorize(Roles = "User")]
        public async Task<ActionResult<BuildingObjectResponseDto>> UpdateDesiredTemperature(
            int id,
            [FromBody] UpdateDesiredTemperatureDto dto)
        {
            try
            {
                var userId = GetUserIdFromClaims();
                var updated = await _service.UpdateDesiredTemperatureAsync(id, dto.DesiredTemperature, userId);

                if (updated == null)
                    return NotFound(new { message = "Building not found or access denied" });

                return Ok(updated);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpDelete("{id}")]
        [Authorize(Roles = "User")]
        public async Task<ActionResult> DeleteBuilding(int id)
        {
            try
            {
                var userId = GetUserIdFromClaims();
                var success = await _service.DeleteBuildingAsync(id, userId, IsAdmin());

                if (!success)
                    return NotFound(new { message = "Building not found or access denied" });

                return NoContent();
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpGet("{id}/calculations")]
        [Authorize]
        public async Task<ActionResult<HeatLossCalculationDto>> GetBuildingCalculations(int id)
        {
            try
            {
                var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "0");
                var isAdmin = User.IsInRole("Admin");

                var building = await _service.GetBuildingByIdAsync(id, userId, isAdmin);

                if (building == null)
                    return NotFound(new { message = "Building not found" });

                var buildingEntity = await _service.GetBuildingEntityAsync(id, userId, isAdmin);

                if (buildingEntity == null)
                    return NotFound(new { message = "Building not found" });

                var calculations = await _heatLossCalculator.CalculateBuildingMetricsAsync(buildingEntity);

                return Ok(calculations);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = $"Error calculating heat loss: {ex.Message}" });
            }
        }

    }
}