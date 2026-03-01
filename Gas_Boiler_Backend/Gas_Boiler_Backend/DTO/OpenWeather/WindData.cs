using System.Text.Json.Serialization;

namespace Gas_Boiler_Backend.DTO.OpenWeather
{
    public class WindData
    {
        [JsonPropertyName("speed")]
        public double Speed { get; set; }

    }
}
