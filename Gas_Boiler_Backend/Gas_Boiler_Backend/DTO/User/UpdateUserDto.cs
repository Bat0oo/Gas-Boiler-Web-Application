namespace Gas_Boiler_Backend.DTO.User
{
    public class UpdateUserDto
    {
        public string? Username { get; set; }
        public string? Email { get; set; }
        public string? CurrentPassword { get; set; }
        public string? NewPassword { get; set; }
    }
}
