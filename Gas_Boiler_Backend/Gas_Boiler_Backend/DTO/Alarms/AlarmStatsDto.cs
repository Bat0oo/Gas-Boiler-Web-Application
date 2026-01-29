namespace Gas_Boiler_Backend.DTO.Alarms
{
    public class AlarmStatsDto
    {
        public int TotalAlarms { get; set; }
        public int ActiveAlarms { get; set; }
        public int AcknowledgedAlarms { get; set; }
        public int ResolvedAlarms { get; set; }

        public Dictionary<string, int> ByType { get; set; } = new Dictionary<string, int>();
        public Dictionary<string, int> BySeverity { get; set; } = new Dictionary<string, int>();
    }
}
