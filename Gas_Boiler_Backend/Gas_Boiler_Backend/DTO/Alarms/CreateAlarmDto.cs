using System.ComponentModel.DataAnnotations;

namespace Gas_Boiler_Backend.DTO.Alarms
{
    public class CreateAlarmDto
    {
        [Required]
        [MaxLength(50)]
        public string Type { get; set; } = string.Empty;

        [Required]
        [MaxLength(20)]
        public string Severity { get; set; } = string.Empty;

        [Required]
        [MaxLength(500)]
        public string Message { get; set; } = string.Empty;

        public string? Details { get; set; }

        [Required]
        public int BuildingId { get; set; }
    }
}
