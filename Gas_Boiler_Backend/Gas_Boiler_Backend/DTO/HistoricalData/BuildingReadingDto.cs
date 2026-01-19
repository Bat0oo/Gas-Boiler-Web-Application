namespace Gas_Boiler_Backend.DTO.HistoricalData
{
    public class BuildingReadingDto
    {
        public int Id { get; set; }
        public int BuildingId { get; set; }
        public string BuildingName { get; set; } = string.Empty;

        public DateTime Timestamp { get; set; }

        public double IndoorTemperature { get; set; }
        public double OutdoorTemperature { get; set; }
        public double TemperatureDifference { get; set; }

        public double HeatLossWatts { get; set; }
        public double HeatLossKw => HeatLossWatts / 1000.0;

        public double RequiredPowerKw { get; set; }
        public double AvailablePowerKw { get; set; }
        public bool HasSufficientCapacity { get; set; }

        public double DailyCostEur { get; set; }
    }
}
