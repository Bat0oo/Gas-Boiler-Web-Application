using Gas_Boiler_Backend.DTO.HistoricalData;

namespace Gas_Boiler_Backend.Interfaces
{
    public interface IHistoricalDataService
    {
        Task RecordAllBuildingsAsync();
        Task RecordBuildingInitialReadingAsync(int buildingId);
        Task<SeedHistoricalDataResponse> SeedHistoricalDataAsync(int daysToGenerate = 30);
        Task<int> GetTotalReadingsCountAsync();
    }
}
