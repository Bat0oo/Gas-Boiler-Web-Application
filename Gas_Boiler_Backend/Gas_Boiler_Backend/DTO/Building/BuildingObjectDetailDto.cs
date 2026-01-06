namespace Gas_Boiler_Backend.DTO.Building
{
    /// <summary>
    /// Detailed building response with all boilers
    /// Used for: GET /api/BuildingObject/{id} (get building details)
    /// </summary>
    public class BuildingObjectDetailDto
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public int UserId { get; set; }
        public double Latitude { get; set; }
        public double Longitude { get; set; }
        public double HeatingArea { get; set; }
        public double Height { get; set; } // NEW!
        public double Volume { get; set; } // NEW! Calculated
        public double DesiredTemperature { get; set; }
        public double WallUValue { get; set; }
        public double WindowUValue { get; set; }
        public double CeilingUValue { get; set; }
        public double FloorUValue { get; set; }
        public double WallArea { get; set; }
        public double WindowArea { get; set; }
        public double CeilingArea { get; set; }
        public double FloorArea { get; set; }
        public int BoilerCount { get; set; }
        public List<BuildingBoilerDto> GasBoilers { get; set; } = new();
    }
}