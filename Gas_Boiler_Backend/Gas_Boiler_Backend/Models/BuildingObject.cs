using System.ComponentModel.DataAnnotations;

namespace Gas_Boiler_Backend.Models
{
    public class BuildingObject
    {
        [Key]
        public int Id { get; set; }

        [Required]
        [MaxLength(200)]
        public string Name { get; set; } = string.Empty;

        [Required]
        public int UserId { get; set; }

        // Location
        [Required]
        public double Latitude { get; set; }

        [Required]
        public double Longitude { get; set; }

        // Dimensions
        [Required]
        [Range(0.1, double.MaxValue)]
        public double HeatingArea { get; set; } // m² (floor area to be heated)

        [Required]
        [Range(0.1, 10)]
        public double Height { get; set; } = 2.7; // m (ceiling height)

        // Calculated property: Volume
        public double Volume => HeatingArea * Height; // m³

        // Temperature
        [Required]
        [Range(-50, 50)]
        public double DesiredTemperature { get; set; } // °C

        // U-values (thermal transmittance W/m²·K)
        [Required]
        [Range(0, 5)]
        public double WallUValue { get; set; }

        [Required]
        [Range(0, 5)]
        public double WindowUValue { get; set; }

        [Required]
        [Range(0, 5)]
        public double CeilingUValue { get; set; }

        [Required]
        [Range(0, 5)]
        public double FloorUValue { get; set; }

        // Surface areas (m²)
        [Required]
        [Range(0, double.MaxValue)]
        public double WallArea { get; set; }

        [Required]
        [Range(0, double.MaxValue)]
        public double WindowArea { get; set; }

        [Required]
        [Range(0, double.MaxValue)]
        public double CeilingArea { get; set; }

        [Required]
        [Range(0, double.MaxValue)]
        public double FloorArea { get; set; }

        // Navigation properties
        public User? User { get; set; }
        public ICollection<GasBoiler> GasBoilers { get; set; } = new List<GasBoiler>();
    }
}