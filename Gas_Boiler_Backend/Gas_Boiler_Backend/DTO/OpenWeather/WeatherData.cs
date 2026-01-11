using System.Text.Json.Serialization;

namespace Gas_Boiler_Backend.DTO.OpenWeather
{
    public class WeatherData
    {
        [JsonPropertyName("description")]
        public string Description { get; set; } = string.Empty;
        [JsonPropertyName("icon")]
        public string Icon { get; set; } = string.Empty;
    }
}
