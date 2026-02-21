namespace Gas_Boiler_Backend.DTO.Building
{
    public class BuildingMapPointDto
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public double Latitude { get; set; }
        public double Longitude { get; set; }
        public int BoilerCount { get; set; }
        public double TotalMaxPower { get; set; }
        public double TotalCurrentPower { get; set; }
        public string WeatherDescription { get; set; } = string.Empty;
        public double? CurrentTemperature { get; set; }
        public double? IndoorTemperature { get; set; }
        public double? DesiredTemperature { get; set; }
    }
}