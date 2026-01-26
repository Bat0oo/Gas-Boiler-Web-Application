using Gas_Boiler_Backend.Interfaces;

namespace Gas_Boiler_Backend.Services
{
    public class DataRecordingBackgroundService : BackgroundService
    {
        private readonly IServiceProvider _serviceProvider;
        private readonly ILogger<DataRecordingBackgroundService> _logger;

        public DataRecordingBackgroundService(
            IServiceProvider serviceProvider,
            ILogger<DataRecordingBackgroundService> logger)
        {
            _serviceProvider = serviceProvider;
            _logger = logger;
        }

        protected override async Task ExecuteAsync(CancellationToken stoppingToken)
        {
            _logger.LogInformation("Data Recording Background Service STARTED");

            _logger.LogInformation("Waiting 2 minutes before first recording...");
            await Task.Delay(TimeSpan.FromMinutes(2), stoppingToken);

            while (!stoppingToken.IsCancellationRequested)
            {
                try
                {
                    // Get current interval setting
                    int intervalMinutes = await GetRecordingIntervalAsync();

                    _logger.LogInformation($"Time to record data! (Interval: {intervalMinutes} minutes)");
                    await RecordDataAsync();
                    _logger.LogInformation($"Recording complete. Next recording in {intervalMinutes} minutes");

                    // Wait for the configured interval
                    await Task.Delay(TimeSpan.FromMinutes(intervalMinutes), stoppingToken);
                }
                catch (TaskCanceledException)
                {
                    _logger.LogInformation("Background service stopping...");
                    break;
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex, "Error recording historical data");

                    // Wait 5 minutes before retrying on error
                    await Task.Delay(TimeSpan.FromMinutes(5), stoppingToken);
                }
            }

            _logger.LogInformation("Data Recording Background Service STOPPED");
        }

        private async Task<int> GetRecordingIntervalAsync()
        {
            using (var scope = _serviceProvider.CreateScope())
            {
                var settingsRepo = scope.ServiceProvider
                    .GetRequiredService<IDataManagementSettingsRepository>();

                var settings = await settingsRepo.GetAsync();

                // Return configured interval or default to 60 minutes
                return settings?.RecordingIntervalMinutes ?? 60;
            }
        }

        private async Task RecordDataAsync()
        {
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