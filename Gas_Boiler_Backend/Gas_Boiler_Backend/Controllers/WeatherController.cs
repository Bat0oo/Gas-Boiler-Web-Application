using Gas_Boiler_Backend.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace Gas_Boiler_Backend.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class WeatherController : ControllerBase
    {
        private readonly IOpenWeatherService _weather;
        public WeatherController(IOpenWeatherService weather) => _weather = weather;

        [HttpGet("by-coordinates")]
        [Authorize]
        public async Task<IActionResult> ByCoords([FromQuery] double lat, [FromQuery] double lon)
        {
            try
            {
                var data = await _weather.GetCurrentWeatherByCoordsAsync(lat, lon);
                return Ok(data);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { error = ex.Message });
            }
        }
    }
}
