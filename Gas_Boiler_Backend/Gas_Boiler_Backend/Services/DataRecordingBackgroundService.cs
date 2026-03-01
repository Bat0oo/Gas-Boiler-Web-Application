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
            _logger.LogInformation("📊 Data Recording Background Service STARTED");
            _logger.LogInformation("Waiting 30 seconds before first recording...");

            await Task.Delay(TimeSpan.FromSeconds(30), stoppingToken);

            while (!stoppingToken.IsCancellationRequested)
            {
                try
                {
                    // Get current interval setting BEFORE recording
                    int intervalMinutes = await GetRecordingIntervalAsync();

                    _logger.LogInformation($"📊 Time to record data! (Current interval: {intervalMinutes} minutes)");

                    await RecordDataAsync();

                    _logger.LogInformation($"✅ Recording complete. Next recording in {intervalMinutes} minutes");

                    var elapsed = 0;
                    var checkIntervalSeconds = 30; // Check every 30 seconds

                    while (elapsed < intervalMinutes * 60 && !stoppingToken.IsCancellationRequested)
                    {
                        await Task.Delay(TimeSpan.FromSeconds(checkIntervalSeconds), stoppingToken);
                        elapsed += checkIntervalSeconds;

                        // Check if interval changed
                        var newInterval = await GetRecordingIntervalAsync();
                        if (newInterval != intervalMinutes)
                        {
                            _logger.LogInformation($"⚠️ Interval changed from {intervalMinutes} to {newInterval} minutes. Adjusting...");
                            intervalMinutes = newInterval;
                            // Recalculate remaining time
                            break; // Exit wait loop and start new cycle
                        }
                    }
                }
                catch (TaskCanceledException)
                {
                    _logger.LogInformation("Background service stopping...");
                    break;
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex, "❌ Error recording historical data");
                    await Task.Delay(TimeSpan.FromMinutes(5), stoppingToken);
                }
            }

            _logger.LogInformation("📊 Data Recording Background Service STOPPED");
        }

        private async Task<int> GetRecordingIntervalAsync()
        {
            using (var scope = _serviceProvider.CreateScope())
            {
                var settingsRepo = scope.ServiceProvider
                    .GetRequiredService<IDataManagementSettingsRepository>();
                var settings = await settingsRepo.GetAsync();

                var interval = settings?.RecordingIntervalMinutes ?? 60;

                return interval;
            }
        }

        private async Task RecordDataAsync()
        {
            using (var scope = _serviceProvider.CreateScope())
            {
                // 1. Record historical data for all buildings
                var historicalDataService = scope.ServiceProvider
                    .GetRequiredService<IHistoricalDataService>();
                await historicalDataService.RecordAllBuildingsAsync();

                _logger.LogInformation("Historical data recorded. Now checking for alarms...");

                // 2. Check for alarms based on latest readings
                var alarmService = scope.ServiceProvider
                    .GetRequiredService<IAlarmService>();
                await alarmService.CheckAndCreateAlarmsAsync();

                _logger.LogInformation("Alarm check complete");
            }
        }

        public override async Task StopAsync(CancellationToken cancellationToken)
        {
            _logger.LogInformation("🛑 Stop signal received");
            await base.StopAsync(cancellationToken);
        }
    }
}