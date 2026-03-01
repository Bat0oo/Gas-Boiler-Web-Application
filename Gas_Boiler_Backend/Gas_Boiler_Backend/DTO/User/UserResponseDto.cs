namespace Gas_Boiler_Backend.DTO.User
{
    public class UserResponseDto
    {
        public int Id { get; set; }
        public string Username { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string Role { get; set; } = string.Empty;
        public DateTime CreatedAt { get; set; }
        public int GasBoilersCount { get; set; }
        public bool IsBlocked { get; set; }
    }
}
