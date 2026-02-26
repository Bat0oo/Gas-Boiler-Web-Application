import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { alarmService } from '../../services/alarmService';
import { Alarm, AlarmFilters, AlarmStats } from '../../types/alarmtypes';
import Navbar from '../../components/Navbar';
import './AlarmsPage.css';

const AlarmsPage: React.FC = () => {
  const { user } = useAuth();
  const isAdmin = user?.role === 'Admin';

  const [alarms, setAlarms] = useState<Alarm[]>([]);
  const [stats, setStats] = useState<AlarmStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [filters, setFilters] = useState<AlarmFilters>({
    isActive: true,
  });

  useEffect(() => {
    loadData();
  }, [filters]);

  const loadData = async () => {
    if (!user?.token) return;

    setLoading(true);
    try {
      const [alarmsData, statsData] = await Promise.all([
        alarmService.getAll(user.token, filters),
        alarmService.getStats(user.token),
      ]);
      setAlarms(alarmsData);
      setStats(statsData);
      setError('');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load alarms');
    } finally {
      setLoading(false);
    }
  };

  const handleAcknowledge = async (id: number) => {
    if (!user?.token) return;

    try {
      await alarmService.acknowledge(id, user.token);
      await loadData();
    } catch (err: any) {
      alert(`Error: ${err.response?.data?.message || 'Failed to acknowledge alarm'}`);
    }
  };

  const handleResolve = async (id: number) => {
    if (!user?.token || !isAdmin) return;

    if (!window.confirm('Mark this alarm as resolved?')) return;

    try {
      await alarmService.resolve(id, user.token);
      await loadData();
    } catch (err: any) {
      alert(`Error: ${err.response?.data?.message || 'Failed to resolve alarm'}`);
    }
  };

  const handleDelete = async (id: number) => {
    if (!user?.token || !isAdmin) return;

    if (!window.confirm('Permanently delete this alarm?')) return;

    try {
      await alarmService.deleteAlarm(id, user.token);
      await loadData();
    } catch (err: any) {
      alert(`Error: ${err.response?.data?.message || 'Failed to delete alarm'}`);
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'CRITICAL': return '#dc2626';
      case 'WARNING': return '#f59e0b';
      case 'INFO': return '#3b82f6';
      default: return '#6b7280';
    }
  };

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

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="loading">Loading...</div>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className="alarms-page">
        <div className="page-header">
          <h1>🚨 Alarms & Notifications</h1>
          <p>Monitor and manage system alerts</p>
        </div>

        {stats && (
          <div className="stats-grid">
            <div className="stat-card total">
              <div className="stat-value">{stats.totalAlarms}</div>
              <div className="stat-label">Total Alarms</div>
            </div>
            <div className="stat-card active">
              <div className="stat-value">{stats.activeAlarms}</div>
              <div className="stat-label">Active</div>
            </div>
            <div className="stat-card acknowledged">
              <div className="stat-value">{stats.acknowledgedAlarms}</div>
              <div className="stat-label">Acknowledged</div>
            </div>
            <div className="stat-card resolved">
              <div className="stat-value">{stats.resolvedAlarms}</div>
              <div className="stat-label">Resolved</div>
            </div>
          </div>
        )}

        <div className="filters-section">
          <h3>Filters:</h3>
          <div className="filters-grid">
            <label>
              <input
                type="checkbox"
                checked={filters.isActive ?? false}
                onChange={(e) =>
                  setFilters({ ...filters, isActive: e.target.checked ? true : undefined })
                }
              />
              Active only
            </label>
            <label>
              <input
                type="checkbox"
                checked={filters.isAcknowledged === false}
                onChange={(e) =>
                  setFilters({ ...filters, isAcknowledged: e.target.checked ? false : undefined })
                }
              />
              Unacknowledged only
            </label>
            {isAdmin && (
              <button
                className="btn-settings"
                onClick={() => (window.location.href = '/alarm-settings')}
              >
                ⚙️ Settings
              </button>
            )}
          </div>
        </div>

        {error && <div className="error-message">{error}</div>}

        <div className="alarms-list">
          {alarms.length === 0 ? (
            <div className="no-data">
              ✅ No alarms match the selected filters
            </div>
          ) : (
            alarms.map((alarm) => (
              <div
                key={alarm.id}
                className={`alarm-card ${alarm.isAcknowledged ? 'acknowledged' : ''} ${
                  !alarm.isActive ? 'resolved' : ''
                }`}
              >
                <div className="alarm-card-header">
                  <div className="alarm-severity-badge" style={{ background: getSeverityColor(alarm.severity) }}>
                    {getSeverityIcon(alarm.severity)} {alarm.severity}
                  </div>
                  <div className="alarm-type-badge">{getAlarmTypeLabel(alarm.type)}</div>
                </div>

                <div className="alarm-card-body">
                  <div className="alarm-message">{alarm.message}</div>
                  <div className="alarm-meta">
                    <span>📍 {alarm.buildingName}</span>
                    <span>🕒 {new Date(alarm.createdAt).toLocaleString()}</span>
                  </div>
                  {alarm.isAcknowledged && (
                    <div className="alarm-status">
                      ✓ Acknowledged at {new Date(alarm.acknowledgedAt!).toLocaleString()}
                    </div>
                  )}
                  {!alarm.isActive && (
                    <div className="alarm-status resolved">
                      ✓ Resolved at {new Date(alarm.resolvedAt!).toLocaleString()}
                    </div>
                  )}
                </div>

                <div className="alarm-card-actions">
                  {!alarm.isAcknowledged && alarm.isActive && (
                    <button onClick={() => handleAcknowledge(alarm.id)} className="btn-acknowledge">
                      ✓ Acknowledge
                    </button>
                  )}
                  {isAdmin && alarm.isActive && (
                    <button onClick={() => handleResolve(alarm.id)} className="btn-resolve">
                      ✓ Resolve
                    </button>
                  )}
                  {isAdmin && (
                    <button onClick={() => handleDelete(alarm.id)} className="btn-delete">
                      🗑️ Delete
                    </button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </>
  );
};

export default AlarmsPage;
