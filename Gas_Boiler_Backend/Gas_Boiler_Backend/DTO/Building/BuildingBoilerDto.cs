namespace Gas_Boiler_Backend.DTO.Building
{
    public class BuildingBoilerDto
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public double MaxPower { get; set; }
        public double Efficiency { get; set; }
        public double CurrentPower { get; set; }
    }
}
