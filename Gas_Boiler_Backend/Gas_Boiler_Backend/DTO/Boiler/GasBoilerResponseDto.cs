namespace Gas_Boiler_Backend.DTO.Boiler
{
    public class GasBoilerResponseDto
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public double MaxPower { get; set; }
        public double Efficiency { get; set; }
        public double CurrentPower { get; set; }
        public int UserId { get; set; }
        public string UserName { get; set; } = string.Empty;

        public int BuildingObjectId { get; set; }
        public string BuildingName { get; set; } = string.Empty;  

        public DateTime CreatedAt { get; set; }
        public DateTime UpdatedAt { get; set; }

        public BuildingObjectDto? BuildingObject { get; set; }
    }
}
