namespace Gas_Boiler_Backend.DTO.Boiler
{
    public class BuildingObjectDto
    {
        public int Id { get; set; }
        public double HeatingArea { get; set; }
        public double DesiredTemperature { get; set; }
        public double WallUValue { get; set; }
        public double WindowUValue { get; set; }
        public double CeilingUValue { get; set; }
        public double FloorUValue { get; set; }
        public double WallArea { get; set; }
        public double WindowArea { get; set; }
        public double CeilingArea { get; set; }
        public double FloorArea { get; set; }
        public double Latitude { get; set; }
        public double Longitude { get; set; }
    }
}
