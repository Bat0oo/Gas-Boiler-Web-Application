using Gas_Boiler_Backend.DTO.DataManagement;
using Gas_Boiler_Backend.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace Gas_Boiler_Backend.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize(Roles = "Admin")]
    public class DataManagementController : ControllerBase
    {
        private readonly IDataManagementService _dataManagementService;

        public DataManagementController(IDataManagementService dataManagementService)
        {
            _dataManagementService = dataManagementService;
        }

        [HttpGet("settings")]
        public async Task<ActionResult<DataManagementSettingsDto>> GetSettings()
        {
            try
            {
                var settings = await _dataManagementService.GetSettingsAsync();
                return Ok(settings);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = $"Error getting settings: {ex.Message}" });
            }
        }

        [HttpPut("settings")]
        public async Task<ActionResult<DataManagementSettingsDto>> UpdateSettings(
            [FromBody] UpdateDataManagementSettingsDto dto)
        {
            try
            {
                var username = User.FindFirst(ClaimTypes.Name)?.Value ?? "Admin";
                var settings = await _dataManagementService.UpdateSettingsAsync(dto, username);
                return Ok(settings);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = $"Error updating settings: {ex.Message}" });
            }
        }

   
        [HttpGet("statistics")]
        public async Task<ActionResult<DataStatisticsDto>> GetStatistics()
        {
            try
            {
                var stats = await _dataManagementService.GetStatisticsAsync();
                return Ok(stats);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = $"Error getting statistics: {ex.Message}" });
            }
        }

        [HttpGet("export/csv")]
        public async Task<IActionResult> ExportCsv()
        {
            try
            {
                var csvBytes = await _dataManagementService.ExportDataAsCsvAsync();
                var fileName = $"historical_data_{DateTime.UtcNow:yyyyMMdd_HHmmss}.csv";

                return File(csvBytes, "text/csv", fileName);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = $"Error exporting CSV: {ex.Message}" });
            }
        }
    }
}
