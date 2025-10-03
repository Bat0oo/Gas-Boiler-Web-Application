using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Gas_Boiler_Backend.Models
{
    public class HistoricalData
    {
        [Key]
        public int Id { get; set; }

        [Required]
        public DateTime Timestamp { get; set; }

        [Required]
        public double PowerOutput { get; set; } // in kW

        [Required]
        public double GasConsumption { get; set; } // in m³

        [Required]
        public double Cost { get; set; } // in RSD or selected currency

        public double OutsideTemperature { get; set; }

        public double InsideTemperature { get; set; }

        // Foreign key
        [Required]
        public int GasBoilerId { get; set; }

        [ForeignKey("GasBoilerId")]
        public GasBoiler GasBoiler { get; set; } = null!;
    }
}
