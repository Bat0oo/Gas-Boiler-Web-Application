namespace Gas_Boiler_Backend.DTO.Boiler
{
    public class GasBoilerUpdateDto
    {
        public string Name { get; set; } = string.Empty;
        public double MaxPower { get; set; }
        public double Efficiency { get; set; }
        public double CurrentPower { get; set; } = 0;

        public BuildingObjectDto? BuildingObject { get; set; }
    }
}
