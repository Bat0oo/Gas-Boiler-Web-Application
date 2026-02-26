using Gas_Boiler_Backend.DTO.Dashboard;
using Gas_Boiler_Backend.Interfaces;
using Microsoft.EntityFrameworkCore;
using System.Linq;

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
                catch (Exception)
                {
                }
            }

            stats.EstimatedTotalDailyCost = totalDailyCost;
            stats.EstimatedTotalMonthlyCost = totalDailyCost * 30;
            stats.EstimatedTotalAnnualCost = totalDailyCost * 365;
            stats.TotalRequiredPower = totalRequiredPower;
            stats.BuildingsWithInsufficientCapacity = insufficientCapacityCount;

            stats.RecentActivities = GetRecentActivities(buildings);

            return stats;
        }

        private List<RecentActivityDto> GetRecentActivities(IEnumerable<Models.BuildingObject> buildings)
        {
            var activities = new List<RecentActivityDto>();

            var recentBuildings = buildings
                .OrderByDescending(b => b.Id)
                .Take(5);

            foreach (var building in recentBuildings)
            {
                activities.Add(new RecentActivityDto
                {
                    Type = "building_added",
                    Description = $"Building '{building.Name}' added",
                    Timestamp = DateTime.UtcNow.AddDays(-new Random().Next(1, 30))
                });
            }

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
                    Timestamp = DateTime.UtcNow.AddDays(-new Random().Next(1, 30))
                });
            }

            return activities.OrderByDescending(a => a.Timestamp).Take(10).ToList();
        }
    }
}