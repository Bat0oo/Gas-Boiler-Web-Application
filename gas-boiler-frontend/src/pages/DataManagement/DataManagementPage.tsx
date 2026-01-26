import React, { useEffect, useState } from 'react';
import Navbar from '../../components/Navbar';
import { useAuth } from '../../context/AuthContext';
import { dataManagementService } from '../../services/dataManagementService';
import {
  DataManagementSettings,
  DataStatistics,
  IntervalOption,
} from '../../types/datamanagementtypes';
import './DataManagementPage.css';

const DataManagementPage: React.FC = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [settings, setSettings] = useState<DataManagementSettings | null>(null);
  const [statistics, setStatistics] = useState<DataStatistics | null>(null);

  const [selectedInterval, setSelectedInterval] = useState<number>(60);
  const [isSavingInterval, setIsSavingInterval] = useState(false);
  const [intervalMessage, setIntervalMessage] = useState('');

  const [isSeeding, setIsSeeding] = useState(false);
  const [seedMessage, setSeedMessage] = useState('');

  const [isExporting, setIsExporting] = useState(false);
  const [exportMessage, setExportMessage] = useState('');

  const [isClearing, setIsClearing] = useState(false);
  const [clearMessage, setClearMessage] = useState('');

  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());

  const intervalOptions: IntervalOption[] = [
    { label: '1 minute (for demos)', value: 1, description: 'Demo mode' },
    { label: '5 minutes', value: 5 },
    { label: '15 minutes', value: 15 },
    { label: '30 minutes', value: 30 },
    { label: '1 hour (recommended)', value: 60, description: 'Default' },
    { label: '6 hours', value: 360 },
    { label: '24 hours', value: 1440 },
  ];

 useEffect(() => {
  loadData();
  
  // Auto-refresh statistics every 30 seconds
  const interval = setInterval(() => {
    loadStatistics();
  }, 30000);
  
  return () => clearInterval(interval);
}, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [settingsData, statsData] = await Promise.all([
        dataManagementService.getSettings(user!.token),
        dataManagementService.getStatistics(user!.token),
      ]);
      setSettings(settingsData);
      setStatistics(statsData);
      setSelectedInterval(settingsData.recordingIntervalMinutes);
    } catch (err) {
      console.error('Error loading data:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadStatistics = async () => {
  try {
    const statsData = await dataManagementService.getStatistics(user!.token);
    setStatistics(statsData);
    setLastUpdated(new Date()); // Update last refresh time
  } catch (err) {
    console.error('Error loading statistics:', err);
  }
};

  const handleSaveInterval = async () => {
    setIsSavingInterval(true);
    setIntervalMessage('');

    try {
      const updated = await dataManagementService.updateSettings(user!.token, {
        recordingIntervalMinutes: selectedInterval,
      });
      setSettings(updated);
      setIntervalMessage(`✅ Recording interval updated to ${selectedInterval} minutes`);
      setTimeout(() => setIntervalMessage(''), 5000);
    } catch (err: any) {
      setIntervalMessage(`❌ Error: ${err.response?.data?.message || err.message}`);
    } finally {
      setIsSavingInterval(false);
    }
  };

  const handleGenerateTestData = async () => {
    if (
      !window.confirm(
        'Generate 30 days of test data for all buildings? This will add approximately 720 readings per building.'
      )
    ) {
      return;
    }

    setIsSeeding(true);
    setSeedMessage('');

    try {
      const response = await dataManagementService.seedData(user!.token, 30);
      setSeedMessage(`✅ ${response.message}`);
      await loadData(); // Reload statistics
    } catch (err: any) {
      setSeedMessage(`❌ Error: ${err.response?.data?.message || err.message}`);
    } finally {
      setIsSeeding(false);
    }
  };

  const handleExportCsv = async () => {
    setIsExporting(true);
    setExportMessage('');

    try {
      const blob = await dataManagementService.exportCsv(user!.token);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `historical_data_${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      setExportMessage('✅ Data exported successfully!');
      setTimeout(() => setExportMessage(''), 5000);
    } catch (err: any) {
      setExportMessage(`❌ Error: ${err.response?.data?.message || err.message}`);
    } finally {
      setIsExporting(false);
    }
  };

  const handleClearAllData = async () => {
    // First confirmation
    if (
      !window.confirm(
        '⚠️ WARNING! This will delete ALL historical data! Are you absolutely sure?'
      )
    ) {
      return;
    }

    // Second confirmation - type to confirm
    const confirmation = prompt(
      `Type "DELETE" (in capital letters) to confirm deletion of ${statistics?.totalReadings || 0} readings:`
    );
    if (confirmation !== 'DELETE') {
      alert('❌ Deletion cancelled.');
      return;
    }

    // Third confirmation
    if (
      !window.confirm(
        `🚨 FINAL WARNING! Delete all ${statistics?.totalReadings || 0} readings? This CANNOT be undone!`
      )
    ) {
      return;
    }

    setIsClearing(true);
    setClearMessage('');

    try {
      await dataManagementService.clearAllData(user!.token);
      setClearMessage('✅ All historical data cleared successfully');
      await loadData(); // Reload statistics
    } catch (err: any) {
      setClearMessage(`❌ Error: ${err.response?.data?.message || err.message}`);
    } finally {
      setIsClearing(false);
    }
  };

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="data-management-container">
          <div className="loading">⏳ Loading...</div>
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className="data-management-container">
        <div className="data-management-card">
          <div className="page-header">
            <h1>📊 Data Management</h1>
            <p className="page-description">
              Manage background recording service, historical data, and data operations
            </p>
          </div>

          {/* Recording Service Settings */}
          <div className="management-section recording-section">
            <h2>🕐 Background Recording Service</h2>
            <p className="section-description">
              Configure how often the system automatically records building data. Changes apply
              immediately - no restart required!
            </p>

            <div className="interval-selector">
              <label htmlFor="interval">Recording Interval:</label>
              <select
                id="interval"
                value={selectedInterval}
                onChange={(e) => setSelectedInterval(Number(e.target.value))}
                disabled={isSavingInterval}
              >
                {intervalOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              <button
                onClick={handleSaveInterval}
                disabled={isSavingInterval || selectedInterval === settings?.recordingIntervalMinutes}
                className="btn btn-primary"
              >
                {isSavingInterval ? '⏳ Saving...' : '💾 Save Interval'}
              </button>
            </div>

            {intervalMessage && (
              <div
                className={`message ${intervalMessage.startsWith('✅') ? 'success' : 'error'}`}
              >
                {intervalMessage}
              </div>
            )}

            {settings && (
              <div className="service-status">
                <div className="status-item">
                  <span className="status-label">Status:</span>
                  <span className="status-value running">✅ Running</span>
                </div>
                <div className="status-item">
                  <span className="status-label">Current Interval:</span>
                  <span className="status-value">
                    {settings.recordingIntervalMinutes} minute
                    {settings.recordingIntervalMinutes !== 1 ? 's' : ''}
                  </span>
                </div>
                <div className="status-item">
                  <span className="status-label">Last Updated:</span>
                  <span className="status-value">
                    {new Date(settings.lastUpdated).toLocaleString()} by {settings.updatedBy}
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Historical Data Operations */}
          <div className="management-section data-section">
            <h2>📊 Historical Data Operations</h2>

            {/* Statistics */}
            {statistics && (
              <div className="statistics-grid">
                <div className="stat-card">
                  <div className="stat-icon">📈</div>
                  <div className="stat-value">{statistics.totalReadings.toLocaleString()}</div>
                  <div className="stat-label">Total Readings</div>
                </div>
                <div className="stat-card">
                  <div className="stat-icon">🏢</div>
                  <div className="stat-value">{statistics.totalBuildings}</div>
                  <div className="stat-label">Buildings Tracked</div>
                </div>
                <div className="stat-card date-range">
                  <div className="stat-icon">📅</div>
                  <div className="stat-value">{statistics.dateRange}</div>
                  <div className="stat-label">Date Range</div>
                </div>
              </div>
            )}
            <div style={{ 
  textAlign: 'center', 
  color: '#64748b', 
  fontSize: '0.85rem',
  marginTop: '0.5rem',
  fontStyle: 'italic',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: '0.5rem'
}}>
  <span>🔄 Auto-refresh enabled</span>
  <span>•</span>
  <span>Last updated: {lastUpdated.toLocaleTimeString()}</span>
</div>

            {/* Generate Test Data */}
            <div className="operation-box">
              <h3>🔄 Generate Test Data</h3>
              <p>
                Create 30 days of historical readings for all buildings (720 readings per building).
                Useful for testing charts and demos.
              </p>
              <button
                onClick={handleGenerateTestData}
                disabled={isSeeding}
                className="btn btn-primary btn-full"
              >
                {isSeeding
                  ? '⏳ Generating... Please wait (~20 seconds)'
                  : '🔄 Generate 30 Days of Test Data'}
              </button>
              {seedMessage && (
                <div className={`message ${seedMessage.startsWith('✅') ? 'success' : 'error'}`}>
                  {seedMessage}
                </div>
              )}
            </div>

            {/* Export Data */}
            <div className="operation-box">
              <h3>📥 Export Data</h3>
              <p>Download all historical data as CSV file for analysis in Excel or other tools.</p>
              <button
                onClick={handleExportCsv}
                disabled={isExporting || !statistics || statistics.totalReadings === 0}
                className="btn btn-secondary btn-full"
              >
                {isExporting ? '⏳ Exporting...' : '📄 Export All Data as CSV'}
              </button>
              {exportMessage && (
                <div className={`message ${exportMessage.startsWith('✅') ? 'success' : 'error'}`}>
                  {exportMessage}
                </div>
              )}
            </div>

            {/* Danger Zone */}
            <div className="operation-box danger-box">
              <h3>⚠️ Danger Zone</h3>
              <p>
                <strong>Clear All Historical Data:</strong> This action will permanently delete ALL
                {statistics?.totalReadings ? ` ${statistics.totalReadings.toLocaleString()}` : ''}{' '}
                readings from the database. This action cannot be undone!
              </p>
              <button
                onClick={handleClearAllData}
                disabled={isClearing || !statistics || statistics.totalReadings === 0}
                className="btn btn-danger btn-full"
              >
                {isClearing ? '⏳ Clearing...' : '🗑️ Clear All Historical Data'}
              </button>
              {clearMessage && (
                <div className={`message ${clearMessage.startsWith('✅') ? 'success' : 'error'}`}>
                  {clearMessage}
                </div>
              )}
            </div>
          </div>

          <div className="info-note">
            <p>
              💡 <strong>Note:</strong> The background service automatically records new data at
              the configured interval. Test data generation and export features are for
              demonstration and analysis purposes.
            </p>
          </div>
        </div>
      </div>
    </>
  );
};

export default DataManagementPage;