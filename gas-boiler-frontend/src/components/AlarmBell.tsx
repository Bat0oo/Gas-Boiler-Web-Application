import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { alarmService } from '../services/alarmService';
import { Alarm } from '../types/alarmtypes';
import { useSignalR, useSignalREvent } from '../../hooks/useSignalR';
import './AlarmBell.css';

interface Props {
  token: string;
}

interface NewAlarmEvent {
  alarmId: number;
  type: string;
  severity: string;
  message: string;
  buildingId: number;
  buildingName: string;
  timestamp: string;
}

const AlarmBell: React.FC<Props> = ({ token }) => {
  const [activeAlarms, setActiveAlarms] = useState<Alarm[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [loading, setLoading] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  const { connection, isConnected, error } = useSignalR(
    'http://localhost:5071/boilerHub',
    token
  );

  const handleNewAlarm = useCallback((data: NewAlarmEvent) => {
    console.log('🚨 NEW ALARM RECEIVED (Real-time!):', data);
    loadActiveAlarms();
    playNotificationSound();
    showBrowserNotification(data);
  }, []);

  useSignalREvent<NewAlarmEvent>(connection, 'NewAlarm', handleNewAlarm);

  const loadActiveAlarms = async () => {
    try {
      const alarms = await alarmService.getActive(token);
      setActiveAlarms(alarms);
    } catch (err) {
      console.error('Error loading active alarms:', err);
    }
  };

  useEffect(() => {
    loadActiveAlarms();
  }, [token]);

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

  const playNotificationSound = () => {
    try {
      const audio = new Audio('/notification.mp3');
      audio.volume = 0.5;
      audio.play().catch(err => console.log('Could not play sound:', err));
    } catch (err) {
      console.log('Audio not available');
    }
  };

  const showBrowserNotification = (data: NewAlarmEvent) => {
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification('🚨 New Alarm!', {
        body: data.message,
        icon: '/favicon.ico',
        tag: `alarm-${data.alarmId}`,
      });
    }
  };

  useEffect(() => {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }, []);

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
        className={`alarm-bell-button ${!isConnected ? 'disconnected' : ''}`}
        onClick={() => setShowDropdown(!showDropdown)}
        title={isConnected ? 'Alarms (Real-time connected)' : 'Alarms (Connecting...)'}
      >
        🔔
        {unacknowledgedCount > 0 && (
          <span className="alarm-badge">{unacknowledgedCount}</span>
        )}
        <span className={`connection-dot ${isConnected ? 'connected' : 'disconnected'}`}></span>
      </button>

      {showDropdown && (
        <div className="alarm-dropdown">
          <div className="alarm-dropdown-header">
            <h3>Active Alarms</h3>
            <div className="header-right">
              {isConnected && <span className="realtime-badge">⚡ Live</span>}
              {!isConnected && error && <span className="error-badge">⚠️ Offline</span>}
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