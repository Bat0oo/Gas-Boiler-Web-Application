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
  
  // Form state
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
      
      // Populate form
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
      setSuccess('✅ Parametri uspešno ažurirani!');
      
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
          <div className="loading">⏳ Učitavanje...</div>
        </div>
      </>
    );
  }

  if (!params) {
    return (
      <>
        <Navbar />
        <div className="system-params-container">
          <div className="error">❌ Parametri nisu pronađeni</div>
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className="system-params-container">
        <div className="system-params-card">
          {/* Compact Header */}
          <div className="page-header">
            <h1>⚙️ Sistemski Parametri</h1>
            <div className="metadata-inline">
              <span>Poslednja izmena: {new Date(params.lastUpdated).toLocaleString('sr-RS')}</span>
              <span>•</span>
              <span>Korisnik: {params.updatedBy}</span>
            </div>
          </div>

          {/* Alerts */}
          {error && <div className="alert alert-error">❌ {error}</div>}
          {success && <div className="alert alert-success">{success}</div>}

          {/* Compact Form */}
          <form onSubmit={handleSubmit} className="params-form">
            
            {/* ROW 1: U-VALUES (4 columns) */}
            <div className="params-grid">
              
              {/* Wall U-Value */}
              <div className="param-item" data-tooltip="Koeficijent prolaza toplote kroz zid. Niža vrednost = bolja izolacija.">
                <label>
                  <span className="param-icon">🏗️</span>
                  <span className="param-name">Zid</span>
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

              {/* Window U-Value */}
              <div className="param-item" data-tooltip="Koeficijent prolaza toplote kroz prozor. Niža vrednost = bolji prozor.">
                <label>
                  <span className="param-icon">🪟</span>
                  <span className="param-name">Prozor</span>
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

              {/* Ceiling U-Value */}
              <div className="param-item" data-tooltip="Koeficijent prolaza toplote kroz plafon/krov. Koristi se za proračun gubitaka ka gore.">
                <label>
                  <span className="param-icon">🏠</span>
                  <span className="param-name">Plafon</span>
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

              {/* Floor U-Value */}
              <div className="param-item" data-tooltip="Koeficijent prolaza toplote kroz pod. Koristi se za proračun gubitaka prema tlu.">
                <label>
                  <span className="param-icon">📐</span>
                  <span className="param-name">Pod</span>
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

            {/* ROW 2: TEMPERATURES + GAS PRICE (3 columns) */}
            <div className="params-grid params-grid-3">
              
              {/* Outdoor Design Temperature */}
              <div className="param-item" data-tooltip="Najhladnija očekivana spoljna temperatura zimi. Koristi se za dimenzionisanje sistema grejanja.">
                <label>
                  <span className="param-icon">❄️</span>
                  <span className="param-name">Spoljna temp.</span>
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
                <span className="param-hint">-30 do 5</span>
              </div>

              {/* Ground Temperature */}
              <div className="param-item" data-tooltip="Prosečna temperatura tla. Koristi se za proračun toplotnih gubitaka kroz pod.">
                <label>
                  <span className="param-icon">🌍</span>
                  <span className="param-name">Temp. tla</span>
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

              {/* Gas Price */}
              <div className="param-item" data-tooltip="Cena prirodnog gasa po kilovat-času. Koristi se za procenu troškova grejanja.">
                <label>
                  <span className="param-icon">💰</span>
                  <span className="param-name">Cena gasa</span>
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

            {/* ROW 3: NEW BUILDING & CALCULATION PARAMETERS (3 columns) */}
            <div className="params-grid params-grid-3">
              
              {/* Window to Wall Ratio */}
              <div className="param-item" data-tooltip="Udeo površine prozora u odnosu na zid. Tipično 15%. Stare zgrade: 10-12%, Moderne: 15-20%, Kancelarije: 30-40%.">
                <label>
                  <span className="param-icon">🪟</span>
                  <span className="param-name">Udeo prozora</span>
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

              {/* Safety Factor */}
              <div className="param-item" data-tooltip="Faktor sigurnosti za projektovanje sistema grejanja. Dodaje rezervu za ekstremne uslove. Tipično 1.15 (15% rezerve).">
                <label>
                  <span className="param-icon">🛡️</span>
                  <span className="param-name">Faktor sigurnosti</span>
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

              {/* Default Boiler Efficiency */}
              <div className="param-item" data-tooltip="Podrazumevana efikasnost kotla za proračun troškova. Stari: 70-85%, Moderni: 90-95%, Visoka efikasnost: 95-98%.">
                <label>
                  <span className="param-icon">⚙️</span>
                  <span className="param-name">Efikasnost kotla</span>
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

            {/* Action Buttons */}
            <div className="form-actions">
              <button
                type="button"
                onClick={handleReset}
                className="btn btn-secondary"
                disabled={saving}
              >
                🔄 Resetuj
              </button>
              <button
                type="submit"
                className="btn btn-primary"
                disabled={saving}
              >
                {saving ? '⏳ Čuvanje...' : '💾 Sačuvaj'}
              </button>
            </div>
          </form>

        </div>
      </div>
    </>
  );
};

export default SystemParametersPage;