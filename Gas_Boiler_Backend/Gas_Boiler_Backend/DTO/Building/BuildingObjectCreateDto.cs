using System.ComponentModel.DataAnnotations;

namespace Gas_Boiler_Backend.DTO.Building
{
    public class BuildingObjectCreateDto
    {
        [Required]
        [MaxLength(200)]
        public string Name { get; set; } = string.Empty;

        [Required]
        public double Latitude { get; set; }

        [Required]
        public double Longitude { get; set; }

        [Required]
        [Range(1, 10000)]
        public double HeatingArea { get; set; } // m²

        [Required]
        [Range(0.1, 10)]
        public double Height { get; set; } = 2.7; // m (ceiling height)

        [Required]
        [Range(0, 40)]
        public double DesiredTemperature { get; set; } // °C
    }
}