using System.Text.Json.Serialization;

namespace Gas_Boiler_Backend.DTO.OpenWeather
{
    public class MainData
    {
        [JsonPropertyName("temp")]
        public double Temp { get; set; }
        [JsonPropertyName("humidity")]
        public double Humidity { get; set; }
    }
}
