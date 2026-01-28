import React, { useEffect, useState } from 'react';
import Navbar from '../components/Navbar';
import { useAuth } from '../context/AuthContext';
import { historicalDataService } from '../services/historicalDataService';
import { buildingService } from '../services/buildingService';
import { BuildingReading } from '../types/historicaldatatypes';
import { Building } from '../types/buildingtypes';
import { DateRangeOption } from '../types/chartstypes';
import TemperatureChart from '../components/charts/TemperatureChart';
import HeatLossChart from '../components/charts/HeatLossChart';
import CostChart from '../components/charts/CostChart';
import PowerChart from '../components/charts/PowerChart';
import {
  processTemperatureData,
  processHeatLossData,
  processCostData,
  processPowerData,
  getDateRangeFromPreset,
  filterReadingsByDateRange,
} from '../utils/chartUtils';
import './ChartsPage.css';

const ChartsPage: React.FC = () => {
  const { user } = useAuth();
  const [buildings, setBuildings] = useState<Building[]>([]);
  const [selectedBuildingId, setSelectedBuildingId] = useState<number | null>(null);
  const [dateRange, setDateRange] = useState<DateRangeOption>('last7days');
  const [customStartDate, setCustomStartDate] = useState('');
  const [customEndDate, setCustomEndDate] = useState('');

  const [readings, setReadings] = useState<BuildingReading[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadBuildings();
  }, []);

  useEffect(() => {
    if (selectedBuildingId) {
      loadChartData();
    }
  }, [selectedBuildingId, dateRange, customStartDate, customEndDate]);

  const loadBuildings = async () => {
    if (!user?.token) return;

    try {
      const buildingsData = await buildingService.getAllBuildings(user.token);
      setBuildings(buildingsData);

      // Auto-select first building
      if (buildingsData.length > 0 && !selectedBuildingId) {
        setSelectedBuildingId(buildingsData[0].id);
      }
    } catch (err) {
      console.error('Error loading buildings:', err);
      setError('Failed to load buildings');
    }
  };

  const loadChartData = async () => {
    if (!user?.token || !selectedBuildingId) return;

    try {
      setLoading(true);
      setError('');

      // Determine date range
      let startDate: Date;
      let endDate: Date;

      if (dateRange === 'custom') {
        if (!customStartDate || !customEndDate) {
          setError('Please select both start and end dates');
          setLoading(false);
          return;
        }
        startDate = new Date(customStartDate);
        endDate = new Date(customEndDate);
      } else {
        const range = getDateRangeFromPreset(dateRange);
        startDate = range.startDate;
        endDate = range.endDate;
      }

      // Fetch readings
      const data = await historicalDataService.getBuildingHistory(
        selectedBuildingId,
        user.token,
        startDate.toISOString(),
        endDate.toISOString()
      );

      setReadings(data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load chart data');
    } finally {
      setLoading(false);
    }
  };

  const selectedBuilding = buildings.find((b) => b.id === selectedBuildingId);

  // Process data for charts
  const temperatureData = processTemperatureData(readings);
  const heatLossData = processHeatLossData(readings);
  const costData = processCostData(readings);
  const powerData = processPowerData(readings);

  return (
    <>
      <Navbar />
      <div className="charts-container">
        <div className="charts-header">
          <h1>📊 Charts & Analytics</h1>
          <p className="charts-subtitle">
            Analyze your building's performance and heating costs over time
          </p>
        </div>

        {/* Filters */}
        <div className="charts-filters">
          <div className="filter-group">
            <label htmlFor="building-select">Building:</label>
            <select
              id="building-select"
              value={selectedBuildingId || ''}
              onChange={(e) => setSelectedBuildingId(Number(e.target.value))}
              className="filter-select"
            >
              {buildings.map((building) => (
                <option key={building.id} value={building.id}>
                  {building.name}
                </option>
              ))}
            </select>
          </div>

          <div className="filter-group">
            <label htmlFor="date-range-select">Date Range:</label>
            <select
              id="date-range-select"
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value as DateRangeOption)}
              className="filter-select"
            >
              <option value="last7days">Last 7 Days</option>
              <option value="last30days">Last 30 Days</option>
              <option value="custom">Custom Range</option>
            </select>
          </div>

          {dateRange === 'custom' && (
            <>
              <div className="filter-group">
                <label htmlFor="start-date">From:</label>
                <input
                  id="start-date"
                  type="date"
                  value={customStartDate}
                  onChange={(e) => setCustomStartDate(e.target.value)}
                  className="filter-date"
                />
              </div>

              <div className="filter-group">
                <label htmlFor="end-date">To:</label>
                <input
                  id="end-date"
                  type="date"
                  value={customEndDate}
                  onChange={(e) => setCustomEndDate(e.target.value)}
                  className="filter-date"
                />
              </div>
            </>
          )}
        </div>

        {error && <div className="error-message">{error}</div>}

        {loading ? (
          <div className="charts-loading">
            <div className="loading-spinner"></div>
            <p>Loading charts...</p>
          </div>
        ) : readings.length === 0 ? (
          <div className="charts-empty">
            <h3>No Data Available</h3>
            <p>There are no historical readings for this building in the selected date range.</p>
            <p className="hint">Try selecting a different date range or wait for the background service to record data.</p>
          </div>
        ) : (
          <>
            {/* Building Info */}
            {selectedBuilding && (
              <div className="building-info-card">
                <div className="info-item">
                  <span className="info-label">Building:</span>
                  <span className="info-value">{selectedBuilding.name}</span>
                </div>
                <div className="info-item">
                  <span className="info-label">Data Points:</span>
                  <span className="info-value">{readings.length}</span>
                </div>
                <div className="info-item">
                  <span className="info-label">Heating Area:</span>
                  <span className="info-value">{selectedBuilding.heatingArea} m²</span>
                </div>
                <div className="info-item">
                  <span className="info-label">Desired Temp:</span>
                  <span className="info-value">{selectedBuilding.desiredTemperature}°C</span>
                </div>
              </div>
            )}

            {/* Charts Grid */}
            <div className="charts-grid">
              {/* Power Requirements Chart */}
              <div className="chart-card highlight">
                <div className="chart-header">
                  <h3>⚡ Power Requirements</h3>
                  <span className="chart-description">
                    Required vs Available boiler capacity
                  </span>
                </div>
                <div className="chart-content">
                  <PowerChart data={powerData} height={350} />
                </div>
              </div>

              {/* Temperature Chart */}
              <div className="chart-card">
                <div className="chart-header">
                  <h3>🌡️ Temperature History</h3>
                  <span className="chart-description">Indoor vs Outdoor temperatures</span>
                </div>
                <div className="chart-content">
                  <TemperatureChart data={temperatureData} height={350} />
                </div>
              </div>

              {/* Cost Chart */}
              <div className="chart-card">
                <div className="chart-header">
                  <h3>💰 Daily Heating Costs</h3>
                  <span className="chart-description">
                    Total: €{costData.reduce((sum, d) => sum + d.cost, 0).toFixed(2)}
                  </span>
                </div>
                <div className="chart-content">
                  <CostChart data={costData} height={350} />
                </div>
              </div>

              {/* Heat Loss Chart */}
              <div className="chart-card">
                <div className="chart-header">
                  <h3>🔥 Heat Loss Over Time</h3>
                  <span className="chart-description">Thermal energy losses</span>
                </div>
                <div className="chart-content">
                  <HeatLossChart data={heatLossData} height={350} />
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </>
  );
};

export default ChartsPage;