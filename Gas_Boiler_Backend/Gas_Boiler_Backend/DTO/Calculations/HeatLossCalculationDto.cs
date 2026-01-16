namespace Gas_Boiler_Backend.DTO.Calculations
{
    /// <summary>
    /// Heat loss and cost calculation results for a building
    /// </summary>
    public class HeatLossCalculationDto
    {
        // Individual heat losses (Watts)
        public double WallHeatLoss { get; set; }          // Q_wall = U × A × ΔT
        public double WindowHeatLoss { get; set; }        // Q_window = U × A × ΔT
        public double CeilingHeatLoss { get; set; }       // Q_ceiling = U × A × ΔT
        public double FloorHeatLoss { get; set; }         // Q_floor = U × A × ΔT_ground

        // Total heat loss before safety factor (Watts)
        public double TotalHeatLossBeforeSafety { get; set; }

        // Safety factor applied
        public double SafetyFactor { get; set; }

        // Total heat loss with safety factor (Watts)
        public double TotalHeatLoss { get; set; }

        // Required heating power (kW)
        public double RequiredPowerKw { get; set; }

        // Temperature data
        public double IndoorTemperature { get; set; }     // Desired temp
        public double OutdoorTemperature { get; set; }    // Current weather
        public double GroundTemperature { get; set; }     // From system params
        public double TemperatureDifference { get; set; } // Indoor - Outdoor

        // Cost calculations
        public double DailyEnergyKwh { get; set; }        // kWh per day
        public double DailyCostEur { get; set; }          // EUR per day
        public double MonthlyCostEur { get; set; }        // EUR per month (30 days)
        public double AnnualCostEur { get; set; }         // EUR per year (365 days)

        // Boiler efficiency used (average of all boilers or default)
        public double BoilerEfficiency { get; set; }

        // Gas price used (EUR/kWh)
        public double GasPricePerKwh { get; set; }

        // Current boiler capacity
        public double CurrentBoilerCapacityKw { get; set; } // Sum of all boilers
        public bool HasSufficientCapacity { get; set; }     // Current >= Required
        public double CapacityDeficitKw { get; set; }       // Required - Current (if negative, surplus)
    }
}