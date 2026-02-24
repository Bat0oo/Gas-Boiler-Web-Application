using System.ComponentModel.DataAnnotations;

namespace Gas_Boiler_Backend.DTO.Building
{
    public class UpdateDesiredTemperatureDto
    {
        [Required]
        [Range(-50, 50)]
        public double DesiredTemperature { get; set; }
    }
}
