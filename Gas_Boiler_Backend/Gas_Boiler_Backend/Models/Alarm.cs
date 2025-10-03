using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Gas_Boiler_Backend.Models
{
    public class Alarm
    {
        [Key]
        public int Id { get; set; }

        [Required]
        public DateTime Timestamp { get; set; } = DateTime.UtcNow;

        [Required]
        [MaxLength(50)]
        public string AlarmType { get; set; } = string.Empty; // "InsufficientPower", "TemperatureInversion"

        [Required]
        [MaxLength(500)]
        public string Message { get; set; } = string.Empty;

        public bool IsResolved { get; set; } = false;

        public DateTime? ResolvedAt { get; set; }

        // Foreign key
        [Required]
        public int GasBoilerId { get; set; }

        [ForeignKey("GasBoilerId")]
        public GasBoiler GasBoiler { get; set; } = null!;
    }
}
