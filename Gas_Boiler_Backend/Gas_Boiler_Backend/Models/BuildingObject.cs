using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Gas_Boiler_Backend.Models
{
    public class BuildingObject
    {
        [Key]
        public int Id { get; set; }

        [Required]
        public double HeatingArea { get; set; } // in m²

        [Required]
        public double DesiredTemperature { get; set; } // in °C

        // Heat transfer coefficients (U-values) in W/(m²·K)
        [Required]
        public double WallUValue { get; set; }

        [Required]
        public double WindowUValue { get; set; }

        [Required]
        public double CeilingUValue { get; set; }

        [Required]
        public double FloorUValue { get; set; }

        // Surface areas in m²
        [Required]
        public double WallArea { get; set; }

        [Required]
        public double WindowArea { get; set; }

        [Required]
        public double CeilingArea { get; set; }

        [Required]
        public double FloorArea { get; set; }
        [Required]
        public double Latitude { get; set; }

        [Required]
        public double Longitude { get; set; }


        // Foreign key
        [Required]
        public int GasBoilerId { get; set; }

        [ForeignKey("GasBoilerId")]
        public GasBoiler GasBoiler { get; set; } = null!;
    }
}
