import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { alarmService } from '../../services/alarmService';
import { AlarmSettings, UpdateAlarmSettings } from '../../types/alarmtypes';
import Navbar from '../../components/Navbar';
import './AlarmSettingsPage.css';

const AlarmSettingsPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const isAdmin = user?.role === 'Admin';

  const [settings, setSettings] = useState<AlarmSettings | null>(null);
  const [formData, setFormData] = useState<UpdateAlarmSettings>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    if (!isAdmin) {
      navigate('/alarms');
      return;
    }
    loadSettings();
  }, [isAdmin]);

  const loadSettings = async () => {
    if (!user?.token) return;

    setLoading(true);
    try {
      const data = await alarmService.getSettings(user.token);
      setSettings(data);
      setFormData({
        highIndoorTempThreshold: data.highIndoorTempThreshold,
        lowIndoorTempThreshold: data.lowIndoorTempThreshold,
        highOutdoorTempThreshold: data.highOutdoorTempThreshold,
        lowOutdoorTempThreshold: data.lowOutdoorTempThreshold,
        highDailyCostThreshold: data.highDailyCostThreshold,
        capacityDeficitThreshold: data.capacityDeficitThreshold,
        alertCooldownMinutes: data.alertCooldownMinutes,
        capacityAlertsEnabled: data.capacityAlertsEnabled,
        highIndoorTempAlertsEnabled: data.highIndoorTempAlertsEnabled,
        lowIndoorTempAlertsEnabled: data.lowIndoorTempAlertsEnabled,
        highOutdoorTempAlertsEnabled: data.highOutdoorTempAlertsEnabled,
        lowOutdoorTempAlertsEnabled: data.lowOutdoorTempAlertsEnabled,
        highCostAlertsEnabled: data.highCostAlertsEnabled,
      });
      setError('');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load settings');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.token) return;

    setSaving(true);
    setError('');
    setSuccessMessage('');

    try {
      const updated = await alarmService.updateSettings(user.token, formData);
      setSettings(updated);
      setSuccessMessage('Settings saved successfully! ✓');
      setTimeout(() => setSuccessMessage(''), 5000);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  const handleTriggerCheck = async () => {
    if (!user?.token) return;

    if (!window.confirm('Manually trigger alarm check for all buildings?')) return;

    try {
      await alarmService.triggerCheck(user.token);
      alert('Alarm check triggered successfully!');
    } catch (err: any) {
      alert(`Error: ${err.response?.data?.message || 'Failed to trigger check'}`);
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

  if (!settings) return null;

  return (
    <>
      <Navbar />
      <div className="alarm-settings-page">
        <div className="page-header">
          <h1>⚙️ Alarm Settings</h1>
          <p>Configure alarm thresholds and notification preferences</p>
        </div>

        {error && <div className="error-message">{error}</div>}
        {successMessage && <div className="success-message">{successMessage}</div>}

        <form onSubmit={handleSave} className="settings-form">
          <div className="settings-section">
            <h2>🌡️ Temperature Thresholds</h2>
            <div className="settings-grid">
              <div className="setting-item">
                <label>
                  <input
                    type="checkbox"
                    checked={formData.highIndoorTempAlertsEnabled ?? false}
                    onChange={(e) =>
                      setFormData({ ...formData, highIndoorTempAlertsEnabled: e.target.checked })
                    }
                  />
                  High Indoor Temperature Alert
                </label>
                <div className="input-group">
                  <input
                    type="number"
                    step="0.1"
                    value={formData.highIndoorTempThreshold ?? ''}
                    onChange={(e) =>
                      setFormData({ ...formData, highIndoorTempThreshold: parseFloat(e.target.value) })
                    }
                    disabled={!formData.highIndoorTempAlertsEnabled}
                  />
                  <span>°C</span>
                </div>
              </div>

              <div className="setting-item">
                <label>
                  <input
                    type="checkbox"
                    checked={formData.lowIndoorTempAlertsEnabled ?? false}
                    onChange={(e) =>
                      setFormData({ ...formData, lowIndoorTempAlertsEnabled: e.target.checked })
                    }
                  />
                  Low Indoor Temperature Alert
                </label>
                <div className="input-group">
                  <input
                    type="number"
                    step="0.1"
                    value={formData.lowIndoorTempThreshold ?? ''}
                    onChange={(e) =>
                      setFormData({ ...formData, lowIndoorTempThreshold: parseFloat(e.target.value) })
                    }
                    disabled={!formData.lowIndoorTempAlertsEnabled}
                  />
                  <span>°C</span>
                </div>
              </div>

              <div className="setting-item">
                <label>
                  <input
                    type="checkbox"
                    checked={formData.highOutdoorTempAlertsEnabled ?? false}
                    onChange={(e) =>
                      setFormData({ ...formData, highOutdoorTempAlertsEnabled: e.target.checked })
                    }
                  />
                  High Outdoor Temperature Alert
                </label>
                <div className="input-group">
                  <input
                    type="number"
                    step="0.1"
                    value={formData.highOutdoorTempThreshold ?? ''}
                    onChange={(e) =>
                      setFormData({ ...formData, highOutdoorTempThreshold: parseFloat(e.target.value) })
                    }
                    disabled={!formData.highOutdoorTempAlertsEnabled}
                  />
                  <span>°C</span>
                </div>
              </div>

              <div className="setting-item">
                <label>
                  <input
                    type="checkbox"
                    checked={formData.lowOutdoorTempAlertsEnabled ?? false}
                    onChange={(e) =>
                      setFormData({ ...formData, lowOutdoorTempAlertsEnabled: e.target.checked })
                    }
                  />
                  Low Outdoor Temperature Alert
                </label>
                <div className="input-group">
                  <input
                    type="number"
                    step="0.1"
                    value={formData.lowOutdoorTempThreshold ?? ''}
                    onChange={(e) =>
                      setFormData({ ...formData, lowOutdoorTempThreshold: parseFloat(e.target.value) })
                    }
                    disabled={!formData.lowOutdoorTempAlertsEnabled}
                  />
                  <span>°C</span>
                </div>
              </div>
            </div>
          </div>

          <div className="settings-section">
            <h2>⚡ Capacity & Cost Thresholds</h2>
            <div className="settings-grid">
              <div className="setting-item">
                <label>
                  <input
                    type="checkbox"
                    checked={formData.capacityAlertsEnabled ?? false}
                    onChange={(e) =>
                      setFormData({ ...formData, capacityAlertsEnabled: e.target.checked })
                    }
                  />
                  Insufficient Capacity Alert
                </label>
                <div className="input-group">
                  <input
                    type="number"
                    step="0.1"
                    value={formData.capacityDeficitThreshold ?? ''}
                    onChange={(e) =>
                      setFormData({ ...formData, capacityDeficitThreshold: parseFloat(e.target.value) })
                    }
                    disabled={!formData.capacityAlertsEnabled}
                  />
                  <span>kW</span>
                </div>
                <small>Alert when deficit exceeds this value</small>
              </div>

              <div className="setting-item">
                <label>
                  <input
                    type="checkbox"
                    checked={formData.highCostAlertsEnabled ?? false}
                    onChange={(e) =>
                      setFormData({ ...formData, highCostAlertsEnabled: e.target.checked })
                    }
                  />
                  High Daily Cost Alert
                </label>
                <div className="input-group">
                  <input
                    type="number"
                    step="0.1"
                    value={formData.highDailyCostThreshold ?? ''}
                    onChange={(e) =>
                      setFormData({ ...formData, highDailyCostThreshold: parseFloat(e.target.value) })
                    }
                    disabled={!formData.highCostAlertsEnabled}
                  />
                  <span>EUR</span>
                </div>
              </div>
            </div>
          </div>

          <div className="settings-section">
            <h2>⏱️ Alert Cooldown</h2>
            <div className="setting-item">
              <label>Minimum time between duplicate alerts</label>
              <div className="input-group">
                <input
                  type="number"
                  min="1"
                  max="1440"
                  value={formData.alertCooldownMinutes ?? ''}
                  onChange={(e) =>
                    setFormData({ ...formData, alertCooldownMinutes: parseInt(e.target.value) })
                  }
                />
                <span>minutes</span>
              </div>
              <small>Prevents spam by limiting alerts for the same condition</small>
            </div>
          </div>

          <div className="form-actions">
            <button type="submit" disabled={saving} className="btn-save">
              {saving ? 'Saving...' : '💾 Save Settings'}
            </button>
            <button type="button" onClick={handleTriggerCheck} className="btn-trigger">
              🔄 Trigger Manual Check
            </button>
            <button type="button" onClick={() => navigate('/alarms')} className="btn-cancel">
              ← Back to Alarms
            </button>
          </div>
        </form>

        <div className="settings-footer">
          <p><strong>Last updated:</strong> {new Date(settings.lastUpdated).toLocaleString()}</p>
          <p><strong>Updated by:</strong> {settings.updatedBy}</p>
        </div>
      </div>
    </>
  );
};

export default AlarmSettingsPage;
