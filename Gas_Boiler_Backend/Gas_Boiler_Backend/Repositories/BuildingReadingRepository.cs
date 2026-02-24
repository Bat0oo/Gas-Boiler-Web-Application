using Gas_Boiler_Backend.Data;
using Gas_Boiler_Backend.Interfaces;
using Gas_Boiler_Backend.Models;
using Microsoft.EntityFrameworkCore;

namespace Gas_Boiler_Backend.Repositories
{
    public class BuildingReadingRepository : IBuildingReadingRepository
    {
        private readonly AppDbContext _context;

        public BuildingReadingRepository(AppDbContext context)
        {
            _context = context;
        }

        public async Task<BuildingReading> CreateAsync(BuildingReading reading)
        {
            _context.BuildingReadings.Add(reading);
            await _context.SaveChangesAsync();
            return reading;
        }

        public async Task<IEnumerable<BuildingReading>> CreateManyAsync(IEnumerable<BuildingReading> readings)
        {
            await _context.BuildingReadings.AddRangeAsync(readings);
            await _context.SaveChangesAsync();
            return readings;
        }

        public async Task<IEnumerable<BuildingReading>> GetByBuildingIdAsync(int buildingId, DateTime? startDate = null, DateTime? endDate = null)
        {
            var query = _context.BuildingReadings
                .Include(r => r.Building)
                .Where(r => r.BuildingId == buildingId);

            if (startDate.HasValue)
                query = query.Where(r => r.Timestamp >= startDate.Value);

            if (endDate.HasValue)
                query = query.Where(r => r.Timestamp <= endDate.Value);

            return await query.OrderBy(r => r.Timestamp).ToListAsync();
        }

        public async Task<IEnumerable<BuildingReading>> GetAllAsync(DateTime? startDate = null, DateTime? endDate = null)
        {
            var query = _context.BuildingReadings
                .Include(r => r.Building)
                .AsQueryable();

            if (startDate.HasValue)
                query = query.Where(r => r.Timestamp >= startDate.Value);

            if (endDate.HasValue)
                query = query.Where(r => r.Timestamp <= endDate.Value);

            return await query
                .OrderBy(r => r.BuildingId)
                .ThenBy(r => r.Timestamp)
                .ToListAsync();
        }

        public async Task<BuildingReading?> GetLatestByBuildingIdAsync(int buildingId)
        {
            return await _context.BuildingReadings
                .Include(r => r.Building)
                .Where(r => r.BuildingId == buildingId)
                .OrderByDescending(r => r.Timestamp)
                .FirstOrDefaultAsync();
        }

        public async Task<int> GetCountAsync()
        {
            return await _context.BuildingReadings.CountAsync();
        }

        public async Task DeleteAllAsync()
        {
            var allReadings = await _context.BuildingReadings.ToListAsync();
            _context.BuildingReadings.RemoveRange(allReadings);
            await _context.SaveChangesAsync();
        }

        public async Task DeleteByBuildingIdAsync(int buildingId)
        {
            var readings = await _context.BuildingReadings
                .Where(r => r.BuildingId == buildingId)
                .ToListAsync();

            _context.BuildingReadings.RemoveRange(readings);
            await _context.SaveChangesAsync();
        }
        public async Task UpdateAsync(BuildingReading reading)
        {
            _context.BuildingReadings.Update(reading);
        }

        public async Task SaveChangesAsync()
        {
            await _context.SaveChangesAsync();
        }
    }
}