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

        [Required]
        [Range(0.10, 0.40)]
        public decimal WindowToWallRatio { get; set; } = 0.15m;

        [Required]
        [Range(1.00, 1.30)]
        public decimal SafetyFactor { get; set; } = 1.15m;

        [Required]
        [Range(0.70, 0.98)]
        public decimal DefaultBoilerEfficiency { get; set; } = 0.90m;

        [Required]
        [Range(0.0, 1.0)]
        public decimal OutdoorInfluenceFactor { get; set; } = 0.15m;
        [Required]
        [Range(500.0, 5000.0)]
        public decimal ThermalMassCoefficient { get; set; } = 1200.0m;
        [Required]
        [Range(30, 300)]
        public int TemperatureTimeStepSeconds { get; set; } = 60;

        public DateTime LastUpdated { get; set; }

        [MaxLength(100)]
        public string UpdatedBy { get; set; } = string.Empty;
    }
}