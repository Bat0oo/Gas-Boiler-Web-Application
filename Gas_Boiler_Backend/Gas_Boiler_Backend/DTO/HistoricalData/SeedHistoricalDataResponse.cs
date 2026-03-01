namespace Gas_Boiler_Backend.DTO.HistoricalData
{
    public class SeedHistoricalDataResponse
    {
        public string Message { get; set; } = string.Empty;
        public int ReadingsGenerated { get; set; }
        public int BuildingsProcessed { get; set; }
        public int DaysGenerated { get; set; }
    }
}
