using Gas_Boiler_Backend.Data;
using Gas_Boiler_Backend.Interfaces;
using Gas_Boiler_Backend.Models;
using Microsoft.EntityFrameworkCore;

namespace Gas_Boiler_Backend.Repositories
{
    public class SystemParametersRepository : ISystemParametersRepository
    {
        private readonly AppDbContext _context;

        public SystemParametersRepository(AppDbContext context)
        {
            _context = context;
        }
        public async Task<bool> ExistsAsync()
        {
            return await _context.SystemParameters.AnyAsync();
        }

        public async Task<SystemParameters?> GetAsync()
        {
            return await _context.SystemParameters.FirstOrDefaultAsync();
        }

        public async Task<SystemParameters> InitializeAsync()
        {
            var parameters = new SystemParameters
            {
                WallUValue = 0.50m,      
                WindowUValue = 1.40m,   
                CeilingUValue = 0.25m,   
                FloorUValue = 0.40m,     

                OutdoorDesignTemp = -15.0m,  
                GroundTemp = 10.0m,          

                GasPricePerKwh = 0.05m,      

                LastUpdated = DateTime.UtcNow,
                UpdatedBy = "System"
            };

            _context.SystemParameters.Add(parameters);
            await _context.SaveChangesAsync();
            return parameters;

        }

        public async Task<SystemParameters> UpdateAsync(SystemParameters parameters)
        {
            _context.SystemParameters.Update(parameters);
            await _context.SaveChangesAsync();
            return parameters;
        }
    }
}
