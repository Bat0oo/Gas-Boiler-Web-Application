import React, { useEffect, useState } from 'react';
import Navbar from '../components/Navbar';
import { systemParametersService, SystemParameters } from '../services/systemParametersService';
import './ViewSystemParametersPage.css';

const ViewSystemParametersPage: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [params, setParams] = useState<SystemParameters | null>(null);

  useEffect(() => {
    loadParameters();
  }, []);

  const loadParameters = async () => {
    setLoading(true);
    try {
      const data = await systemParametersService.getParameters();
      setParams(data);
      setError('');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load parameters');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="view-params-container">
          <div className="loading">⏳ Učitavanje...</div>
        </div>
      </>
    );
  }

  if (!params) {
    return (
      <>
        <Navbar />
        <div className="view-params-container">
          <div className="error">❌ Parametri nisu pronađeni</div>
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className="view-params-container">
        <div className="view-params-card">
          {/* Compact Header */}
          <div className="page-header">
            <h1>📋 Sistemski Parametri</h1>
            <div className="metadata-compact">
              <span>Poslednja izmena: {new Date(params.lastUpdated).toLocaleString('sr-RS')}</span>
              <span>•</span>
              <span>Korisnik: {params.updatedBy}</span>
            </div>
          </div>

          {error && <div className="alert alert-error">❌ {error}</div>}

          {/* Compact Info */}
          <div className="info-notice-compact">
            <strong>ℹ️</strong> Parametri postavljeni od administratora. Koriste se za proračune toplotnih gubitaka.
          </div>

          {/* ROW 1: U-Values (4 columns) */}
          <div className="params-section-compact">
            <h3 className="section-title-compact">🏗️ U-vrednosti (W/m²K)</h3>
            <div className="params-grid-4">
              <div className="param-compact">
                <div className="param-label-compact">Zidovi</div>
                <div className="param-value-compact">{params.wallUValue.toFixed(2)}</div>
              </div>
              <div className="param-compact">
                <div className="param-label-compact">Prozori</div>
                <div className="param-value-compact">{params.windowUValue.toFixed(2)}</div>
              </div>
              <div className="param-compact">
                <div className="param-label-compact">Plafon</div>
                <div className="param-value-compact">{params.ceilingUValue.toFixed(2)}</div>
              </div>
              <div className="param-compact">
                <div className="param-label-compact">Pod</div>
                <div className="param-value-compact">{params.floorUValue.toFixed(2)}</div>
              </div>
            </div>
          </div>

          {/* ROW 2: Temperatures + Economics (3 columns) */}
          <div className="params-section-compact">
            <h3 className="section-title-compact">🌡️ Temperature i Cene</h3>
            <div className="params-grid-3">
              <div className="param-compact temp">
                <div className="param-label-compact">❄️ Spoljna</div>
                <div className="param-value-compact">{params.outdoorDesignTemp.toFixed(1)} <span className="unit-small">°C</span></div>
              </div>
              <div className="param-compact temp">
                <div className="param-label-compact">🌍 Tlo</div>
                <div className="param-value-compact">{params.groundTemp.toFixed(1)} <span className="unit-small">°C</span></div>
              </div>
              <div className="param-compact price">
                <div className="param-label-compact">💰 Cena gasa</div>
                <div className="param-value-compact">{params.gasPricePerKwh.toFixed(3)} <span className="unit-small">€/kWh</span></div>
              </div>
            </div>
          </div>
          <div className="params-section-compact new-section">
            <h3 className="section-title-compact">🔧 Parametri zgrade i proračuna</h3>
            <div className="params-grid-3">
              <div className="param-compact new-param">
                <div className="param-label-compact">🪟 Udeo prozora</div>
                <div className="param-value-compact">
                  {(params.windowToWallRatio * 100).toFixed(0)} <span className="unit-small">%</span>
                </div>
              </div>
              <div className="param-compact new-param">
                <div className="param-label-compact">🛡️ Faktor sigurnosti</div>
                <div className="param-value-compact">
                  {params.safetyFactor.toFixed(2)} <span className="unit-small">×</span>
                </div>
              </div>
              <div className="param-compact new-param">
                <div className="param-label-compact">⚙️ Efikasnost kotla</div>
                <div className="param-value-compact">
                  {(params.defaultBoilerEfficiency * 100).toFixed(0)} <span className="unit-small">%</span>
                </div>
              </div>
            </div>
          </div>

          {/* Compact Explanation */}
          <div className="explanation-compact">
            <strong>💡 Objašnjenja:</strong> U-vrednosti mere izolaciju (niže = bolje). Spoljna temp za dimenzionisanje. Temp tla za proračun poda. Cena gasa za procenu troškova. Udeo prozora definiše odnos površine prozora i zida. Faktor sigurnosti dodaje rezervu za ekstremne uslove. Efikasnost kotla utiče na troškove grejanja.          </div>
        </div>
      </div>
    </>
  );
};

export default ViewSystemParametersPage;