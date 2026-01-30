using System.ComponentModel.DataAnnotations;

namespace Gas_Boiler_Backend.DTO.Alarms
{
    public class UpdateAlarmSettingsDto
    {
        [Range(-50, 50)]
        public double? HighIndoorTempThreshold { get; set; }

        [Range(-50, 50)]
        public double? LowIndoorTempThreshold { get; set; }

        [Range(-50, 50)]
        public double? HighOutdoorTempThreshold { get; set; }

        [Range(-50, 50)]
        public double? LowOutdoorTempThreshold { get; set; }

        [Range(0, 10000)]
        public double? HighDailyCostThreshold { get; set; }

        [Range(0, 1000)]
        public double? CapacityDeficitThreshold { get; set; }

        [Range(1, 1440)]
        public int? AlertCooldownMinutes { get; set; }

        public bool? CapacityAlertsEnabled { get; set; }
        public bool? HighIndoorTempAlertsEnabled { get; set; }
        public bool? LowIndoorTempAlertsEnabled { get; set; }
        public bool? HighOutdoorTempAlertsEnabled { get; set; }
        public bool? LowOutdoorTempAlertsEnabled { get; set; }
        public bool? HighCostAlertsEnabled { get; set; }
    }
}
