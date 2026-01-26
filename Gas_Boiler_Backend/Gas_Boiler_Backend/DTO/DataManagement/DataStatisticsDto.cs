namespace Gas_Boiler_Backend.DTO.DataManagement
{
    public class DataStatisticsDto
    {
        public int TotalReadings { get; set; }
        public int TotalBuildings { get; set; }
        public DateTime? OldestReading { get; set; }
        public DateTime? NewestReading { get; set; }
        public string DateRange { get; set; } = "No data";
    }
}
