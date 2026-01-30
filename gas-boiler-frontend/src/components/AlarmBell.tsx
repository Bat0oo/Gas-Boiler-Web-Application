import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { alarmService } from '../services/alarmService';
import { Alarm } from '../types/alarmtypes';
import './AlarmBell.css';

interface Props {
  token: string;
}

const AlarmBell: React.FC<Props> = ({ token }) => {
  const [activeAlarms, setActiveAlarms] = useState<Alarm[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [loading, setLoading] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  // Load active alarms
  const loadActiveAlarms = async () => {
    try {
      const alarms = await alarmService.getActive(token);
      setActiveAlarms(alarms);
    } catch (err) {
      console.error('Error loading active alarms:', err);
    }
  };

  // Poll for active alarms every 30 seconds
  useEffect(() => {
    loadActiveAlarms();
    const interval = setInterval(loadActiveAlarms, 30000);
    return () => clearInterval(interval);
  }, [token]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    };

    if (showDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showDropdown]);

  const handleAcknowledge = async (alarmId: number, e: React.MouseEvent) => {
    e.stopPropagation();
    setLoading(true);
    try {
      await alarmService.acknowledge(alarmId, token);
      await loadActiveAlarms();
    } catch (err) {
      console.error('Error acknowledging alarm:', err);
      alert('Error acknowledging alarm');
    } finally {
      setLoading(false);
    }
  };

  const unacknowledgedCount = activeAlarms.filter(a => !a.isAcknowledged).length;

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'CRITICAL': return '🔴';
      case 'WARNING': return '⚠️';
      case 'INFO': return 'ℹ️';
      default: return '🔔';
    }
  };

  const getAlarmTypeLabel = (type: string) => {
    switch (type) {
      case 'INSUFFICIENT_CAPACITY': return 'Capacity Issue';
      case 'HIGH_INDOOR_TEMP': return 'High Indoor Temp';
      case 'LOW_INDOOR_TEMP': return 'Low Indoor Temp';
      case 'HIGH_OUTDOOR_TEMP': return 'High Outdoor Temp';
      case 'LOW_OUTDOOR_TEMP': return 'Low Outdoor Temp';
      case 'HIGH_DAILY_COST': return 'High Cost';
      default: return type;
    }
  };

  return (
    <div className="alarm-bell-container" ref={dropdownRef}>
      <button
        className="alarm-bell-button"
        onClick={() => setShowDropdown(!showDropdown)}
        title="Alarms"
      >
        🔔
        {unacknowledgedCount > 0 && (
          <span className="alarm-badge">{unacknowledgedCount}</span>
        )}
      </button>

      {showDropdown && (
        <div className="alarm-dropdown">
          <div className="alarm-dropdown-header">
            <h3>Active Alarms</h3>
            <button
              onClick={() => {
                navigate('/alarms');
                setShowDropdown(false);
              }}
              className="view-all-btn"
            >
              View All
            </button>
          </div>

          <div className="alarm-dropdown-list">
            {activeAlarms.length === 0 ? (
              <div className="no-alarms">
                ✅ No active alarms
              </div>
            ) : (
              activeAlarms.slice(0, 5).map((alarm) => (
                <div
                  key={alarm.id}
                  className={`alarm-item ${alarm.isAcknowledged ? 'acknowledged' : ''}`}
                >
                  <div className="alarm-item-header">
                    <span className="alarm-severity">
                      {getSeverityIcon(alarm.severity)}
                    </span>
                    <span className="alarm-type">{getAlarmTypeLabel(alarm.type)}</span>
                  </div>
                  <div className="alarm-message">{alarm.message}</div>
                  <div className="alarm-building">📍 {alarm.buildingName}</div>
                  <div className="alarm-time">
                    {new Date(alarm.createdAt).toLocaleString()}
                  </div>
                  {!alarm.isAcknowledged && (
                    <button
                      onClick={(e) => handleAcknowledge(alarm.id, e)}
                      disabled={loading}
                      className="acknowledge-btn"
                    >
                      ✓ Acknowledge
                    </button>
                  )}
                </div>
              ))
            )}
          </div>

          {activeAlarms.length > 5 && (
            <div className="alarm-dropdown-footer">
              +{activeAlarms.length - 5} more alarms
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AlarmBell;
