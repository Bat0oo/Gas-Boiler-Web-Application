using System.ComponentModel.DataAnnotations;

namespace Gas_Boiler_Backend.Models
{
    public class SystemParameters
    {
        [Key]
        public int Id { get; set; }

        [Required]
        [Range(0.1, 3.0)]
        public decimal WallUValue { get; set; }

        [Required]
        [Range(0.5, 10.0)]
        public decimal WindowUValue { get; set; }

        [Required]
        [Range(0.1, 3.0)]
        public decimal CeilingUValue { get; set; }

        [Required]
        [Range(0.1, 3.0)]
        public decimal FloorUValue { get; set; }

        [Required]
        [Range(-30.0, 5.0)]
        public decimal OutdoorDesignTemp { get; set; }

        [Required]
        [Range(0.0, 20.0)]
        public decimal GroundTemp { get; set; }

        [Required]
        [Range(0.001, 1.0)]
        public decimal GasPricePerKwh { get; set; }

        public DateTime LastUpdated { get; set; }

        [MaxLength(100)]
        public string UpdatedBy { get; set; } = string.Empty;
    }
}