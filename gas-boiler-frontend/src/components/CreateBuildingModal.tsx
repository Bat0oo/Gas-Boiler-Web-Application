import React, { useState } from 'react';
import { CreateBuildingPayload } from '../types/buildingtypes';
import './CreateBuildingModal.css';

interface Props {
  isOpen: boolean;
  position: { lat: number; lng: number } | null;
  onClose: () => void;
  onCreate: (building: CreateBuildingPayload) => Promise<void>;
}

const CreateBuildingModal: React.FC<Props> = ({ isOpen, position, onClose, onCreate }) => {
  const [name, setName] = useState('');
  const [heatingArea, setHeatingArea] = useState(100);
  const [height, setHeight] = useState(2.7);
  const [desiredTemperature, setDesiredTemperature] = useState(22);
  const [loading, setLoading] = useState(false);

  // Calculated volume for display
  const calculatedVolume = heatingArea * height;

  const handleSubmit = async () => {
    if (!position || !name.trim()) {
      alert('Unesite naziv zgrade');
      return;
    }

    setLoading(true);
    try {
      const payload: CreateBuildingPayload = {
        name: name.trim(),
        latitude: position.lat,
        longitude: position.lng,
        heatingArea,
        height,
        desiredTemperature,
      };

      await onCreate(payload);
      
      // Reset form
      setName('');
      setHeatingArea(100);
      setHeight(2.7);
      setDesiredTemperature(22);
      onClose();
    } catch (err) {
      console.error('Greška prilikom kreiranja zgrade:', err);
      alert('Greška prilikom kreiranja zgrade');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal create-building-modal">
        <h2>🏢 Kreiraj Zgradu</h2>
        
        <div className="form-group">
          <label>Naziv zgrade:</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="npr. Moja Kuća"
            required
          />
        </div>

        <div className="form-group">
          <label>Lokacija:</label>
          <input
            type="text"
            value={position ? `${position.lat.toFixed(6)}, ${position.lng.toFixed(6)}` : ''}
            disabled
          />
        </div>

        <div className="form-group">
          <label>Površina grejanja (m²):</label>
          <input
            type="number"
            value={heatingArea}
            onChange={(e) => setHeatingArea(parseFloat(e.target.value) || 0)}
            min="1"
            step="1"
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
          />
        </div>

        <div className="modal-buttons">
          <button
            onClick={handleSubmit}
            className="btn-primary"
            disabled={loading || !name.trim()}
          >
            {loading ? 'Kreiranje...' : 'Kreiraj'}
          </button>
          <button onClick={onClose} className="btn-secondary" disabled={loading}>
            Otkaži
          </button>
        </div>

        <div className="info-note">
          ℹ️ Termička svojstva i površine će biti automatski izračunati na osnovu standardnih vrednosti.
        </div>
      </div>
    </div>
  );
};

export default CreateBuildingModal;