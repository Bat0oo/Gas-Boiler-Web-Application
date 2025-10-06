using Gas_Boiler_Backend.Interfaces;

namespace Gas_Boiler_Backend.Services
{
    public class OpenWeatherService : IOpenWeatherService
    {
        private readonly HttpClient _http;
        private readonly string _apiKey;
        public OpenWeatherService(HttpClient http, IConfiguration config)
        {
            _http = http;
            _apiKey = config["OpenWeather:ApiKey"] ?? config["OpenWeather__ApiKey"] ?? string.Empty;
        }

        public async Task<object?> GetCurrentWeatherByCoordsAsync(double lat, double lon)
        {
            if (string.IsNullOrWhiteSpace(_apiKey))
                throw new InvalidOperationException("OpenWeather API key is not configured.");

            var url = $"https://api.openweathermap.org/data/2.5/weather?lat={lat}&lon={lon}&units=metric&appid={_apiKey}";
            var resp = await _http.GetFromJsonAsync<object>(url);
            return resp;
        }
    }
}
