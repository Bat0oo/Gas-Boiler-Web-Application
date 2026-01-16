using Gas_Boiler_Backend.DTO.Calculations;
using Gas_Boiler_Backend.Models;

namespace Gas_Boiler_Backend.Interfaces
{
    public interface IBuildingCalculatorService
    {
        Task<HeatLossCalculationDto> CalculateBuildingMetricsAsync(BuildingObject building);
    }
}