using System.ComponentModel.DataAnnotations;

namespace Gas_Boiler_Backend.DTO.Building
{
    public class BuildingObjectUpdateDto
    {
        [Required]
        [MaxLength(200)]
        public string Name { get; set; } = string.Empty;

        [Required]
        public double Latitude { get; set; }

        [Required]
        public double Longitude { get; set; }

        [Required]
        [Range(0.1, double.MaxValue)]
        public double HeatingArea { get; set; }

        [Required]
        [Range(0.1, 10)]
        public double Height { get; set; } 

        [Required]
        [Range(-50, 50)]
        public double DesiredTemperature { get; set; }

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
    }
}