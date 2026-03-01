namespace Gas_Boiler_Backend.DTO.Dashboard
{
    public class DashboardStatsDto
    {
        public int TotalBuildings { get; set; }
        public double TotalHeatingArea { get; set; } // m²

        public int TotalBoilers { get; set; }
        public double TotalBoilerCapacity { get; set; } // kW

        public double EstimatedTotalDailyCost { get; set; } // EUR
        public double EstimatedTotalMonthlyCost { get; set; } // EUR
        public double EstimatedTotalAnnualCost { get; set; } // EUR

        public double TotalRequiredPower { get; set; } // kW
        public int BuildingsWithInsufficientCapacity { get; set; }

        public List<RecentActivityDto> RecentActivities { get; set; } = new List<RecentActivityDto>();
    }

    public class RecentActivityDto
    {
        public string Type { get; set; } = string.Empty; 
        public string Description { get; set; } = string.Empty;
        public DateTime Timestamp { get; set; }
    }
}