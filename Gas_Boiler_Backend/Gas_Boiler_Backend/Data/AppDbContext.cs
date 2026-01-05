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
                .OnDelete(DeleteBehavior.Restrict);

            // GasBoiler - BuildingObject relationship (one-to-many)
            modelBuilder.Entity<User>()
                .HasMany(u => u.BuildingObjects)
                .WithOne(b => b.User)
                .HasForeignKey(b => b.UserId)
                .OnDelete(DeleteBehavior.Restrict);  // Prevent deleting user if they have buildings

            modelBuilder.Entity<GasBoiler>()
                .HasOne(g => g.BuildingObject)
                .WithMany(b => b.GasBoilers)  // CHANGED: WithMany instead of WithOne
                .HasForeignKey(g => g.BuildingObjectId)
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

            //INDEXEX FOR PERFORMANCE

            // User indexes
            modelBuilder.Entity<User>()
                .HasIndex(u => u.Email)
                .IsUnique();

            modelBuilder.Entity<User>()
                .HasIndex(u => u.Username)
                .IsUnique();

            // BuildingObject indexes
            modelBuilder.Entity<BuildingObject>()
                .HasIndex(b => b.UserId);

            // GasBoiler indexes
            modelBuilder.Entity<GasBoiler>()
                .HasIndex(g => g.UserId);

            modelBuilder.Entity<GasBoiler>()
                .HasIndex(g => g.BuildingObjectId);  // Important for queries!

            // HistoricalData indexes
            modelBuilder.Entity<HistoricalData>()
                .HasIndex(h => h.GasBoilerId);

            modelBuilder.Entity<HistoricalData>()
                .HasIndex(h => h.Timestamp);

            // Alarm indexes
            modelBuilder.Entity<Alarm>()
                .HasIndex(a => a.GasBoilerId);

            modelBuilder.Entity<Alarm>()
                .HasIndex(a => a.IsResolved);


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

            string adminPasswordHash = "$2a$12$xYluxINGkkohipBPd/xZLe2cJl2Y7dSomJAu5WT8MJRkd8u6J6nJW";
            modelBuilder.Entity<User>().HasData(
        new User
        {
            Id = 1, 
            Username = "admin",
            Email = "admin@example.com",
            PasswordHash = adminPasswordHash,
            Role = "Admin", 
            CreatedAt = new DateTime(2025, 1, 1, 0, 0, 0, DateTimeKind.Utc)  // ⭐ STATIC DATE
        }
    );

        }
    }
}
