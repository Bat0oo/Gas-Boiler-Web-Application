using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Gas_Boiler_Backend.Models
{
    public class Alarm
    {
        [Key]
        public int Id { get; set; }

        [Required]
        [MaxLength(50)]
        public string Type { get; set; } = string.Empty; // INSUFFICIENT_CAPACITY, HIGH_INDOOR_TEMP, etc.

        [Required]
        [MaxLength(20)]
        public string Severity { get; set; } = string.Empty; // INFO, WARNING, CRITICAL

        [Required]
        [MaxLength(500)]
        public string Message { get; set; } = string.Empty;

        public string? Details { get; set; } // JSON string with additional data

        [Required]
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        public DateTime? AcknowledgedAt { get; set; }

        public DateTime? ResolvedAt { get; set; }

        [Required]
        public bool IsActive { get; set; } = true;

        [Required]
        public bool IsAcknowledged { get; set; } = false;

        // Foreign key to Building
        [Required]
        public int BuildingId { get; set; }

        [ForeignKey(nameof(BuildingId))]
        public BuildingObject Building { get; set; } = null!;
    }
}
