using Gas_Boiler_Backend.DTO.HistoricalData;
using Gas_Boiler_Backend.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace Gas_Boiler_Backend.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class HistoricalDataController : ControllerBase
    {
        private readonly IHistoricalDataService _historicalDataService;
        private readonly IBuildingReadingRepository _readingRepository;

        public HistoricalDataController(
            IHistoricalDataService historicalDataService,
            IBuildingReadingRepository readingRepository)
        {
            _historicalDataService = historicalDataService;
            _readingRepository = readingRepository;
        }

        [HttpGet("building/{buildingId}")]
        public async Task<ActionResult<IEnumerable<BuildingReadingDto>>> GetBuildingHistory(
            int buildingId,
            [FromQuery] DateTime? startDate = null,
            [FromQuery] DateTime? endDate = null)
        {
            try
            {
                var readings = await _readingRepository.GetByBuildingIdAsync(
                    buildingId,
                    startDate,
                    endDate);

                var dtos = readings.Select(r => new BuildingReadingDto
                {
                    Id = r.Id,
                    BuildingId = r.BuildingId,
                    BuildingName = r.Building?.Name ?? "Unknown",
                    Timestamp = r.Timestamp,
                    IndoorTemperature = r.IndoorTemperature,
                    OutdoorTemperature = r.OutdoorTemperature,
                    TemperatureDifference = r.TemperatureDifference,
                    HeatLossWatts = r.HeatLossWatts,
                    RequiredPowerKw = r.RequiredPowerKw,
                    AvailablePowerKw = r.AvailablePowerKw,
                    HasSufficientCapacity = r.HasSufficientCapacity,
                    DailyCostEur = r.DailyCostEur
                });

                return Ok(dtos);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = $"Error fetching historical data: {ex.Message}" });
            }
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<BuildingReadingDto>>> GetAllHistory(
            [FromQuery] DateTime? startDate = null,
            [FromQuery] DateTime? endDate = null)
        {
            try
            {
                var isAdmin = User.IsInRole("Admin");
                var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "0");

                var readings = await _readingRepository.GetAllAsync(startDate, endDate);

                if (!isAdmin)
                {
                    readings = readings.Where(r => r.Building.UserId == userId);
                }

                var dtos = readings.Select(r => new BuildingReadingDto
                {
                    Id = r.Id,
                    BuildingId = r.BuildingId,
                    BuildingName = r.Building?.Name ?? "Unknown",
                    Timestamp = r.Timestamp,
                    IndoorTemperature = r.IndoorTemperature,
                    OutdoorTemperature = r.OutdoorTemperature,
                    TemperatureDifference = r.TemperatureDifference,
                    HeatLossWatts = r.HeatLossWatts,
                    RequiredPowerKw = r.RequiredPowerKw,
                    AvailablePowerKw = r.AvailablePowerKw,
                    HasSufficientCapacity = r.HasSufficientCapacity,
                    DailyCostEur = r.DailyCostEur
                });

                return Ok(dtos);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = $"Error fetching historical data: {ex.Message}" });
            }
        }

        [HttpGet("count")]
        public async Task<ActionResult> GetReadingsCount()
        {
            try
            {
                var count = await _historicalDataService.GetTotalReadingsCountAsync();
                return Ok(new { totalReadings = count });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = $"Error getting count: {ex.Message}" });
            }
        }

        [HttpPost("seed")]
        [Authorize(Roles = "Admin")]
        public async Task<ActionResult<SeedHistoricalDataResponse>> SeedData([FromQuery] int days = 30)
        {
            try
            {
                if (days < 1 || days > 365)
                {
                    return BadRequest(new { message = "Days must be between 1 and 365" });
                }

                var response = await _historicalDataService.SeedHistoricalDataAsync(days);

                return Ok(response);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = $"Error seeding data: {ex.Message}" });
            }
        }

        [HttpPost("record")]
        [Authorize(Roles = "Admin")]
        public async Task<ActionResult> RecordNow()
        {
            try
            {
                await _historicalDataService.RecordAllBuildingsAsync();
                return Ok(new { message = "Data recorded successfully" });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = $"Error recording data: {ex.Message}" });
            }
        }

        [HttpDelete("clear")]
        [Authorize(Roles = "Admin")]
        public async Task<ActionResult> ClearAllData()
        {
            try
            {
                await _readingRepository.DeleteAllAsync();
                return Ok(new { message = "All historical data cleared successfully" });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = $"Error clearing data: {ex.Message}" });
            }
        }
    }
}