using Gas_Boiler_Backend.Data;
using Gas_Boiler_Backend.Interfaces;
using Gas_Boiler_Backend.Models;
using Microsoft.EntityFrameworkCore;

namespace Gas_Boiler_Backend.Repositories
{
    public class GasBoilerRepository : IGasBoilerRepository
    {
        private readonly AppDbContext _context;
        public GasBoilerRepository(AppDbContext context)
        {
            _context = context;
        }

        public async Task AddAsync(GasBoiler gasBoiler)
        {
            await _context.GasBoilers.AddAsync(gasBoiler);
        }

        public async Task DeleteAsync(GasBoiler gasBoiler)
        {
            _context.GasBoilers.Remove(gasBoiler);
            await Task.CompletedTask;
        }
        public async Task<bool> ExistsAsync(int id)
        {
            return await _context.GasBoilers.AnyAsync(gb => gb.Id == id);
        }

        public async Task<IEnumerable<GasBoiler>> GetAllAsync()
        {
            return await _context.GasBoilers
                .Include(g => g.BuildingObject) //
                .Include(gb => gb.User)
                .ToListAsync();
        }

        public async Task<IEnumerable<GasBoiler>> GetAllForUserAsync(int userId)
        {
            return await _context.GasBoilers
                .Where(g => g.UserId == userId)
                .Include(g => g.BuildingObject)
                .ToListAsync();
        }

        public async Task<GasBoiler?> GetByIdAsync(int id)
        {
            return await _context.GasBoilers
                .Include(g => g.BuildingObject)
                .Include(gb => gb.User) //
                .FirstOrDefaultAsync(g => g.Id == id);
        }

        public async Task<IEnumerable<(int BoilerId, double Lat, double Lon, string Name, double CurrentPower)>> GetMapPointsAllAsync()
        {
            return await _context.GasBoilers
                .Where(g => g.BuildingObject != null)
                .Select(g => new { BoilerId = g.Id, g.BuildingObject.Latitude, g.BuildingObject.Longitude, g.Name, g.CurrentPower })
                .AsNoTracking()
                .ToListAsync()
                .ContinueWith(t => t.Result.Select(x => (x.BoilerId, x.Latitude, x.Longitude, x.Name, x.CurrentPower)));
        }

        public async Task<IEnumerable<(int BoilerId, double Lat, double Lon, string Name, double CurrentPower)>> GetMapPointsForUserAsync(int userId)
        {
            return await _context.GasBoilers
                  .Where(g => g.UserId == userId && g.BuildingObject != null)
                  .Select(g => new { BoilerId = g.Id, g.BuildingObject.Latitude, g.BuildingObject.Longitude, g.Name, g.CurrentPower })
                  .AsNoTracking()
                  .ToListAsync()
                  .ContinueWith(t => t.Result.Select(x => (x.BoilerId, x.Latitude, x.Longitude, x.Name, x.CurrentPower)));
        }

        public async Task SaveChangesAsync()
        {
            await _context.SaveChangesAsync();
        }

        public async Task UpdateAsync(GasBoiler gasBoiler)
        {
            _context.GasBoilers.Update(gasBoiler);
            await Task.CompletedTask;
        }
    }
}
