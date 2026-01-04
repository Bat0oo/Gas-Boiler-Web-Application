using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Security.Claims;

namespace Gas_Boiler_Backend.Models
{
    public class GasBoiler
    {
        [Key]
        public int Id { get; set; }

        [Required]
        [MaxLength(200)]
        public string Name { get; set; } = string.Empty;

        [Required]
        public double MaxPower { get; set; } // in kW

        [Required]
        [Range(0, 1)]
        public double Efficiency { get; set; } // 0.0 to 1.0 (e.g., 0.95 = 95%)

        [Required]
        public double CurrentPower { get; set; } = 0; // Current power output in kW

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

        // Foreign key
        [Required]
        public int UserId { get; set; }

        [ForeignKey("UserId")]
        public User User { get; set; } = null!;

        // Navigation properties

        [Required]
        public int BuildingObjectId { get; set; }

        [Required]
        public BuildingObject BuildingObject { get; set; } = null!; 

        public ICollection<HistoricalData> HistoricalData { get; set; } = new List<HistoricalData>();
        public ICollection<Alarm> Alarms { get; set; } = new List<Alarm>();
    }
}
