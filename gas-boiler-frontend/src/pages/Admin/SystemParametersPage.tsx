import React, { useEffect, useState } from "react";
import Navbar from "../../components/Navbar";
import { useAuth } from "../../context/AuthContext";
import {
  systemParametersService,
  SystemParameters,
} from "../../services/systemParametersService";
import "./SystemParametersPage.css";
import { historicalDataService } from "../../services/historicalDataService";

const SystemParametersPage: React.FC = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [params, setParams] = useState<SystemParameters | null>(null);

  const [wallUValue, setWallUValue] = useState("");
  const [windowUValue, setWindowUValue] = useState("");
  const [ceilingUValue, setCeilingUValue] = useState("");
  const [floorUValue, setFloorUValue] = useState("");
  const [outdoorDesignTemp, setOutdoorDesignTemp] = useState("");
  const [groundTemp, setGroundTemp] = useState("");
  const [gasPricePerKwh, setGasPricePerKwh] = useState("");
  const [windowToWallRatio, setWindowToWallRatio] = useState("");
  const [safetyFactor, setSafetyFactor] = useState("");
  const [defaultBoilerEfficiency, setDefaultBoilerEfficiency] = useState("");

  const [thermalMassCoefficient, setThermalMassCoefficient] = useState("");
  const [outdoorInfluenceFactor, setOutdoorInfluenceFactor] = useState("");
  const [temperatureTimeStepSeconds, setTemperatureTimeStepSeconds] =
    useState("");

  const [readingsCount, setReadingsCount] = useState<number>(0);
  const [isSeeding, setIsSeeding] = useState(false);
  const [seedMessage, setSeedMessage] = useState("");

  useEffect(() => {
    loadParameters();
    loadReadingsCount();
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

      setThermalMassCoefficient(
        data.thermalMassCoefficient?.toString() || "1200",
      );
      setOutdoorInfluenceFactor(
        data.outdoorInfluenceFactor?.toString() || "0.15",
      );
      setTemperatureTimeStepSeconds(
        data.temperatureTimeStepSeconds?.toString() || "60",
      );

      setError("");
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to load parameters");
    } finally {
      setLoading(false);
    }
  };

  const loadReadingsCount = async () => {
    try {
      const count = await historicalDataService.getReadingsCount(user!.token);
      setReadingsCount(count);
    } catch (err) {
      console.error("Error loading readings count:", err);
    }
  };

  const handleGenerateTestData = async () => {
    if (!window.confirm("Generate 30 days of test data for all buildings?")) {
      return;
    }

    setIsSeeding(true);
    setSeedMessage("");

    try {
      const response = await historicalDataService.seedData(user!.token, 30);
      setSeedMessage(`✅ ${response.message}`);
      await loadReadingsCount();
    } catch (err: any) {
      setSeedMessage(`❌ Error: ${err.response?.data?.message || err.message}`);
    } finally {
      setIsSeeding(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
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
        thermalMassCoefficient: parseFloat(thermalMassCoefficient),
        outdoorInfluenceFactor: parseFloat(outdoorInfluenceFactor),
        temperatureTimeStepSeconds: parseFloat(temperatureTimeStepSeconds),
      });

      setParams(updated);
      setSuccess("✅ Parameters successfully updated!");

      setTimeout(() => setSuccess(""), 5000);
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to update parameters");
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
      setThermalMassCoefficient(
        params.thermalMassCoefficient?.toString() || "1200",
      );
      setOutdoorInfluenceFactor(
        params.outdoorInfluenceFactor?.toString() || "0.15",
      );
      setTemperatureTimeStepSeconds(
        params.temperatureTimeStepSeconds?.toString() || "60",
      );

      setError("");
      setSuccess("");
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
              <span>
                Last updated:{" "}
                {new Date(params.lastUpdated).toLocaleString("sr-RS")}
              </span>
              <span>•</span>
              <span>User: {params.updatedBy}</span>
            </div>
          </div>

          {error && <div className="alert alert-error">❌ {error}</div>}
          {success && <div className="alert alert-success">{success}</div>}

          <form onSubmit={handleSubmit} className="params-form">
            <div className="params-grid">
              <div
                className="param-item"
                data-tooltip="Heat transfer coefficient through wall. Lower value = better insulation."
              >
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

              <div
                className="param-item"
                data-tooltip="Heat transfer coefficient through window. Lower value = better window."
              >
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

              <div
                className="param-item"
                data-tooltip="Heat transfer coefficient through ceiling/roof."
              >
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

              <div
                className="param-item"
                data-tooltip="Heat transfer coefficient through floor."
              >
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
              <div
                className="param-item"
                data-tooltip="Coldest expected outdoor temperature in winter. Used for heating system sizing."
              >
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

              <div
                className="param-item"
                data-tooltip="Average ground temperature."
              >
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

              <div
                className="param-item"
                data-tooltip="Natural gas price per kilowatt-hour."
              >
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
              <div
                className="param-item"
                data-tooltip="Window area ratio relative to wall."
              >
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

              <div
                className="param-item"
                data-tooltip="Safety factor for heating system design."
              >
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
                    max="1.50"
                    required
                    className="param-input"
                  />
                  <span className="param-unit">×</span>
                </div>
                <span className="param-hint">1.00 - 1.50</span>
              </div>

              <div
                className="param-item"
                data-tooltip="Default boiler efficiency for cost calculations."
              >
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

            <div className="params-grid params-grid-3 thermodynamics-section">
              <div
                className="param-item"
                data-tooltip="Thermal mass coefficient (J/m³·K). Higher = building heats/cools slower. Typical: 1200 (light), 2000 (medium), 3500 (heavy concrete)."
              >
                <label>
                  <span className="param-icon">🧱</span>
                  <span className="param-name">Thermal mass</span>
                  <span className="info-icon">ℹ️</span>
                </label>
                <div className="input-wrapper">
                  <input
                    type="number"
                    value={thermalMassCoefficient}
                    onChange={(e) => setThermalMassCoefficient(e.target.value)}
                    step="100"
                    min="500"
                    max="5000"
                    required
                    className="param-input"
                  />
                  <span className="param-unit-small">J/m³·K</span>
                </div>
                <span className="param-hint">500 - 5000</span>
              </div>

              <div
                className="param-item"
                data-tooltip="Outdoor influence factor (0-1). How much outdoor temperature affects indoor. Typical: 0.15 (well insulated), 0.30 (poorly insulated)."
              >
                <label>
                  <span className="param-icon">🌡️</span>
                  <span className="param-name">Outdoor influence</span>
                  <span className="info-icon">ℹ️</span>
                </label>
                <div className="input-wrapper">
                  <input
                    type="number"
                    value={outdoorInfluenceFactor}
                    onChange={(e) => setOutdoorInfluenceFactor(e.target.value)}
                    step="0.01"
                    min="0.05"
                    max="0.50"
                    required
                    className="param-input"
                  />
                  <span className="param-unit">factor</span>
                </div>
                <span className="param-hint">0.05 - 0.50</span>
              </div>

              <div
                className="param-item"
                data-tooltip="Time step for temperature calculations (seconds). P-Controller runs at this interval. Typical: 60 seconds."
              >
                <label>
                  <span className="param-icon">⏱️</span>
                  <span className="param-name">Time step</span>
                  <span className="info-icon">ℹ️</span>
                </label>
                <div className="input-wrapper">
                  <input
                    type="number"
                    value={temperatureTimeStepSeconds}
                    onChange={(e) =>
                      setTemperatureTimeStepSeconds(e.target.value)
                    }
                    step="10"
                    min="30"
                    max="300"
                    required
                    className="param-input"
                  />
                  <span className="param-unit">sec</span>
                </div>
                <span className="param-hint">30 - 300</span>
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
                {saving ? "⏳ Saving..." : "💾 Save"}
              </button>
            </div>
          </form>

          <hr
            style={{
              margin: "2rem 0",
              border: "none",
              borderTop: "2px solid #e5e7eb",
            }}
          />

          <div
            style={{
              background: "linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%)",
              padding: "1.5rem",
              borderRadius: "12px",
              border: "2px solid #38bdf8",
              marginTop: "2rem",
            }}
          >
            <h3
              style={{
                margin: "0 0 1rem 0",
                color: "#0c4a6e",
                fontSize: "1.3rem",
                fontWeight: "700",
              }}
            >
              📊 Historical Data Management
            </h3>

            <p
              style={{
                margin: "0 0 1rem 0",
                color: "#475569",
                fontSize: "1rem",
              }}
            >
              <strong>Current readings in database:</strong>{" "}
              {readingsCount.toLocaleString()}
            </p>

            <div
              style={{
                background: "white",
                padding: "1rem",
                borderRadius: "8px",
                marginBottom: "1rem",
                border: "1px solid #bae6fd",
              }}
            >
              <p
                style={{
                  margin: "0 0 1rem 0",
                  color: "#64748b",
                  fontSize: "0.9rem",
                  lineHeight: "1.6",
                }}
              >
                ⚠️ <strong>Generate Test Data:</strong> Creates 30 days of
                historical readings.
              </p>

              <button
                onClick={handleGenerateTestData}
                disabled={isSeeding}
                style={{
                  backgroundColor: isSeeding ? "#94a3b8" : "#3b82f6",
                  color: "white",
                  padding: "0.75rem 1.5rem",
                  borderRadius: "8px",
                  border: "none",
                  fontSize: "1rem",
                  fontWeight: "600",
                  cursor: isSeeding ? "not-allowed" : "pointer",
                  transition: "all 0.2s",
                  width: "100%",
                }}
              >
                {isSeeding
                  ? "⏳ Generating..."
                  : "🔄 Generate 30 Days of Test Data"}
              </button>

              {seedMessage && (
                <div
                  style={{
                    marginTop: "1rem",
                    padding: "0.75rem",
                    borderRadius: "6px",
                    background: seedMessage.startsWith("✅")
                      ? "#dcfce7"
                      : "#fee2e2",
                    color: seedMessage.startsWith("✅") ? "#166534" : "#991b1b",
                    fontSize: "0.9rem",
                    fontWeight: "500",
                    border: seedMessage.startsWith("✅")
                      ? "1px solid #86efac"
                      : "1px solid #fca5a5",
                  }}
                >
                  {seedMessage}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default SystemParametersPage;
