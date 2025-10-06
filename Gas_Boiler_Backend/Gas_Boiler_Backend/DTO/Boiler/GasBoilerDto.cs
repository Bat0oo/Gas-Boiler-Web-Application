namespace Gas_Boiler_Backend.DTO.Boiler
{
    public class GasBoilerDto
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public double MaxPower { get; set; }
        public double Efficiency { get; set; }
        public double CurrentPower { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime UpdatedAt { get; set; }
        public BuildingObjectDto? BuildingObject { get; set; }
    }
}
