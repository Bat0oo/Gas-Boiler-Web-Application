using System.ComponentModel.DataAnnotations;

namespace Gas_Boiler_Backend.DTO.Building
{
    /// <summary>
    /// Response DTO - What we send to the frontend
    /// </summary>
    public class BuildingObjectResponseDto
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public int UserId { get; set; }

        // Location
        public double Latitude { get; set; }
        public double Longitude { get; set; }

        // Thermal properties
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

        // Summary data
        public int BoilerCount { get; set; }  // How many boilers in this building
    }

    /// <summary>
    /// Detailed response with all boilers included
    /// </summary>
    public class BuildingObjectDetailDto
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public int UserId { get; set; }

        // Location
        public double Latitude { get; set; }
        public double Longitude { get; set; }

        // Thermal properties
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

        // Related boilers (full details)
        public List<BuildingBoilerDto> GasBoilers { get; set; } = new List<BuildingBoilerDto>();
    }

    /// <summary>
    /// Simplified boiler info when shown inside a building
    /// </summary>
    public class BuildingBoilerDto
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public double MaxPower { get; set; }
        public double Efficiency { get; set; }
        public double CurrentPower { get; set; }
    }

    /// <summary>
    /// For creating a new building
    /// </summary>
    public class BuildingObjectCreateDto
    {
        [Required]
        [MaxLength(200)]
        public string Name { get; set; } = string.Empty;

        [Required]
        [Range(-90, 90)]
        public double Latitude { get; set; }

        [Required]
        [Range(-180, 180)]
        public double Longitude { get; set; }

        [Required]
        [Range(0.1, 10000)]
        public double HeatingArea { get; set; }

        [Required]
        [Range(-50, 50)]
        public double DesiredTemperature { get; set; } = 22;

        [Required]
        [Range(0.01, 10)]
        public double WallUValue { get; set; }

        [Required]
        [Range(0.01, 10)]
        public double WindowUValue { get; set; }

        [Required]
        [Range(0.01, 10)]
        public double CeilingUValue { get; set; }

        [Required]
        [Range(0.01, 10)]
        public double FloorUValue { get; set; }

        [Required]
        [Range(0.1, 10000)]
        public double WallArea { get; set; }

        [Required]
        [Range(0.1, 10000)]
        public double WindowArea { get; set; }

        [Required]
        [Range(0.1, 10000)]
        public double CeilingArea { get; set; }

        [Required]
        [Range(0.1, 10000)]
        public double FloorArea { get; set; }
    }

    /// <summary>
    /// For updating an existing building
    /// </summary>
    public class BuildingObjectUpdateDto
    {
        [Required]
        [MaxLength(200)]
        public string Name { get; set; } = string.Empty;

        [Required]
        [Range(-90, 90)]
        public double Latitude { get; set; }

        [Required]
        [Range(-180, 180)]
        public double Longitude { get; set; }

        [Required]
        [Range(0.1, 10000)]
        public double HeatingArea { get; set; }

        [Required]
        [Range(-50, 50)]
        public double DesiredTemperature { get; set; }

        [Required]
        [Range(0.01, 10)]
        public double WallUValue { get; set; }

        [Required]
        [Range(0.01, 10)]
        public double WindowUValue { get; set; }

        [Required]
        [Range(0.01, 10)]
        public double CeilingUValue { get; set; }

        [Required]
        [Range(0.01, 10)]
        public double FloorUValue { get; set; }

        [Required]
        [Range(0.1, 10000)]
        public double WallArea { get; set; }

        [Required]
        [Range(0.1, 10000)]
        public double WindowArea { get; set; }

        [Required]
        [Range(0.1, 10000)]
        public double CeilingArea { get; set; }

        [Required]
        [Range(0.1, 10000)]
        public double FloorArea { get; set; }
    }

    /// <summary>
    /// Map marker info - minimal data for showing buildings on map
    /// </summary>
    public class BuildingMapPointDto
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public double Latitude { get; set; }
        public double Longitude { get; set; }
        public int BoilerCount { get; set; }
        public double TotalMaxPower { get; set; }  // Sum of all boiler max powers
        public double TotalCurrentPower { get; set; }  // Sum of all boiler current powers
    }
}