using Microsoft.AspNetCore.SignalR;

namespace Gas_Boiler_Backend.Hubs
{
    public class BoilerHub : Hub
    {
        private readonly ILogger<BoilerHub> _logger;

        public BoilerHub(ILogger<BoilerHub> logger)
        {
            _logger = logger;
        }

        public override async Task OnConnectedAsync()
        {
            var userId = Context.User?.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
            var username = Context.User?.FindFirst(System.Security.Claims.ClaimTypes.Name)?.Value;

            _logger.LogInformation($"Client connected: {username ?? "Anonymous"} (ConnectionId: {Context.ConnectionId})");

            await base.OnConnectedAsync();
        }

        public override async Task OnDisconnectedAsync(Exception? exception)
        {
            var username = Context.User?.FindFirst(System.Security.Claims.ClaimTypes.Name)?.Value;
            _logger.LogInformation($"Client disconnected: {username ?? "Anonymous"} (ConnectionId: {Context.ConnectionId})");

            if (exception != null)
            {
                _logger.LogWarning($"Client disconnected with error: {exception.Message}");
            }

            await base.OnDisconnectedAsync(exception);
        }
    }
}