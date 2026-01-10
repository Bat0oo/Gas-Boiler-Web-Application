namespace Gas_Boiler_Backend.DTO.OpenWeather
{
    public class OpenWeatherMapResponse
    {
        public MainData? Main { get; set; }
        public List<WeatherData>? Weather { get; set; }
        public WindData? Wind { get; set; } = null;
    }
}
