import React, { useEffect, useState } from 'react';
import Navbar from '../../components/Navbar';
import { useAuth } from '../../context/AuthContext';
import { systemParametersService, SystemParameters } from '../../services/systemParametersService';
import './SystemParametersPage.css';

const SystemParametersPage: React.FC = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [params, setParams] = useState<SystemParameters | null>(null);

  const [wallUValue, setWallUValue] = useState('');
  const [windowUValue, setWindowUValue] = useState('');
  const [ceilingUValue, setCeilingUValue] = useState('');
  const [floorUValue, setFloorUValue] = useState('');
  const [outdoorDesignTemp, setOutdoorDesignTemp] = useState('');
  const [groundTemp, setGroundTemp] = useState('');
  const [gasPricePerKwh, setGasPricePerKwh] = useState('');

  const [windowToWallRatio, setWindowToWallRatio] = useState('');
  const [safetyFactor, setSafetyFactor] = useState('');
  const [defaultBoilerEfficiency, setDefaultBoilerEfficiency] = useState('');

  useEffect(() => {
    loadParameters();
  }, []);

  const loadParameters = async () => {
    setLoading(true);
    try {
      const data = await systemParametersService.getParameters();
      setParams(data);

      setWallUValue(data.wallUValue.toString());
      setWindowUValue(data.windowUValue.toString());
      setCeilingUValue(data.ceilingUValue.toString());
      setFloorUValue(data.floorUValue.toString());
      setOutdoorDesignTemp(data.outdoorDesignTemp.toString());
      setGroundTemp(data.groundTemp.toString());
      setGasPricePerKwh(data.gasPricePerKwh.toString());

      setWindowToWallRatio(data.windowToWallRatio.toString());
      setSafetyFactor(data.safetyFactor.toString());
      setDefaultBoilerEfficiency(data.defaultBoilerEfficiency.toString());

      setError('');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load parameters');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setSaving(true);

    try {
      const updated = await systemParametersService.updateParameters({
        wallUValue: parseFloat(wallUValue),
        windowUValue: parseFloat(windowUValue),
        ceilingUValue: parseFloat(ceilingUValue),
        floorUValue: parseFloat(floorUValue),
        outdoorDesignTemp: parseFloat(outdoorDesignTemp),
        groundTemp: parseFloat(groundTemp),
        gasPricePerKwh: parseFloat(gasPricePerKwh),
        windowToWallRatio: parseFloat(windowToWallRatio),
        safetyFactor: parseFloat(safetyFactor),
        defaultBoilerEfficiency: parseFloat(defaultBoilerEfficiency),
      });

      setParams(updated);
      setSuccess('✅ Parameters successfully updated!');

      setTimeout(() => setSuccess(''), 5000);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to update parameters');
    } finally {
      setSaving(false);
    }
  };

  const handleReset = () => {
    if (params) {
      setWallUValue(params.wallUValue.toString());
      setWindowUValue(params.windowUValue.toString());
      setCeilingUValue(params.ceilingUValue.toString());
      setFloorUValue(params.floorUValue.toString());
      setOutdoorDesignTemp(params.outdoorDesignTemp.toString());
      setGroundTemp(params.groundTemp.toString());
      setGasPricePerKwh(params.gasPricePerKwh.toString());
      setWindowToWallRatio(params.windowToWallRatio.toString());
      setSafetyFactor(params.safetyFactor.toString());
      setDefaultBoilerEfficiency(params.defaultBoilerEfficiency.toString());
      setError('');
      setSuccess('');
    }
  };

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="system-params-container">
          <div className="loading">⏳ Loading...</div>
        </div>
      </>
    );
  }

  if (!params) {
    return (
      <>
        <Navbar />
        <div className="system-params-container">
          <div className="error">❌ Parameters not found</div>
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className="system-params-container">
        <div className="system-params-card">
          <div className="page-header">
            <h1>⚙️ System Parameters</h1>
            <div className="metadata-inline">
              <span>Last updated: {new Date(params.lastUpdated).toLocaleString('sr-RS')}</span>
              <span>•</span>
              <span>User: {params.updatedBy}</span>
            </div>
          </div>

          {error && <div className="alert alert-error">❌ {error}</div>}
          {success && <div className="alert alert-success">{success}</div>}

          <form onSubmit={handleSubmit} className="params-form">

            <div className="params-grid">

              <div className="param-item" data-tooltip="Heat transfer coefficient through wall. Lower value = better insulation.">
                <label>
                  <span className="param-icon">🏗️</span>
                  <span className="param-name">Wall</span>
                  <span className="info-icon">ℹ️</span>
                </label>
                <div className="input-wrapper">
                  <input
                    type="number"
                    value={wallUValue}
                    onChange={(e) => setWallUValue(e.target.value)}
                    step="0.01"
                    min="0.1"
                    max="3.0"
                    required
                    className="param-input"
                  />
                  <span className="param-unit">W/m²K</span>
                </div>
                <span className="param-hint">0.3 - 1.5</span>
              </div>

              <div className="param-item" data-tooltip="Heat transfer coefficient through window. Lower value = better window.">
                <label>
                  <span className="param-icon">🪟</span>
                  <span className="param-name">Window</span>
                  <span className="info-icon">ℹ️</span>
                </label>
                <div className="input-wrapper">
                  <input
                    type="number"
                    value={windowUValue}
                    onChange={(e) => setWindowUValue(e.target.value)}
                    step="0.01"
                    min="0.5"
                    max="10.0"
                    required
                    className="param-input"
                  />
                  <span className="param-unit">W/m²K</span>
                </div>
                <span className="param-hint">1.1 - 5.8</span>
              </div>

              <div className="param-item" data-tooltip="Heat transfer coefficient through ceiling/roof. Used for calculating upward heat losses.">
                <label>
                  <span className="param-icon">🏠</span>
                  <span className="param-name">Ceiling</span>
                  <span className="info-icon">ℹ️</span>
                </label>
                <div className="input-wrapper">
                  <input
                    type="number"
                    value={ceilingUValue}
                    onChange={(e) => setCeilingUValue(e.target.value)}
                    step="0.01"
                    min="0.1"
                    max="3.0"
                    required
                    className="param-input"
                  />
                  <span className="param-unit">W/m²K</span>
                </div>
                <span className="param-hint">0.15 - 2.0</span>
              </div>

              <div className="param-item" data-tooltip="Heat transfer coefficient through floor. Used for calculating heat losses to ground.">
                <label>
                  <span className="param-icon">📐</span>
                  <span className="param-name">Floor</span>
                  <span className="info-icon">ℹ️</span>
                </label>
                <div className="input-wrapper">
                  <input
                    type="number"
                    value={floorUValue}
                    onChange={(e) => setFloorUValue(e.target.value)}
                    step="0.01"
                    min="0.1"
                    max="3.0"
                    required
                    className="param-input"
                  />
                  <span className="param-unit">W/m²K</span>
                </div>
                <span className="param-hint">0.3 - 1.5</span>
              </div>

            </div>

            <div className="params-grid params-grid-3">

              <div className="param-item" data-tooltip="Coldest expected outdoor temperature in winter. Used for heating system sizing.">
                <label>
                  <span className="param-icon">❄️</span>
                  <span className="param-name">Outdoor temp.</span>
                  <span className="info-icon">ℹ️</span>
                </label>
                <div className="input-wrapper">
                  <input
                    type="number"
                    value={outdoorDesignTemp}
                    onChange={(e) => setOutdoorDesignTemp(e.target.value)}
                    step="0.1"
                    min="-30"
                    max="5"
                    required
                    className="param-input"
                  />
                  <span className="param-unit">°C</span>
                </div>
                <span className="param-hint">-30 to 5</span>
              </div>

              <div className="param-item" data-tooltip="Average ground temperature. Used for calculating heat losses through floor.">
                <label>
                  <span className="param-icon">🌍</span>
                  <span className="param-name">Ground temp.</span>
                  <span className="info-icon">ℹ️</span>
                </label>
                <div className="input-wrapper">
                  <input
                    type="number"
                    value={groundTemp}
                    onChange={(e) => setGroundTemp(e.target.value)}
                    step="0.1"
                    min="0"
                    max="20"
                    required
                    className="param-input"
                  />
                  <span className="param-unit">°C</span>
                </div>
                <span className="param-hint">0 - 20</span>
              </div>

              <div className="param-item" data-tooltip="Natural gas price per kilowatt-hour. Used for heating cost estimation.">
                <label>
                  <span className="param-icon">💰</span>
                  <span className="param-name">Gas price</span>
                  <span className="info-icon">ℹ️</span>
                </label>
                <div className="input-wrapper">
                  <input
                    type="number"
                    value={gasPricePerKwh}
                    onChange={(e) => setGasPricePerKwh(e.target.value)}
                    step="0.001"
                    min="0.001"
                    max="1.0"
                    required
                    className="param-input"
                  />
                  <span className="param-unit-small">EUR/kWh</span>
                </div>
                <span className="param-hint">0.001 - 1.0</span>
              </div>
                         </div>

            <div className="params-grid params-grid-3">

              <div className="param-item" data-tooltip="Window area ratio relative to wall. Typically 15%. Old buildings: 10-12%, Modern: 15-20%, Offices: 30-40%.">
                <label>
                  <span className="param-icon">🪟</span>
                  <span className="param-name">Window ratio</span>
                  <span className="info-icon">ℹ️</span>
                </label>
                <div className="input-wrapper">
                  <input
                    type="number"
                    value={windowToWallRatio}
                    onChange={(e) => setWindowToWallRatio(e.target.value)}
                    step="0.01"
                    min="0.10"
                    max="0.40"
                    required
                    className="param-input"
                  />
                  <span className="param-unit">ratio</span>
                </div>
                <span className="param-hint">0.10 - 0.40</span>
              </div>

              <div className="param-item" data-tooltip="Safety factor for heating system design. Adds reserve for extreme conditions. Typically 1.15 (15% reserve).">
                <label>
                  <span className="param-icon">🛡️</span>
                  <span className="param-name">Safety factor</span>
                  <span className="info-icon">ℹ️</span>
                </label>
                <div className="input-wrapper">
                  <input
                    type="number"
                    value={safetyFactor}
                    onChange={(e) => setSafetyFactor(e.target.value)}
                    step="0.01"
                    min="1.00"
                    max="1.30"
                    required
                    className="param-input"
                  />
                  <span className="param-unit">×</span>
                </div>
                <span className="param-hint">1.00 - 1.30</span>
              </div>

              <div className="param-item" data-tooltip="Default boiler efficiency for cost calculations. Old: 70-85%, Modern: 90-95%, High efficiency: 95-98%.">
                <label>
                  <span className="param-icon">⚙️</span>
                  <span className="param-name">Boiler efficiency</span>
                  <span className="info-icon">ℹ️</span>
                </label>
                <div className="input-wrapper">
                  <input
                    type="number"
                    value={defaultBoilerEfficiency}
                    onChange={(e) => setDefaultBoilerEfficiency(e.target.value)}
                    step="0.01"
                    min="0.70"
                    max="0.98"
                    required
                    className="param-input"
                  />
                  <span className="param-unit">ratio</span>
                </div>
                <span className="param-hint">0.70 - 0.98</span>
              </div>

            </div>

            <div className="form-actions">
              <button
                type="button"
                onClick={handleReset}
                className="btn btn-secondary"
                disabled={saving}
              >
                🔄 Reset
              </button>
              <button
                type="submit"
                className="btn btn-primary"
                disabled={saving}
              >
                {saving ? '⏳ Saving...' : '💾 Save'}
              </button>
            </div>
          </form>

        </div>
      </div>
    </>
  );
};

export default SystemParametersPage;
