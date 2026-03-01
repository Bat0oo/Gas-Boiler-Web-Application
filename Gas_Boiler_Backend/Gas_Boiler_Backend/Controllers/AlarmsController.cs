using Gas_Boiler_Backend.DTO.Alarms;
using Gas_Boiler_Backend.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace Gas_Boiler_Backend.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class AlarmsController : ControllerBase
    {
        private readonly IAlarmService _alarmService;

        public AlarmsController(IAlarmService alarmService)
        {
            _alarmService = alarmService;
        }

        private int GetUserIdFromClaims()
        {
            var idClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            return idClaim != null ? int.Parse(idClaim) : 0;
        }

        private bool IsAdmin() => User.IsInRole("Admin") || User.FindFirst(ClaimTypes.Role)?.Value == "Admin";

        [HttpGet]
        public async Task<ActionResult<IEnumerable<AlarmDto>>> GetAll([FromQuery] AlarmFiltersDto? filters)
        {
            try
            {
                var userId = GetUserIdFromClaims();
                var alarms = await _alarmService.GetAllAsync(filters, userId, IsAdmin());
                return Ok(alarms);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpGet("active")]
        public async Task<ActionResult<IEnumerable<AlarmDto>>> GetActive()
        {
            try
            {
                var userId = GetUserIdFromClaims();
                var alarms = await _alarmService.GetActiveAlarmsAsync(userId, IsAdmin());
                return Ok(alarms);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpGet("stats")]
        public async Task<ActionResult<AlarmStatsDto>> GetStats()
        {
            try
            {
                var userId = GetUserIdFromClaims();
                var stats = await _alarmService.GetStatsAsync(userId, IsAdmin());
                return Ok(stats);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<AlarmDto>> GetById(int id)
        {
            try
            {
                var userId = GetUserIdFromClaims();
                var alarm = await _alarmService.GetByIdAsync(id, userId, IsAdmin());

                if (alarm == null)
                    return NotFound(new { message = "Alarm not found or access denied" });

                return Ok(alarm);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpPost("{id}/acknowledge")]
        public async Task<ActionResult<AlarmDto>> Acknowledge(int id)
        {
            try
            {
                var userId = GetUserIdFromClaims();
                var alarm = await _alarmService.AcknowledgeAsync(id, userId, IsAdmin());

                if (alarm == null)
                    return NotFound(new { message = "Alarm not found or access denied" });

                return Ok(alarm);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpPost("{id}/resolve")]
        [Authorize(Roles = "Admin")]
        public async Task<ActionResult<AlarmDto>> Resolve(int id)
        {
            try
            {
                var userId = GetUserIdFromClaims();
                var alarm = await _alarmService.ResolveAsync(id, userId, IsAdmin());

                if (alarm == null)
                    return NotFound(new { message = "Alarm not found" });

                return Ok(alarm);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpDelete("{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<ActionResult> Delete(int id)
        {
            try
            {
                var userId = GetUserIdFromClaims();
                var success = await _alarmService.DeleteAsync(id, userId, IsAdmin());

                if (!success)
                    return NotFound(new { message = "Alarm not found" });

                return NoContent();
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpGet("settings")]
        public async Task<ActionResult<AlarmSettingsDto>> GetSettings()
        {
            try
            {
                var settings = await _alarmService.GetSettingsAsync();
                return Ok(settings);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpPut("settings")]
        [Authorize(Roles = "Admin")]
        public async Task<ActionResult<AlarmSettingsDto>> UpdateSettings([FromBody] UpdateAlarmSettingsDto dto)
        {
            try
            {
                var username = User.FindFirst(ClaimTypes.Name)?.Value ?? "Admin";
                var settings = await _alarmService.UpdateSettingsAsync(dto, username);

                await _alarmService.CheckAndCreateAlarmsAsync();

                return Ok(settings);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpPost("check")]
        [Authorize(Roles = "Admin")]
        public async Task<ActionResult> TriggerAlarmCheck()
        {
            try
            {
                await _alarmService.CheckAndCreateAlarmsAsync();
                return Ok(new { message = "Alarm check completed successfully" });
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }
    }
}
