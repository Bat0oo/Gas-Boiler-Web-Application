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
        public DbSet<BuildingReading> BuildingReadings { get; set; }
        public DbSet<DataManagementSettings> DataManagementSettings { get; set; }

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
                .WithMany(b => b.GasBoilers) 
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

            modelBuilder.Entity<SystemParameters>()
                .HasKey(sp => sp.Id);

            modelBuilder.Entity<SystemParameters>().HasData(
    new SystemParameters
    {
        Id = 1,
        WallUValue = 0.50m,
        WindowUValue = 1.40m,
        CeilingUValue = 0.25m,
        FloorUValue = 0.40m,
        OutdoorDesignTemp = -15.0m,
        GroundTemp = 10.0m,              
        GasPricePerKwh = 0.05m,        
        LastUpdated = new DateTime(2025, 1, 1, 0, 0, 0, DateTimeKind.Utc),
        UpdatedBy = "System"
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
