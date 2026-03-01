using Gas_Boiler_Backend.DTO.Dashboard;

namespace Gas_Boiler_Backend.Interfaces
{
    public interface IDashboardService
    {
        Task<DashboardStatsDto> GetDashboardStatsAsync(int userId, bool isAdmin);
    }
}
