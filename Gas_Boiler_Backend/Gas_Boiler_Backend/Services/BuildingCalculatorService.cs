using Gas_Boiler_Backend.DTO.Calculations;
using Gas_Boiler_Backend.Interfaces;
using Gas_Boiler_Backend.Models;

namespace Gas_Boiler_Backend.Services
{
    public class BuildingCalculatorService : IBuildingCalculatorService
    {
        private readonly ISystemParametersRepository _systemParametersRepository;
        private readonly IWeatherService _weatherService;

        public BuildingCalculatorService(
            ISystemParametersRepository systemParametersRepository,
            IWeatherService weatherService)
        {
            _systemParametersRepository = systemParametersRepository;
            _weatherService = weatherService;
        }

        public async Task<HeatLossCalculationDto> CalculateBuildingMetricsAsync(BuildingObject building)
        {
            var sysParams = await _systemParametersRepository.GetAsync();
            if (sysParams == null)
                throw new InvalidOperationException("System parameters not found");

            // Get current outdoor temperature from weather API
            double outdoorTemp;
            try
            {
                var weather = await _weatherService.GetWeatherInfoAsync(building.Latitude, building.Longitude);
                outdoorTemp = weather?.Temperature ?? (double)sysParams.OutdoorDesignTemp;
            }
            catch
            {
                // Fallback to design temperature if weather fails
                outdoorTemp = (double)sysParams.OutdoorDesignTemp;
            }

            var indoorTemp = building.DesiredTemperature;
            var groundTemp = (double)sysParams.GroundTemp;
            var tempDiff = indoorTemp - outdoorTemp;
            var tempDiffGround = indoorTemp - groundTemp;

            // Calculate individual heat losses using Q = U × A × ΔT
            // Result is in Watts (W)

            double wallLoss = building.WallUValue * building.WallArea * tempDiff;
            double windowLoss = building.WindowUValue * building.WindowArea * tempDiff;
            double ceilingLoss = building.CeilingUValue * building.CeilingArea * tempDiff;
            double floorLoss = building.FloorUValue * building.FloorArea * tempDiffGround; // Uses ground temp!

            // Total before safety factor
            double totalBeforeSafety = wallLoss + windowLoss + ceilingLoss + floorLoss;

            // Apply safety factor
            double safetyFactor = (double)sysParams.SafetyFactor;
            double totalHeatLoss = totalBeforeSafety * safetyFactor;

            // Convert to kW
            double requiredPowerKw = totalHeatLoss / 1000.0;

            // Calculate boiler capacity
            double currentCapacityKw = building.GasBoilers.Sum(b => b.MaxPower);
            bool hasSufficientCapacity = currentCapacityKw >= requiredPowerKw;
            double capacityDeficit = requiredPowerKw - currentCapacityKw;

            // Calculate average boiler efficiency
            double avgEfficiency;
            if (building.GasBoilers.Any())
            {
                avgEfficiency = building.GasBoilers.Average(b => b.Efficiency);
            }
            else
            {
                avgEfficiency = (double)sysParams.DefaultBoilerEfficiency;
            }

            // Cost calculations
            double gasPricePerKwh = (double)sysParams.GasPricePerKwh;

            // Daily energy: Total heat loss * 24 hours / 1000 (convert W to kW)
            double dailyEnergyKwh = (totalHeatLoss * 24) / 1000.0;

            // Daily cost: Energy / Efficiency * Price
            double dailyCost = (dailyEnergyKwh / avgEfficiency) * gasPricePerKwh;
            double monthlyCost = dailyCost * 30;
            double annualCost = dailyCost * 365;

            return new HeatLossCalculationDto
            {
                // Individual losses
                WallHeatLoss = wallLoss,
                WindowHeatLoss = windowLoss,
                CeilingHeatLoss = ceilingLoss,
                FloorHeatLoss = floorLoss,

                // Totals
                TotalHeatLossBeforeSafety = totalBeforeSafety,
                SafetyFactor = safetyFactor,
                TotalHeatLoss = totalHeatLoss,
                RequiredPowerKw = requiredPowerKw,

                // Temperatures
                IndoorTemperature = indoorTemp,
                OutdoorTemperature = outdoorTemp,
                GroundTemperature = groundTemp,
                TemperatureDifference = tempDiff,

                // Costs
                DailyEnergyKwh = dailyEnergyKwh,
                DailyCostEur = dailyCost,
                MonthlyCostEur = monthlyCost,
                AnnualCostEur = annualCost,

                // Efficiency & Price
                BoilerEfficiency = avgEfficiency,
                GasPricePerKwh = gasPricePerKwh,

                // Capacity
                CurrentBoilerCapacityKw = currentCapacityKw,
                HasSufficientCapacity = hasSufficientCapacity,
                CapacityDeficitKw = capacityDeficit
            };
        }
    }
}