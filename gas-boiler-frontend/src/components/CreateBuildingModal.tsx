// components/CreateBuildingModal.tsx
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
  const [desiredTemperature, setDesiredTemperature] = useState(22);
  
  // U-vrednosti (termička svojstva)
  const [wallUValue, setWallUValue] = useState(0.3);
  const [windowUValue, setWindowUValue] = useState(1.2);
  const [ceilingUValue, setCeilingUValue] = useState(0.25);
  const [floorUValue, setFloorUValue] = useState(0.5);
  
  // Površine
  const [wallArea, setWallArea] = useState(150);
  const [windowArea, setWindowArea] = useState(20);
  const [ceilingArea, setCeilingArea] = useState(100);
  const [floorArea, setFloorArea] = useState(100);

  const [loading, setLoading] = useState(false);

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

      await onCreate(payload);
      
      // Reset form
      setName('');
      setHeatingArea(100);
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
        <h2>Kreiraj Zgradu</h2>
        
        <label>
          Naziv zgrade:
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="npr. Moja Kuća"
            required
          />
        </label>

        <label>
          Lokacija:
          <input
            type="text"
            value={position ? `${position.lat.toFixed(6)}, ${position.lng.toFixed(6)}` : ''}
            disabled
          />
        </label>

        <hr />

        <h3>Osnovna svojstva</h3>

        <label>
          Površina grejanja (m²):
          <input
            type="number"
            value={heatingArea}
            onChange={(e) => setHeatingArea(parseFloat(e.target.value) || 0)}
            min="0"
          />
        </label>

        <label>
          Željena temperatura (°C):
          <input
            type="number"
            value={desiredTemperature}
            onChange={(e) => setDesiredTemperature(parseFloat(e.target.value) || 0)}
            min="-50"
            max="50"
          />
        </label>

        <hr />

        <h3>Termička svojstva (U-vrednosti W/m²·K)</h3>

        <div className="grid-two-columns">
          <label>
            Zidovi:
            <input
              type="number"
              step="0.01"
              value={wallUValue}
              onChange={(e) => setWallUValue(parseFloat(e.target.value) || 0)}
              min="0"
            />
          </label>

          <label>
            Prozori:
            <input
              type="number"
              step="0.01"
              value={windowUValue}
              onChange={(e) => setWindowUValue(parseFloat(e.target.value) || 0)}
              min="0"
            />
          </label>

          <label>
            Plafon:
            <input
              type="number"
              step="0.01"
              value={ceilingUValue}
              onChange={(e) => setCeilingUValue(parseFloat(e.target.value) || 0)}
              min="0"
            />
          </label>

          <label>
            Pod:
            <input
              type="number"
              step="0.01"
              value={floorUValue}
              onChange={(e) => setFloorUValue(parseFloat(e.target.value) || 0)}
              min="0"
            />
          </label>
        </div>

        <hr />

        <h3>Površine (m²)</h3>

        <div className="grid-two-columns">
          <label>
            Zidovi:
            <input
              type="number"
              value={wallArea}
              onChange={(e) => setWallArea(parseFloat(e.target.value) || 0)}
              min="0"
            />
          </label>

          <label>
            Prozori:
            <input
              type="number"
              value={windowArea}
              onChange={(e) => setWindowArea(parseFloat(e.target.value) || 0)}
              min="0"
            />
          </label>

          <label>
            Plafon:
            <input
              type="number"
              value={ceilingArea}
              onChange={(e) => setCeilingArea(parseFloat(e.target.value) || 0)}
              min="0"
            />
          </label>

          <label>
            Pod:
            <input
              type="number"
              value={floorArea}
              onChange={(e) => setFloorArea(parseFloat(e.target.value) || 0)}
              min="0"
            />
          </label>
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
      </div>
    </div>
  );
};

export default CreateBuildingModal;