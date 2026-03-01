using Gas_Boiler_Backend.DTO.OpenWeather;
using Gas_Boiler_Backend.Interfaces;
using System.Text.Json;

namespace Gas_Boiler_Backend.Services
{
    public class OpenWeatherService : IWeatherService
    {
        private readonly HttpClient _httpClient;
        private readonly string _apiKey;
        private readonly ILogger<OpenWeatherService> _logger;

        public OpenWeatherService(HttpClient httpClient, IConfiguration configuration, ILogger<OpenWeatherService> logger)
        {
            _httpClient = httpClient;
            _apiKey = configuration["OpenWeatherMap:ApiKey"] ?? throw new ArgumentNullException("OpenWeatherMap:ApiKey is not configured");
            _logger = logger;
        }

        public async Task<double> GetCurrentTemperatureAsync(double latitude, double longitude)
        {
            try
            {
                var weatherInfo = await GetWeatherInfoAsync(latitude, longitude);
                return weatherInfo.Temperature;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to get temperature for location: {Latitude}, {Longitude}", latitude, longitude);
                // Return a fallback temperature (0°C) if API fails
                return 0;
            }
        }

        public async Task<WeatherInfo> GetWeatherInfoAsync(double latitude, double longitude)
        {
            try
            {
                var url = $"https://api.openweathermap.org/data/2.5/weather?lat={latitude}&lon={longitude}&appid={_apiKey}&units=metric";

                var response = await _httpClient.GetAsync(url);

                if (!response.IsSuccessStatusCode)
                {
                    _logger.LogWarning("OpenWeatherMap API returned status code: {StatusCode}", response.StatusCode);
                    return GetFallbackWeather();
                }

                var content = await response.Content.ReadAsStringAsync();
                var weatherData = JsonSerializer.Deserialize<OpenWeatherMapResponse>(content);

                if (weatherData == null || weatherData.Main == null)
                {
                    _logger.LogWarning("Failed to parse OpenWeatherMap response");
                    return GetFallbackWeather();
                }

                return new WeatherInfo
                {
                    Temperature = weatherData.Main.Temp,
                    Description = weatherData.Weather?.FirstOrDefault()?.Description ?? "N/A",
                    Humidity = weatherData.Main.Humidity,
                    WindSpeed = weatherData.Wind?.Speed ?? 0,
                    Icon = weatherData.Weather?.FirstOrDefault()?.Icon ?? ""
                };
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Exception while fetching weather data for {Latitude}, {Longitude}", latitude, longitude);
                return GetFallbackWeather();
            }
        }

        private WeatherInfo GetFallbackWeather()
        {
            return new WeatherInfo
            {
                Temperature = 0,
                Description = "Unavailable",
                Humidity = 0,
                WindSpeed = 0,
                Icon = ""
            };
        }
    }
}