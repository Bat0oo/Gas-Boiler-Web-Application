using System.ComponentModel.DataAnnotations;

namespace Gas_Boiler_Backend.Models
{
    public class AlarmSettings
    {
        [Key]
        public int Id { get; set; }

        // Indoor Temperature Thresholds
        [Required]
        [Range(-50, 50)]
        public double HighIndoorTempThreshold { get; set; } = 28.0; 

        [Required]
        [Range(-50, 50)]
        public double LowIndoorTempThreshold { get; set; } = 18.0; 

        // Outdoor Temperature Thresholds
        [Required]
        [Range(-50, 50)]
        public double HighOutdoorTempThreshold { get; set; } = 35.0; 

        [Required]
        [Range(-50, 50)]
        public double LowOutdoorTempThreshold { get; set; } = -15.0; 

        // Cost Threshold
        [Required]
        [Range(0, 10000)]
        public double HighDailyCostThreshold { get; set; } = 50.0; // EUR

        // Capacity Deficit Threshold
        [Required]
        [Range(0, 1000)]
        public double CapacityDeficitThreshold { get; set; } = 0.0; // kW (any deficit triggers)

        // Cooldown to prevent spam
        [Required]
        [Range(1, 1440)]
        public int AlertCooldownMinutes { get; set; } = 60; // minutes

        // Enable/Disable specific alert types
        [Required]
        public bool CapacityAlertsEnabled { get; set; } = true;

        [Required]
        public bool HighIndoorTempAlertsEnabled { get; set; } = true;

        [Required]
        public bool LowIndoorTempAlertsEnabled { get; set; } = true;

        [Required]
        public bool HighOutdoorTempAlertsEnabled { get; set; } = true;

        [Required]
        public bool LowOutdoorTempAlertsEnabled { get; set; } = true;

        [Required]
        public bool HighCostAlertsEnabled { get; set; } = false; // Disabled by default

        public DateTime LastUpdated { get; set; } = DateTime.UtcNow;

        [MaxLength(100)]
        public string UpdatedBy { get; set; } = "System";
    }
}
