import React, { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import {
  systemParametersService,
  SystemParameters,
} from "../services/systemParametersService";
import "./ViewSystemParametersPage.css";

const ViewSystemParametersPage: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [params, setParams] = useState<SystemParameters | null>(null);

  useEffect(() => {
    loadParameters();
  }, []);

  const loadParameters = async () => {
    setLoading(true);
    try {
      const data = await systemParametersService.getParameters();
      setParams(data);
      setError("");
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to load parameters");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="view-params-container">
          <div className="loading">⏳ Loading...</div>
        </div>
      </>
    );
  }

  if (!params) {
    return (
      <>
        <Navbar />
        <div className="view-params-container">
          <div className="error">❌ Parameters not found</div>
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className="view-params-container">
        <div className="view-params-card">
          <div className="page-header">
            <h1>📋 System Parameters</h1>
            <div className="metadata-compact">
              <span>
                Last updated:{" "}
                {new Date(params.lastUpdated).toLocaleString("sr-RS")}
              </span>
              <span>•</span>
              <span>User: {params.updatedBy}</span>
            </div>
          </div>

          {error && <div className="alert alert-error">❌ {error}</div>}

          <div className="info-notice-compact">
            <strong>ℹ️</strong> Parameters set by administrator. Used for heat
            loss calculations.
          </div>

          <div className="params-section-compact">
            <h3 className="section-title-compact">🏗️ U-values (W/m²K)</h3>
            <div className="params-grid-4">
              <div className="param-compact">
                <div className="param-label-compact">Walls - WallU</div>
                <div className="param-value-compact">
                  {params.wallUValue.toFixed(2)}
                </div>
              </div>
              <div className="param-compact">
                <div className="param-label-compact">Windows - WindowU</div>
                <div className="param-value-compact">
                  {params.windowUValue.toFixed(2)}
                </div>
              </div>
              <div className="param-compact">
                <div className="param-label-compact">Ceiling - CeilingU</div>
                <div className="param-value-compact">
                  {params.ceilingUValue.toFixed(2)}
                </div>
              </div>
              <div className="param-compact">
                <div className="param-label-compact">Floor - FloorU</div>
                <div className="param-value-compact">
                  {params.floorUValue.toFixed(2)}
                </div>
              </div>
            </div>
          </div>

          <div className="params-section-compact">
            <h3 className="section-title-compact">
              🌡️ Temperatures and Prices
            </h3>
            <div className="params-grid-3">
              <div className="param-compact temp">
                <div className="param-label-compact">❄️ Outdoor</div>
                <div className="param-value-compact">
                  {params.outdoorDesignTemp.toFixed(1)}{" "}
                  <span className="unit-small">°C</span>
                </div>
              </div>
              <div className="param-compact temp">
                <div className="param-label-compact">🌍 Ground</div>
                <div className="param-value-compact">
                  {params.groundTemp.toFixed(1)}{" "}
                  <span className="unit-small">°C</span>
                </div>
              </div>
              <div className="param-compact price">
                <div className="param-label-compact">💰 Gas price</div>
                <div className="param-value-compact">
                  {params.gasPricePerKwh.toFixed(3)}{" "}
                  <span className="unit-small">€/kWh</span>
                </div>
              </div>
            </div>
          </div>

          <div className="params-section-compact new-section">
            <h3 className="section-title-compact">
              🔧 Building and calculation parameters
            </h3>
            <div className="params-grid-3">
              <div className="param-compact new-param">
                <div className="param-label-compact">🪟 Window ratio</div>
                <div className="param-value-compact">
                  {(params.windowToWallRatio * 100).toFixed(0)}{" "}
                  <span className="unit-small">%</span>
                </div>
              </div>
              <div className="param-compact new-param">
                <div className="param-label-compact">🛡️ Safety factor</div>
                <div className="param-value-compact">
                  {params.safetyFactor.toFixed(2)}{" "}
                  <span className="unit-small">×</span>
                </div>
              </div>
              <div className="param-compact new-param">
                <div className="param-label-compact">⚙️ Boiler efficiency</div>
                <div className="param-value-compact">
                  {(params.defaultBoilerEfficiency * 100).toFixed(0)}{" "}
                  <span className="unit-small">%</span>
                </div>
              </div>
            </div>
          </div>

          <div className="params-section-compact thermodynamics-section-view">
            <h3 className="section-title-compact">
              🔬 Thermodynamics Parameters (P-Controller)
            </h3>
            <div className="params-grid-3">
              <div className="param-compact thermo-param">
                <div className="param-label-compact">🧱 Thermal mass</div>
                <div className="param-value-compact">
                  {params.thermalMassCoefficient?.toFixed(0) || "1200"}{" "}
                  <span className="unit-small">J/m³·K</span>
                </div>
              </div>
              <div className="param-compact thermo-param">
                <div className="param-label-compact">🌡️ Outdoor influence</div>
                <div className="param-value-compact">
                  {params.outdoorInfluenceFactor?.toFixed(2) || "0.15"}{" "}
                  <span className="unit-small">factor</span>
                </div>
              </div>
              <div className="param-compact thermo-param">
                <div className="param-label-compact">⏱️ Time step</div>
                <div className="param-value-compact">
                  {params.temperatureTimeStepSeconds?.toFixed(0) || "60"}{" "}
                  <span className="unit-small">sec</span>
                </div>
              </div>
            </div>
          </div>

          <div className="explanation-compact">
            <strong>💡 Explanations:</strong> U-values measure insulation (lower
            = better). Outdoor temp for system sizing. Ground temp for floor
            calculations. Gas price for cost estimation. Window ratio defines
            window-to-wall area ratio. Safety factor adds reserve for extreme
            conditions. Boiler efficiency affects heating costs.{" "}
            <strong>Thermal mass:</strong> how slowly building heats/cools.{" "}
            <strong>Outdoor influence:</strong> how much outdoor temp affects
            indoor. <strong>Time step:</strong> P-Controller update interval.
          </div>
        </div>
      </div>
    </>
  );
};

export default ViewSystemParametersPage;
