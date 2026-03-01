using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Gas_Boiler_Backend.Models
{
    public class BuildingReading
    {
        [Key]
        public int Id { get; set; }

        // Foreign key to Building
        [Required]
        public int BuildingId { get; set; }

        [ForeignKey(nameof(BuildingId))]
        public BuildingObject Building { get; set; } = null!;

        [Required]
        public DateTime Timestamp { get; set; }

        public double IndoorTemperature { get; set; }      
        public double OutdoorTemperature { get; set; }     
        public double TemperatureDifference { get; set; }  

        public double HeatLossWatts { get; set; }          

        public double RequiredPowerKw { get; set; }        
        public double AvailablePowerKw { get; set; }       
        public bool HasSufficientCapacity { get; set; }    

        public double DailyCostEur { get; set; }           

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    }
}