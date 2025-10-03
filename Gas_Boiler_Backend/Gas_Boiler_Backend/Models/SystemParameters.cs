using System.ComponentModel.DataAnnotations;

namespace Gas_Boiler_Backend.Models
{
    public class SystemParameters
    {
        [Key]
        public int Id { get; set; }

        [Required]
        [MaxLength(50)]
        public string ParameterName { get; set; } = string.Empty;

        [Required]
        public double Value { get; set; }

        [MaxLength(100)]
        public string Unit { get; set; } = string.Empty;

        [MaxLength(200)]
        public string Description { get; set; } = string.Empty;

        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
    }
}
