using Gas_Boiler_Backend.Interfaces;

namespace Gas_Boiler_Backend.Services
{
    public class DataRecordingBackgroundService : BackgroundService
    {
        private readonly IServiceProvider _serviceProvider;
        private readonly ILogger<DataRecordingBackgroundService> _logger;

        // Record data every hour
        private readonly TimeSpan _recordingInterval = TimeSpan.FromHours(1);

        public DataRecordingBackgroundService(
            IServiceProvider serviceProvider,
            ILogger<DataRecordingBackgroundService> logger)
        {
            _serviceProvider = serviceProvider;
            _logger = logger;
        }

        protected override async Task ExecuteAsync(CancellationToken stoppingToken)
        {
            _logger.LogInformation("🚀 Data Recording Background Service STARTED");
            _logger.LogInformation($"📊 Recording interval: {_recordingInterval.TotalMinutes} minutes");

            _logger.LogInformation("⏳ Waiting 2 minutes before first recording...");
            await Task.Delay(TimeSpan.FromMinutes(2), stoppingToken);

            while (!stoppingToken.IsCancellationRequested)
            {
                try
                {
                    _logger.LogInformation("⏰ Time to record data!");
                    await RecordDataAsync();
                    _logger.LogInformation($"✅ Recording complete. Next recording in {_recordingInterval.TotalMinutes} minutes");
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex, "❌ Error recording historical data");
                }

                try
                {
                    await Task.Delay(_recordingInterval, stoppingToken);
                }
                catch (TaskCanceledException)
                {
                    _logger.LogInformation("⏹️ Background service stopping...");
                    break;
                }
            }

            _logger.LogInformation("🛑 Data Recording Background Service STOPPED");
        }

        private async Task RecordDataAsync()
        {
            // Create a scope to get scoped services
            using (var scope = _serviceProvider.CreateScope())
            {
                var historicalDataService = scope.ServiceProvider
                    .GetRequiredService<IHistoricalDataService>();

                await historicalDataService.RecordAllBuildingsAsync();
            }
        }

        public override async Task StopAsync(CancellationToken cancellationToken)
        {
            _logger.LogInformation("🛑 Stop signal received");
            await base.StopAsync(cancellationToken);
        }
    }
}