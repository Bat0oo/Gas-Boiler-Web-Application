using System.ComponentModel.DataAnnotations;

namespace Gas_Boiler_Backend.DTO.Boiler
{ 
    public class GasBoilerCreateDto
    {
        [Required]
        [MaxLength(200)]
        public string Name { get; set; } = string.Empty;

        [Required]
        [Range(0.1, 1000)]
        public double MaxPower { get; set; }

        [Required]
        [Range(0.01, 1)]
        public double Efficiency { get; set; }

        [Range(0, 1000)]
        public double CurrentPower { get; set; } = 0;

        [Required]
        public int BuildingObjectId { get; set; }
    }
}