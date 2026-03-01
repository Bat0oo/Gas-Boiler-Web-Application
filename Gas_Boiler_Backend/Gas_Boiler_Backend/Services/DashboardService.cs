using Gas_Boiler_Backend.DTO.Dashboard;
using Gas_Boiler_Backend.Interfaces;

namespace Gas_Boiler_Backend.Services
{
    public class DashboardService : IDashboardService
    {
        private readonly IBuildingObjectRepository _buildingRepository;
        private readonly IBuildingCalculatorService _calculatorService;

        public DashboardService(
            IBuildingObjectRepository buildingRepository,
            IBuildingCalculatorService calculatorService)
        {
            _buildingRepository = buildingRepository;
            _calculatorService = calculatorService;
        }

        public async Task<DashboardStatsDto> GetDashboardStatsAsync(int userId, bool isAdmin)
        {
            // Get all buildings for user (or all if admin)
            var buildings = await _buildingRepository.GetAllAsync();

            if (!isAdmin)
            {
                buildings = buildings.Where(b => b.UserId == userId).ToList();
            }

            var stats = new DashboardStatsDto
            {
                TotalBuildings = buildings.Count(),
                TotalHeatingArea = buildings.Sum(b => b.HeatingArea),
                TotalBoilers = buildings.Sum(b => b.GasBoilers.Count),
                TotalBoilerCapacity = buildings.Sum(b => b.GasBoilers.Sum(boiler => boiler.MaxPower))
            };

            // Calculate costs and power requirements for all buildings
            double totalDailyCost = 0;
            double totalRequiredPower = 0;
            int insufficientCapacityCount = 0;

            foreach (var building in buildings)
            {
                try
                {
                    var calculations = await _calculatorService.CalculateBuildingMetricsAsync(building);

                    totalDailyCost += calculations.DailyCostEur;
                    totalRequiredPower += calculations.RequiredPowerKw;

                    if (!calculations.HasSufficientCapacity)
                    {
                        insufficientCapacityCount++;
                    }
                }
                catch (Exception ex)
                {
                    // If calculation fails for a building, skip it
                    Console.WriteLine($"Error calculating for building {building.Id}: {ex.Message}");
                }
            }

            stats.EstimatedTotalDailyCost = totalDailyCost;
            stats.EstimatedTotalMonthlyCost = totalDailyCost * 30;
            stats.EstimatedTotalAnnualCost = totalDailyCost * 365;
            stats.TotalRequiredPower = totalRequiredPower;
            stats.BuildingsWithInsufficientCapacity = insufficientCapacityCount;

            // Get recent activities (last 10 buildings/boilers added)
            stats.RecentActivities = GetRecentActivities(buildings);

            return stats;
        }

        private List<RecentActivityDto> GetRecentActivities(IEnumerable<Models.BuildingObject> buildings)
        {
            var activities = new List<RecentActivityDto>();

            // Add recent buildings (last 5)
            var recentBuildings = buildings
                .OrderByDescending(b => b.Id)
                .Take(5);

            foreach (var building in recentBuildings)
            {
                activities.Add(new RecentActivityDto
                {
                    Type = "building_added",
                    Description = $"Building '{building.Name}' added",
                    Timestamp = DateTime.UtcNow.AddDays(-new Random().Next(1, 30)) // Mock timestamp
                });
            }

            // Add recent boilers (last 5)
            var recentBoilers = buildings
                .SelectMany(b => b.GasBoilers.Select(boiler => new { Building = b, Boiler = boiler }))
                .OrderByDescending(x => x.Boiler.Id)
                .Take(5);

            foreach (var item in recentBoilers)
            {
                activities.Add(new RecentActivityDto
                {
                    Type = "boiler_added",
                    Description = $"Boiler '{item.Boiler.Name}' added to '{item.Building.Name}'",
                    Timestamp = DateTime.UtcNow.AddDays(-new Random().Next(1, 30)) // Mock timestamp
                });
            }

            return activities.OrderByDescending(a => a.Timestamp).Take(10).ToList();
        }
    }
}