import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { historicalDataService } from '../services/historicalDataService';
import { BuildingReading } from '../types/historicaldatatypes';
import PowerChart from './charts/PowerChart';
import { processPowerData, getDateRangeFromPreset } from '../utils/chartUtils';
import './PowerRequirementsWidget.css';

const PowerRequirementsWidget: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [powerData, setPowerData] = useState<any[]>([]);
  const [hasInsufficientCapacity, setHasInsufficientCapacity] = useState(false);

  useEffect(() => {
    loadPowerData();
  }, []);

  const loadPowerData = async () => {
    if (!user?.token) return;

    try {
      setLoading(true);

      // Get last 7 days
      const { startDate, endDate } = getDateRangeFromPreset('last7days');
      
      // Get all historical data
      const readings: BuildingReading[] = await historicalDataService.getAllHistory(
        user.token,
        startDate.toISOString(),
        endDate.toISOString()
      );

      // Process for power chart
      const processed = processPowerData(readings);
      setPowerData(processed);

      // Check if any reading has insufficient capacity
      const hasIssue = processed.some((d) => !d.hasCapacity);
      setHasInsufficientCapacity(hasIssue);
    } catch (err) {
      console.error('Error loading power data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetails = () => {
    navigate('/charts');
  };

  if (loading) {
    return (
      <div className="power-widget">
        <div className="widget-header">
          <h3>⚡ Power Requirements</h3>
        </div>
        <div className="widget-loading">
          <div className="loading-spinner-small"></div>
          <p>Loading chart...</p>
        </div>
      </div>
    );
  }

  if (powerData.length === 0) {
    return (
      <div className="power-widget">
        <div className="widget-header">
          <h3>⚡ Power Requirements</h3>
        </div>
        <div className="widget-empty">
          <p>No historical data available yet.</p>
          <p className="widget-hint">Data will appear once the background service records readings.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="power-widget">
      <div className="widget-header">
        <div className="widget-title">
          <h3>⚡ Power Requirements (Last 7 Days)</h3>
          {hasInsufficientCapacity && (
            <span className="status-badge warning">⚠️ Capacity Issues Detected</span>
          )}
          {!hasInsufficientCapacity && (
            <span className="status-badge success">✅ All Systems OK</span>
          )}
        </div>
        <button onClick={handleViewDetails} className="btn-view-analytics">
          View Detailed Analytics →
        </button>
      </div>

      <div className="widget-chart">
        <PowerChart data={powerData} height={300} showLegend={true} />
      </div>

      <div className="widget-footer">
        <div className="widget-legend">
          <div className="legend-item">
            <span className="legend-color green"></span>
            <span>Available Power</span>
          </div>
          <div className="legend-item">
            <span className="legend-color blue"></span>
            <span>Required Power (Sufficient)</span>
          </div>
          <div className="legend-item">
            <span className="legend-color red"></span>
            <span>Required Power (Insufficient)</span>
          </div>
        </div>
        <p className="widget-info">
          💡 This chart shows the power required for heating vs. your total boiler capacity. 
          Red bars indicate when capacity is insufficient.
        </p>
      </div>
    </div>
  );
};

export default PowerRequirementsWidget;