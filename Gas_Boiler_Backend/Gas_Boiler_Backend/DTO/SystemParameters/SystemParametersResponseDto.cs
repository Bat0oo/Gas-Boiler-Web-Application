namespace Gas_Boiler_Backend.DTO.SystemParameters
{
    public class SystemParametersResponseDto
    {
        public int Id { get; set; }

        // U-values (W/m²K)
        public decimal WallUValue { get; set; }
        public decimal WindowUValue { get; set; }
        public decimal CeilingUValue { get; set; }
        public decimal FloorUValue { get; set; }

        // Temperatures (°C)
        public decimal OutdoorDesignTemp { get; set; }
        public decimal GroundTemp { get; set; }

        // Economic
        public decimal GasPricePerKwh { get; set; }
        public decimal WindowToWallRatio { get; set; }
        public decimal SafetyFactor { get; set; }
        public decimal DefaultBoilerEfficiency { get; set; }

        // Metadata
        public DateTime LastUpdated { get; set; }
        public string UpdatedBy { get; set; } = string.Empty;
    }
}
