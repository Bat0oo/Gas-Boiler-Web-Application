namespace Gas_Boiler_Backend.Interfaces
{
    public interface IWeatherService
    {
        Task<double> GetCurrentTemperatureAsync(double latitude, double longitude);
        Task<WeatherInfo> GetWeatherInfoAsync(double latitude, double longitude);
    }

    public class WeatherInfo
    {
        public double Temperature { get; set; }
        public string Description { get; set; } = string.Empty;
        public double Humidity { get; set; }
        public double WindSpeed { get; set; }
        public string Icon { get; set; } = string.Empty;
    }
}
