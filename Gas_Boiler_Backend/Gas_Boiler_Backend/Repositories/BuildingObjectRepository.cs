using Gas_Boiler_Backend.Data;
using Gas_Boiler_Backend.Interfaces;
using Gas_Boiler_Backend.Models;
using Microsoft.EntityFrameworkCore;

namespace Gas_Boiler_Backend.Repositories
{
    public class BuildingObjectRepository : IBuildingObjectRepository
    {
        private readonly AppDbContext _context;

        public BuildingObjectRepository(AppDbContext context)
        {
            _context = context;
        }

        public async Task<BuildingObject?> GetByIdAsync(int id)
        {
            return await _context.BuildingObjects
                .FirstOrDefaultAsync(b => b.Id == id);
        }

        public async Task<BuildingObject?> GetByIdWithBoilersAsync(int id)
        {
            return await _context.BuildingObjects
                .Include(b => b.GasBoilers)  // Include all boilers in this building
                .FirstOrDefaultAsync(b => b.Id == id);
        }

        public async Task<IEnumerable<BuildingObject>> GetAllAsync()
        {
            return await _context.BuildingObjects
                .Include(b => b.GasBoilers)  // Include boiler count
                .ToListAsync();
        }

        public async Task<IEnumerable<BuildingObject>> GetByUserIdAsync(int userId)
        {
            return await _context.BuildingObjects
                .Where(b => b.UserId == userId)
                .ToListAsync();
        }

        public async Task<IEnumerable<BuildingObject>> GetByUserIdWithBoilersAsync(int userId)
        {
            return await _context.BuildingObjects
                .Include(b => b.GasBoilers)
                .Where(b => b.UserId == userId)
                .ToListAsync();
        }

        public async Task AddAsync(BuildingObject buildingObject)
        {
            await _context.BuildingObjects.AddAsync(buildingObject);
        }

        public async Task UpdateAsync(BuildingObject buildingObject)
        {
            _context.BuildingObjects.Update(buildingObject);
            await Task.CompletedTask;
        }

        public async Task DeleteAsync(BuildingObject buildingObject)
        {
            _context.BuildingObjects.Remove(buildingObject);
            await Task.CompletedTask;
        }

        public async Task<bool> ExistsAsync(int id)
        {
            return await _context.BuildingObjects
                .AnyAsync(b => b.Id == id);
        }

        public async Task<bool> UserOwnsBuilding(int buildingId, int userId)
        {
            return await _context.BuildingObjects
                .AnyAsync(b => b.Id == buildingId && b.UserId == userId);
        }

        public async Task SaveChangesAsync()
        {
            await _context.SaveChangesAsync();
        }
    }
}