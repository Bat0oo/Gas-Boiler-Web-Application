using System.ComponentModel.DataAnnotations;

namespace Gas_Boiler_Backend.DTO.DataManagement
{
    public class UpdateDataManagementSettingsDto
    {
        [Required(ErrorMessage = "Recording interval is required")]
        [Range(1, 1440, ErrorMessage = "Recording interval must be between 1 and 1440 minutes")]
        public int RecordingIntervalMinutes { get; set; }
    }
}
