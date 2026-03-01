namespace Gas_Boiler_Backend.DTO.Alarms
{
    public class AlarmSettingsDto
    {
        public int Id { get; set; }
        public double HighIndoorTempThreshold { get; set; }
        public double LowIndoorTempThreshold { get; set; }
        public double HighOutdoorTempThreshold { get; set; }
        public double LowOutdoorTempThreshold { get; set; }
        public double HighDailyCostThreshold { get; set; }
        public double CapacityDeficitThreshold { get; set; }
        public int AlertCooldownMinutes { get; set; }
        public bool CapacityAlertsEnabled { get; set; }
        public bool HighIndoorTempAlertsEnabled { get; set; }
        public bool LowIndoorTempAlertsEnabled { get; set; }
        public bool HighOutdoorTempAlertsEnabled { get; set; }
        public bool LowOutdoorTempAlertsEnabled { get; set; }
        public bool HighCostAlertsEnabled { get; set; }
        public DateTime LastUpdated { get; set; }
        public string UpdatedBy { get; set; } = string.Empty;
    }
}
