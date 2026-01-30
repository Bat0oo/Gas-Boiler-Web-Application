using Gas_Boiler_Backend.Data;
using Gas_Boiler_Backend.DTO.Alarms;
using Gas_Boiler_Backend.Interfaces;
using Gas_Boiler_Backend.Models;
using Microsoft.EntityFrameworkCore;

namespace Gas_Boiler_Backend.Repositories
{
    public class AlarmRepository : IAlarmRepository
    {
        private readonly AppDbContext _context;

        public AlarmRepository(AppDbContext context)
        {
            _context = context;
        }

        public async Task<Alarm> CreateAsync(Alarm alarm)
        {
            _context.Alarms.Add(alarm);
            await _context.SaveChangesAsync();
            return alarm;
        }

        public async Task<Alarm?> GetByIdAsync(int id)
        {
            return await _context.Alarms
                .Include(a => a.Building)
                .FirstOrDefaultAsync(a => a.Id == id);
        }

        public async Task<IEnumerable<Alarm>> GetAllAsync(AlarmFiltersDto? filters = null)
        {
            var query = _context.Alarms
                .Include(a => a.Building)
                .AsQueryable();

            if (filters != null)
            {
                if (!string.IsNullOrEmpty(filters.Type))
                    query = query.Where(a => a.Type == filters.Type);

                if (!string.IsNullOrEmpty(filters.Severity))
                    query = query.Where(a => a.Severity == filters.Severity);

                if (filters.BuildingId.HasValue)
                    query = query.Where(a => a.BuildingId == filters.BuildingId.Value);

                if (filters.UserId.HasValue)
                    query = query.Where(a => a.Building.UserId == filters.UserId.Value);

                if (filters.IsActive.HasValue)
                    query = query.Where(a => a.IsActive == filters.IsActive.Value);

                if (filters.IsAcknowledged.HasValue)
                    query = query.Where(a => a.IsAcknowledged == filters.IsAcknowledged.Value);

                if (filters.StartDate.HasValue)
                    query = query.Where(a => a.CreatedAt >= filters.StartDate.Value);

                if (filters.EndDate.HasValue)
                    query = query.Where(a => a.CreatedAt <= filters.EndDate.Value);
            }

            return await query.OrderByDescending(a => a.CreatedAt).ToListAsync();
        }

        public async Task<IEnumerable<Alarm>> GetActiveAlarmsAsync(int? userId = null)
        {
            var query = _context.Alarms
                .Include(a => a.Building)
                .Where(a => a.IsActive);

            if (userId.HasValue)
            {
                query = query.Where(a => a.Building.UserId == userId.Value);
            }

            return await query.OrderByDescending(a => a.CreatedAt).ToListAsync();
        }

        public async Task<Alarm?> UpdateAsync(Alarm alarm)
        {
            _context.Alarms.Update(alarm);
            await _context.SaveChangesAsync();
            return alarm;
        }

        public async Task<bool> DeleteAsync(int id)
        {
            var alarm = await _context.Alarms.FindAsync(id);
            if (alarm == null) return false;

            _context.Alarms.Remove(alarm);
            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<int> GetCountAsync(AlarmFiltersDto? filters = null)
        {
            var query = _context.Alarms.AsQueryable();

            if (filters != null)
            {
                if (!string.IsNullOrEmpty(filters.Type))
                    query = query.Where(a => a.Type == filters.Type);

                if (!string.IsNullOrEmpty(filters.Severity))
                    query = query.Where(a => a.Severity == filters.Severity);

                if (filters.BuildingId.HasValue)
                    query = query.Where(a => a.BuildingId == filters.BuildingId.Value);

                if (filters.UserId.HasValue)
                    query = query.Where(a => a.Building.UserId == filters.UserId.Value);

                if (filters.IsActive.HasValue)
                    query = query.Where(a => a.IsActive == filters.IsActive.Value);

                if (filters.IsAcknowledged.HasValue)
                    query = query.Where(a => a.IsAcknowledged == filters.IsAcknowledged.Value);

                if (filters.StartDate.HasValue)
                    query = query.Where(a => a.CreatedAt >= filters.StartDate.Value);

                if (filters.EndDate.HasValue)
                    query = query.Where(a => a.CreatedAt <= filters.EndDate.Value);
            }

            return await query.CountAsync();
        }

        public async Task<bool> ExistsRecentAlarmAsync(string type, int buildingId, int cooldownMinutes)
        {
            var cooldownTime = DateTime.UtcNow.AddMinutes(-cooldownMinutes);

            return await _context.Alarms
                .AnyAsync(a =>
                    a.Type == type &&
                    a.BuildingId == buildingId &&
                    a.CreatedAt >= cooldownTime);
        }
    }
}
