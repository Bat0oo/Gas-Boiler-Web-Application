import React, { useState } from 'react';
import { gasBoilerService, GasBoilerFullResponse } from '../../services/gasBoilerService';
import './EditBoilerModal.css';

interface Props {
  boiler: GasBoilerFullResponse;
  onClose: () => void;
  onSave: (updatedBoiler: GasBoilerFullResponse) => void;
  token: string;
}

const EditBoilerModal: React.FC<Props> = ({ boiler, onClose, onSave, token }) => {
  const [formData, setFormData] = useState({
    name: boiler.name,
    maxPower: boiler.maxPower,
    efficiency: boiler.efficiency,
    buildingName: boiler.buildingObject?.name ?? '',
    heatingArea: boiler.buildingObject?.heatingArea ?? 0,
    desiredTemperature: boiler.buildingObject?.desiredTemperature ?? 20,
    wallUValue: boiler.buildingObject?.wallUValue ?? 0.5,
    windowUValue: boiler.buildingObject?.windowUValue ?? 1.1,
    ceilingUValue: boiler.buildingObject?.ceilingUValue ?? 0.4,
    floorUValue: boiler.buildingObject?.floorUValue ?? 0.3,
    wallArea: boiler.buildingObject?.wallArea ?? 0,
    windowArea: boiler.buildingObject?.windowArea ?? 0,
    ceilingArea: boiler.buildingObject?.ceilingArea ?? 0,
    floorArea: boiler.buildingObject?.floorArea ?? 0,
    latitude: boiler.buildingObject?.latitude ?? 0,
    longitude: boiler.buildingObject?.longitude ?? 0,
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: parseFloat(value) || 0
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const payload = {
        name: formData.name,
        maxPower: formData.maxPower,
        efficiency: formData.efficiency,
        currentPower: boiler.currentPower, // Keep current power unchanged
        buildingObject: {
          name: formData.buildingName,
          heatingArea: formData.heatingArea,
          desiredTemperature: formData.desiredTemperature,
          wallUValue: formData.wallUValue,
          windowUValue: formData.windowUValue,
          ceilingUValue: formData.ceilingUValue,
          floorUValue: formData.floorUValue,
          wallArea: formData.wallArea,
          windowArea: formData.windowArea,
          ceilingArea: formData.ceilingArea,
          floorArea: formData.floorArea,
          latitude: formData.latitude,
          longitude: formData.longitude,
        }
      };

      const updated = await gasBoilerService.updateGasBoiler(boiler.id, payload, token);
      onSave(updated);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to update boiler');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Izmeni Gasni Kotao</h2>
          <button onClick={onClose} className="close-btn">&times;</button>
        </div>

        {error && <div className="error-message">{error}</div>}

        <form onSubmit={handleSubmit} className="edit-form">
          <div className="form-section">
            <h3>Osnovne Informacije</h3>
            
            <div className="form-group">
              <label>Naziv Kotla</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                required
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Maksimalna Snaga (kW)</label>
                <input
                  type="number"
                  name="maxPower"
                  value={formData.maxPower}
                  onChange={handleChange}
                  step="0.1"
                  min="0"
                  required
                />
              </div>

              <div className="form-group">
                <label>Efikasnost (0-1)</label>
                <input
                  type="number"
                  name="efficiency"
                  value={formData.efficiency}
                  onChange={handleChange}
                  step="0.01"
                  min="0"
                  max="1"
                  required
                />
              </div>
            </div>

            <div className="form-group readonly">
              <label>Trenutna Snaga (kW) - Samo za prikaz</label>
              <input
                type="number"
                value={boiler.currentPower}
                disabled
                className="readonly-input"
              />
            </div>
          </div>

          <div className="form-section">
            <h3>Objekat</h3>

            <div className="form-group">
              <label>Naziv Objekta</label>
              <input
                type="text"
                name="buildingName"
                value={formData.buildingName}
                onChange={(e) => setFormData(prev => ({ ...prev, buildingName: e.target.value }))}
                required
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Površina Grejanja (m²)</label>
                <input
                  type="number"
                  name="heatingArea"
                  value={formData.heatingArea}
                  onChange={handleChange}
                  step="0.1"
                  min="0"
                />
              </div>

              <div className="form-group">
                <label>Željena Temperatura (°C)</label>
                <input
                  type="number"
                  name="desiredTemperature"
                  value={formData.desiredTemperature}
                  onChange={handleChange}
                  step="0.1"
                  min="0"
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Zidovi U-Value (W/m²K)</label>
                <input
                  type="number"
                  name="wallUValue"
                  value={formData.wallUValue}
                  onChange={handleChange}
                  step="0.01"
                  min="0"
                />
              </div>

              <div className="form-group">
                <label>Prozori U-Value (W/m²K)</label>
                <input
                  type="number"
                  name="windowUValue"
                  onChange={handleChange}
                  step="0.01"
                  min="0"
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Plafon U-Value (W/m²K)</label>
                <input
                  type="number"
                  name="ceilingUValue"
                  value={formData.ceilingUValue}
                  onChange={handleChange}
                  step="0.01"
                  min="0"
                />
              </div>

              <div className="form-group">
                <label>Pod U-Value (W/m²K)</label>
                <input
                  type="number"
                  name="floorUValue"
                  value={formData.floorUValue}
                  onChange={handleChange}
                  step="0.01"
                  min="0"
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Površina Zidova (m²)</label>
                <input
                  type="number"
                  name="wallArea"
                  value={formData.wallArea}
                  onChange={handleChange}
                  step="0.1"
                  min="0"
                />
              </div>

              <div className="form-group">
                <label>Površina Prozora (m²)</label>
                <input
                  type="number"
                  name="windowArea"
                  value={formData.windowArea}
                  onChange={handleChange}
                  step="0.1"
                  min="0"
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Površina Plafona (m²)</label>
                <input
                  type="number"
                  name="ceilingArea"
                  value={formData.ceilingArea}
                  onChange={handleChange}
                  step="0.1"
                  min="0"
                />
              </div>

              <div className="form-group">
                <label>Površina Poda (m²)</label>
                <input
                  type="number"
                  name="floorArea"
                  value={formData.floorArea}
                  onChange={handleChange}
                  step="0.1"
                  min="0"
                />
              </div>
            </div>
          </div>

          <div className="form-section">
            <h3>Lokacija</h3>
            <div className="form-row">
              <div className="form-group">
                <label>Latitude</label>
                <input
                  type="number"
                  name="latitude"
                  value={formData.latitude}
                  onChange={handleChange}
                  step="0.0001"
                  required
                />
              </div>

              <div className="form-group">
                <label>Longitude</label>
                <input
                  type="number"
                  name="longitude"
                  value={formData.longitude}
                  onChange={handleChange}
                  step="0.0001"
                  required
                />
              </div>
            </div>
          </div>

          <div className="modal-actions">
            <button type="button" onClick={onClose} className="btn-secondary" disabled={loading}>
              Otkaži
            </button>
            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? 'Čuvanje...' : 'Sačuvaj'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditBoilerModal;