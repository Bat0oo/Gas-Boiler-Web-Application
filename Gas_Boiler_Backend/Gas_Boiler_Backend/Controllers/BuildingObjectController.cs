using Gas_Boiler_Backend.DTO.Building;
using Gas_Boiler_Backend.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace Gas_Boiler_Backend.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]  // All endpoints require authentication
    public class BuildingObjectController : ControllerBase
    {
        private readonly IBuildingObjectService _buildingService;

        public BuildingObjectController(IBuildingObjectService buildingService)
        {
            _buildingService = buildingService;
        }

        private int GetUserIdFromClaims()
        {
            var idClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            return idClaim != null ? int.Parse(idClaim) : 0;
        }

        private bool IsAdmin() => User.IsInRole("Admin") || User.FindFirst(ClaimTypes.Role)?.Value == "Admin";

        /// <summary>
        /// Get all buildings for current user (or all if admin)
        /// </summary>
        [HttpGet]
        public async Task<ActionResult<IEnumerable<BuildingObjectResponseDto>>> GetAllBuildings()
        {
            try
            {
                var userId = GetUserIdFromClaims();
                var isAdmin = IsAdmin();

                var buildings = await _buildingService.GetAllBuildingsAsync(userId, isAdmin);
                return Ok(buildings);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        /// <summary>
        /// Get detailed building info with all its boilers
        /// </summary>
        [HttpGet("{id}")]
        public async Task<ActionResult<BuildingObjectDetailDto>> GetBuildingById(int id)
        {
            try
            {
                var userId = GetUserIdFromClaims();
                var isAdmin = IsAdmin();

                var building = await _buildingService.GetBuildingByIdAsync(id, userId, isAdmin);

                if (building == null)
                    return NotFound(new { message = "Building not found or access denied" });

                return Ok(building);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        /// <summary>
        /// Get map markers for all buildings (minimal data for map display)
        /// </summary>
        [HttpGet("map")]
        public async Task<ActionResult<IEnumerable<BuildingMapPointDto>>> GetMapPoints()
        {
            try
            {
                var userId = GetUserIdFromClaims();
                var isAdmin = IsAdmin();

                var mapPoints = await _buildingService.GetMapPointsAsync(userId, isAdmin);
                return Ok(mapPoints);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        /// <summary>
        /// Create a new building
        /// </summary>
        [HttpPost]
        [Authorize(Roles = "User")]
        public async Task<ActionResult<BuildingObjectResponseDto>> CreateBuilding([FromBody] BuildingObjectCreateDto dto)
        {
            try
            {
                if (!ModelState.IsValid)
                    return BadRequest(ModelState);

                var userId = GetUserIdFromClaims();

                var created = await _buildingService.CreateBuildingAsync(dto, userId);

                return CreatedAtAction(
                    nameof(GetBuildingById),
                    new { id = created.Id },
                    created
                );
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        /// <summary>
        /// Update an existing building
        /// </summary>
        [HttpPut("{id}")]
        [Authorize(Roles = "User")]
        public async Task<ActionResult<BuildingObjectResponseDto>> UpdateBuilding(
            int id,
            [FromBody] BuildingObjectUpdateDto dto)
        {
            try
            {
                if (!ModelState.IsValid)
                    return BadRequest(ModelState);

                var userId = GetUserIdFromClaims();
                var isAdmin = IsAdmin();

                var updated = await _buildingService.UpdateBuildingAsync(id, dto, userId, isAdmin);
                return Ok(updated);
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(new { message = ex.Message });
            }
            catch (UnauthorizedAccessException ex)
            {
                return StatusCode(403, new { message = ex.Message });
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        /// <summary>
        /// Delete a building (will also delete all its boilers due to cascade)
        /// </summary>
        [HttpDelete("{id}")]
        [Authorize(Roles = "User")]
        public async Task<ActionResult> DeleteBuilding(int id)
        {
            try
            {
                var userId = GetUserIdFromClaims();
                var isAdmin = IsAdmin();

                var deleted = await _buildingService.DeleteBuildingAsync(id, userId, isAdmin);

                if (!deleted)
                    return NotFound(new { message = "Building not found" });

                return NoContent();
            }
            catch (UnauthorizedAccessException ex)
            {
                return StatusCode(403, new { message = ex.Message });
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }
    }
}