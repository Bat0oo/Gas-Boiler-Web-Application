namespace Gas_Boiler_Backend.DTO.DataManagement
{
    public class DataManagementSettingsDto
    {
        public int Id { get; set; }
        public int RecordingIntervalMinutes { get; set; }
        public DateTime LastUpdated { get; set; }
        public string UpdatedBy { get; set; } = string.Empty;
    }
}
