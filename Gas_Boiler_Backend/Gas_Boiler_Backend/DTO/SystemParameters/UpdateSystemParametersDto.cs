using System.ComponentModel.DataAnnotations;

namespace Gas_Boiler_Backend.DTO.SystemParameters
{
    public class UpdateSystemParametersDto
    {
        [Required(ErrorMessage = "Wall U-value is required")]
        [Range(0.1, 3.0, ErrorMessage = "Wall U-value must be between 0.1 and 3.0 W/m²K")]
        public decimal WallUValue { get; set; }

        [Required(ErrorMessage = "Window U-value is required")]
        [Range(0.5, 10.0, ErrorMessage = "Window U-value must be between 0.5 and 10.0 W/m²K")]
        public decimal WindowUValue { get; set; }

        [Required(ErrorMessage = "Ceiling U-value is required")]
        [Range(0.1, 3.0, ErrorMessage = "Ceiling U-value must be between 0.1 and 3.0 W/m²K")]
        public decimal CeilingUValue { get; set; }

        [Required(ErrorMessage = "Floor U-value is required")]
        [Range(0.1, 3.0, ErrorMessage = "Floor U-value must be between 0.1 and 3.0 W/m²K")]
        public decimal FloorUValue { get; set; }

        // Temperatures (°C)
        [Required(ErrorMessage = "Outdoor design temperature is required")]
        [Range(-30.0, 5.0, ErrorMessage = "Outdoor design temperature must be between -30 and 5 °C")]
        public decimal OutdoorDesignTemp { get; set; }

        [Required(ErrorMessage = "Ground temperature is required")]
        [Range(0.0, 20.0, ErrorMessage = "Ground temperature must be between 0 and 20 °C")]
        public decimal GroundTemp { get; set; }

        // Economic
        [Required(ErrorMessage = "Gas price is required")]
        [Range(0.001, 1.0, ErrorMessage = "Gas price must be between 0.001 and 1.0 EUR/kWh")]
        public decimal GasPricePerKwh { get; set; }
    }
}
