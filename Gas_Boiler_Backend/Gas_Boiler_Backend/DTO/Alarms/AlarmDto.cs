namespace Gas_Boiler_Backend.DTO.Alarms
{
    public class AlarmDto
    {
        public int Id { get; set; }
        public string Type { get; set; } = string.Empty;
        public string Severity { get; set; } = string.Empty;
        public string Message { get; set; } = string.Empty;
        public string? Details { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime? AcknowledgedAt { get; set; }
        public DateTime? ResolvedAt { get; set; }
        public bool IsActive { get; set; }
        public bool IsAcknowledged { get; set; }
        public int BuildingId { get; set; }
        public string BuildingName { get; set; } = string.Empty;
    }
}
