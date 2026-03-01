using Gas_Boiler_Backend.Models;

namespace Gas_Boiler_Backend.Interfaces
{
    public interface ISystemParametersRepository
    {
        Task<SystemParameters?> GetAsync();

        Task<SystemParameters> UpdateAsync(SystemParameters parameters);

        Task<bool> ExistsAsync();

        Task<SystemParameters> InitializeAsync();
    }
}
