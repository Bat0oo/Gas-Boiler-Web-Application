using Gas_Boiler_Backend.Models;
using Microsoft.EntityFrameworkCore;

namespace Gas_Boiler_Backend.Data
{
    public class AppDbContext : DbContext
    {
        public AppDbContext(DbContextOptions<AppDbContext> options) : base(options)
        {
        }

        public DbSet<User> Users { get; set; }
        public DbSet<GasBoiler> GasBoilers { get; set; }
        public DbSet<BuildingObject> BuildingObjects { get; set; }
        public DbSet<HistoricalData> HistoricalData { get; set; }
        public DbSet<Alarm> Alarms { get; set; }
        public DbSet<SystemParameters> SystemParameters { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            // User - GasBoiler relationship
            modelBuilder.Entity<User>()
                .HasMany(u => u.GasBoilers)
                .WithOne(gb => gb.User)
                .HasForeignKey(gb => gb.UserId)
                .OnDelete(DeleteBehavior.Cascade);

            // GasBoiler - BuildingObject relationship (one-to-one)
            modelBuilder.Entity<GasBoiler>()
                .HasOne(gb => gb.BuildingObject)
                .WithOne(bo => bo.GasBoiler)
                .HasForeignKey<BuildingObject>(bo => bo.GasBoilerId)
                .OnDelete(DeleteBehavior.Cascade);

            // GasBoiler - HistoricalData relationship
            modelBuilder.Entity<GasBoiler>()
                .HasMany(gb => gb.HistoricalData)
                .WithOne(hd => hd.GasBoiler)
                .HasForeignKey(hd => hd.GasBoilerId)
                .OnDelete(DeleteBehavior.Cascade);

            // GasBoiler - Alarm relationship
            modelBuilder.Entity<GasBoiler>()
                .HasMany(gb => gb.Alarms)
                .WithOne(a => a.GasBoiler)
                .HasForeignKey(a => a.GasBoilerId)
                .OnDelete(DeleteBehavior.Cascade);


            modelBuilder.Entity<SystemParameters>().HasData(
                new SystemParameters
                {
                    Id = 1,
                    ParameterName = "GroundTemperature",
                    Value = 10,
                    Unit = "°C",
                    Description = "Average ground temperature",
                    UpdatedAt = new DateTime(2025, 1, 1, 0, 0, 0, DateTimeKind.Utc)  // ⭐ STATIC DATE
                },
                new SystemParameters
                {
                    Id = 2,
                    ParameterName = "GasPricePerKWh",
                    Value = 5.5,
                    Unit = "RSD/kWh",
                    Description = "Price of natural gas per kWh",
                    UpdatedAt = new DateTime(2025, 1, 1, 0, 0, 0, DateTimeKind.Utc)  // ⭐ STATIC DATE
                }
                    );
        }
    }
}
