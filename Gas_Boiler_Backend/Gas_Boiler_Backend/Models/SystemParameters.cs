using System.ComponentModel.DataAnnotations;

namespace Gas_Boiler_Backend.Models
{
    public class SystemParameters
    {
        [Key]
        public int Id { get; set; }

        [Required]
        [Range(0.1, 3.0)]
        public decimal WallUValue { get; set; } = 0.50m;

        [Required]
        [Range(0.5, 10.0)]
        public decimal WindowUValue { get; set; } = 1.40m;

        [Required]
        [Range(0.1, 3.0)]
        public decimal CeilingUValue { get; set; } = 0.25m;

        [Required]
        [Range(0.1, 3.0)]
        public decimal FloorUValue { get; set; } = 0.40m;

        [Required]
        [Range(-30.0, 5.0)]
        public decimal OutdoorDesignTemp { get; set; } = -15.0m;

        [Required]
        [Range(0.0, 20.0)]
        public decimal GroundTemp { get; set; } = 10.0m;


        [Required]
        [Range(0.001, 1.0)]
        public decimal GasPricePerKwh { get; set; } = 0.05m;

        public DateTime LastUpdated { get; set; } = DateTime.UtcNow;


        [MaxLength(100)]
        public string UpdatedBy { get; set; } = "System";
    }
}