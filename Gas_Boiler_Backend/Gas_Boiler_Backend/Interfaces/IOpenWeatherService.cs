namespace Gas_Boiler_Backend.Interfaces
{
    public interface IOpenWeatherService
    {
        Task<object?> GetCurrentWeatherByCoordsAsync(double lat, double lon);
    }
}
