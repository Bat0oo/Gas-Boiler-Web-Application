using System.Text.Json.Serialization;

namespace Gas_Boiler_Backend.DTO.OpenWeather
{
    public class OpenWeatherMapResponse
    {
        [JsonPropertyName("main")]
        public MainData? Main { get; set; }
        [JsonPropertyName("weather")]
        public List<WeatherData>? Weather { get; set; }
        [JsonPropertyName("wind")]
        public WindData? Wind { get; set; } = null;
    }
}
