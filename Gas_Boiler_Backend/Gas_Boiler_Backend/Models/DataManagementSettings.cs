using System.ComponentModel.DataAnnotations;

namespace Gas_Boiler_Backend.Models
{
    public class DataManagementSettings
    {
        [Key]
        public int Id { get; set; }

        [Required]
        [Range(1, 1440, ErrorMessage = "Recording interval must be between 1 minute and 24 hours (1440 minutes)")]
        public int RecordingIntervalMinutes { get; set; } = 60;

        public DateTime LastUpdated { get; set; } = DateTime.UtcNow;

        [MaxLength(100)]
        public string UpdatedBy { get; set; } = "System";
    }
}
