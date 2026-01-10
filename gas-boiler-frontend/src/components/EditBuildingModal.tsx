import React, { useState, useEffect } from 'react';
import { Building, UpdateBuildingPayload } from '../types/buildingtypes';
import { buildingService } from '../services/buildingService';
import './EditBuildingModal.css';

interface Props {
  isOpen: boolean;
  building: Building | null;
  token: string;
  onClose: () => void;
  onSuccess: (updatedBuilding: Building) => void;
}

const EditBuildingModal: React.FC<Props> = ({ isOpen, building, token, onClose, onSuccess }) => {
  // ========== EDITABLE PROPERTIES ==========
  const [name, setName] = useState('');
  const [heatingArea, setHeatingArea] = useState(0);
  const [height, setHeight] = useState(2.7);
  const [desiredTemperature, setDesiredTemperature] = useState(22);
  
  // ========== READ-ONLY PROPERTIES (FROM SYSTEM PARAMETERS) ==========
  const [wallUValue, setWallUValue] = useState(0);
  const [windowUValue, setWindowUValue] = useState(0);
  const [ceilingUValue, setCeilingUValue] = useState(0);
  const [floorUValue, setFloorUValue] = useState(0);
  
  const [wallArea, setWallArea] = useState(0);
  const [windowArea, setWindowArea] = useState(0);
  const [ceilingArea, setCeilingArea] = useState(0);
  const [floorArea, setFloorArea] = useState(0);
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Calculated volume
  const calculatedVolume = heatingArea * height;

  // Load building data when modal opens
  useEffect(() => {
    if (isOpen && building) {
      setName(building.name);
      setHeatingArea(building.heatingArea);
      setHeight(building.height);
      setDesiredTemperature(building.desiredTemperature);
      
      setWallUValue(building.wallUValue);
      setWindowUValue(building.windowUValue);
      setCeilingUValue(building.ceilingUValue);
      setFloorUValue(building.floorUValue);
      setWallArea(building.wallArea);
      setWindowArea(building.windowArea);
      setCeilingArea(building.ceilingArea);
      setFloorArea(building.floorArea);
      
      setError('');
    }
  }, [isOpen, building]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!building) return;

    setLoading(true);
    setError('');

    try {
      const payload: UpdateBuildingPayload = {
        name: name.trim(),
        latitude: building.latitude,
        longitude: building.longitude,
        heatingArea,
        height,
        desiredTemperature,
        wallUValue,
        windowUValue,
        ceilingUValue,
        floorUValue,
        wallArea,
        windowArea,
        ceilingArea,
        floorArea,
      };

      const updated = await buildingService.updateBuilding(building.id, payload, token);
      onSuccess(updated);
      onClose();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to update building');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen || !building) return null;

  return (
    <div className="modal-overlay">
      <div className="modal edit-building-modal">
        <div className="modal-header">
          <h2>✏️ Izmeni Zgradu</h2>
          <button onClick={onClose} className="close-button" disabled={loading}>
            ✕
          </button>
        </div>

        {error && (
          <div className="error-message">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {/* ========== EDITABLE PROPERTIES ========== */}
          <div className="form-section">
            <h3>Osnovna svojstva</h3>

            <div className="form-group">
              <label>Naziv zgrade:</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                disabled={loading}
              />
            </div>

            <div className="form-group">
              <label>Lokacija:</label>
              <input
                type="text"
                value={`${building.latitude.toFixed(6)}, ${building.longitude.toFixed(6)}`}
                disabled
                className="readonly-input"
              />
              <span className="help-text">📍 Lokaciju nije moguće izmeniti</span>
            </div>

            <div className="form-group">
              <label>Površina grejanja (m²):</label>
              <input
                type="number"
                value={heatingArea}
                onChange={(e) => setHeatingArea(parseFloat(e.target.value) || 0)}
                min="1"
                step="1"
                required
                disabled={loading}
              />
            </div>

            <div className="form-group">
              <label>Visina plafona (m):</label>
              <input
                type="number"
                step="0.1"
                value={height}
                onChange={(e) => setHeight(parseFloat(e.target.value) || 0)}
                min="0.1"
                max="10"
                required
                disabled={loading}
              />
              <span className="calculated-info">
                📦 Zapremina: {calculatedVolume.toFixed(1)} m³
              </span>
            </div>

            <div className="form-group">
              <label>Željena temperatura (°C):</label>
              <input
                type="number"
                value={desiredTemperature}
                onChange={(e) => setDesiredTemperature(parseFloat(e.target.value) || 0)}
                min="0"
                max="40"
                step="1"
                required
                disabled={loading}
              />
            </div>
          </div>

          {/* ========== COMPACT READ-ONLY SECTIONS ========== */}
          <div className="compact-readonly-section">
            <div className="compact-header">
              <h4>🔒 Sistemski Parametri (samo za prikaz)</h4>
              <span className="compact-subtitle">Postavljeno od administratora</span>
            </div>

            {/* U-Values - Compact Grid */}
            <div className="compact-grid">
              <div className="compact-item">
                <span className="compact-label">Zidovi:</span>
                <span className="compact-value">{wallUValue.toFixed(2)} W/m²·K</span>
              </div>
              <div className="compact-item">
                <span className="compact-label">Prozori:</span>
                <span className="compact-value">{windowUValue.toFixed(2)} W/m²·K</span>
              </div>
              <div className="compact-item">
                <span className="compact-label">Plafon:</span>
                <span className="compact-value">{ceilingUValue.toFixed(2)} W/m²·K</span>
              </div>
              <div className="compact-item">
                <span className="compact-label">Pod:</span>
                <span className="compact-value">{floorUValue.toFixed(2)} W/m²·K</span>
              </div>
            </div>

            {/* Surface Areas - Compact Grid */}
            <div className="compact-divider"></div>
            <div className="compact-grid">
              <div className="compact-item">
                <span className="compact-label">Površina zidova:</span>
                <span className="compact-value">{wallArea.toFixed(1)} m²</span>
              </div>
              <div className="compact-item">
                <span className="compact-label">Površina prozora:</span>
                <span className="compact-value">{windowArea.toFixed(1)} m²</span>
              </div>
              <div className="compact-item">
                <span className="compact-label">Površina plafona:</span>
                <span className="compact-value">{ceilingArea.toFixed(1)} m²</span>
              </div>
              <div className="compact-item">
                <span className="compact-label">Površina poda:</span>
                <span className="compact-value">{floorArea.toFixed(1)} m²</span>
              </div>
            </div>
          </div>

          <div className="modal-buttons">
            <button
              type="submit"
              className="btn-primary"
              disabled={loading || !name.trim()}
            >
              {loading ? 'Čuvanje...' : 'Sačuvaj Izmene'}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="btn-secondary"
              disabled={loading}
            >
              Otkaži
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditBuildingModal;