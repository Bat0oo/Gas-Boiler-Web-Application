namespace Gas_Boiler_Backend.DTO.Alarms
{
    public class AlarmFiltersDto
    {
        public string? Type { get; set; }
        public string? Severity { get; set; }
        public int? BuildingId { get; set; }
        public int? UserId { get; set; } // Filter by building owner
        public bool? IsActive { get; set; }
        public bool? IsAcknowledged { get; set; }
        public DateTime? StartDate { get; set; }
        public DateTime? EndDate { get; set; }
    }
}
