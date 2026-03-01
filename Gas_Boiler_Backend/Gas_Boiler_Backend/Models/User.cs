using System.ComponentModel.DataAnnotations;

namespace Gas_Boiler_Backend.Models
{
    public class User
    {
        [Key]
        public int Id { get; set; }

        [Required]
        [MaxLength(100)]
        public string Username { get; set; } = string.Empty;

        [Required]
        [EmailAddress]
        [MaxLength(100)]
        public string Email { get; set; } = string.Empty;

        [Required]
        public string PasswordHash { get; set; } = string.Empty;

        [Required]
        [MaxLength(20)]
        public string Role { get; set; } = "User"; // "Admin" or "User"

        public bool IsBlocked { get; set; } = false;

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        public ICollection<GasBoiler> GasBoilers { get; set; } = new List<GasBoiler>();
        public ICollection<BuildingObject> BuildingObjects { get; set; } = new List<BuildingObject>();
    }
}
