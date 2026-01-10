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
            // This should rarely be called as seed data exists in AppDbContext
            // If called, it means database was not properly initialized
            throw new InvalidOperationException(
                "SystemParameters not found in database. Please ensure database is properly initialized with seed data.");
        }

        public async Task<SystemParameters> UpdateAsync(SystemParameters parameters)
        {
            _context.SystemParameters.Update(parameters);
            await _context.SaveChangesAsync();
            return parameters;
        }
    }
}
