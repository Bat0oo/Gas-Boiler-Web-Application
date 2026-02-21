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
        [Required(ErrorMessage = "Window to wall ratio is required")]
        [Range(0.10, 0.40, ErrorMessage = "Window to wall ratio must be between 0.10 and 0.40")]
        public decimal WindowToWallRatio { get; set; }

        [Required(ErrorMessage = "Safety factor is required")]
        [Range(1.00, 1.30, ErrorMessage = "Safety factor must be between 1.00 and 1.30")]
        public decimal SafetyFactor { get; set; }

        [Required(ErrorMessage = "Default boiler efficiency is required")]
        [Range(0.70, 0.98, ErrorMessage = "Default boiler efficiency must be between 0.70 and 0.98")]
        public decimal DefaultBoilerEfficiency { get; set; }

        // Temperature calculation parameters
        [Required(ErrorMessage = "Outdoor influence factor is required")]
        [Range(0.0, 1.0, ErrorMessage = "Outdoor influence factor must be between 0.0 and 1.0")]
        public decimal OutdoorInfluenceFactor { get; set; }

        [Required(ErrorMessage = "Thermal mass coefficient is required")]
        [Range(500.0, 2000.0, ErrorMessage = "Thermal mass coefficient must be between 500 and 2000 J/m³·K")]
        public decimal ThermalMassCoefficient { get; set; }

        [Required(ErrorMessage = "Temperature time step is required")]
        [Range(30, 300, ErrorMessage = "Temperature time step must be between 30 and 300 seconds")]
        public int TemperatureTimeStepSeconds { get; set; }
    }
}
