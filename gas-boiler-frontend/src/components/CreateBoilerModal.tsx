// components/CreateBoilerModal.tsx
import React, { useState } from 'react';
import { CreateGasBoilerPayload } from '../types/gasBoilertypes';
import './CreateBoilerModal.css';

interface Props {
  isOpen: boolean;
  buildingId: number | null;
  buildingName: string;
  onClose: () => void;
  onCreate: (boiler: CreateGasBoilerPayload) => Promise<void>;
}

const CreateBoilerModal: React.FC<Props> = ({
  isOpen,
  buildingId,
  buildingName,
  onClose,
  onCreate,
}) => {
  const [name, setName] = useState('');
  const [maxPower, setMaxPower] = useState(24);
  const [efficiency, setEfficiency] = useState(0.95);
  const [currentPower, setCurrentPower] = useState(0);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!buildingId || !name.trim()) {
      alert('Unesite naziv kotla');
      return;
    }

    if (maxPower <= 0) {
      alert('Maksimalna snaga mora biti veća od 0');
      return;
    }

    if (efficiency <= 0 || efficiency > 1) {
      alert('Efikasnost mora biti između 0 i 1 (npr. 0.95 za 95%)');
      return;
    }

    setLoading(true);
    try {
      const payload: CreateGasBoilerPayload = {
        name: name.trim(),
        maxPower,
        efficiency,
        currentPower,
        buildingObjectId: buildingId,
      };

      await onCreate(payload);

      // Reset form
      setName('');
      setMaxPower(24);
      setEfficiency(0.95);
      setCurrentPower(0);
      onClose();
    } catch (err) {
      console.error('Greška prilikom kreiranja kotla:', err);
      alert('Greška prilikom kreiranja kotla');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal create-boiler-modal">
        <h2>Dodaj Kotao</h2>

        <div className="building-info-banner">
          <p>
            <strong>Zgrada:</strong> {buildingName}
          </p>
        </div>

        <label>
          Naziv kotla:
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="npr. Glavni Kotao"
            required
            autoFocus
          />
        </label>

        <label>
          Maksimalna snaga (kW):
          <input
            type="number"
            value={maxPower}
            onChange={(e) => setMaxPower(parseFloat(e.target.value) || 0)}
            min="0.1"
            step="0.1"
          />
        </label>

        <label>
          Efikasnost (0-1, npr. 0.95 = 95%):
          <input
            type="number"
            value={efficiency}
            onChange={(e) => setEfficiency(parseFloat(e.target.value) || 0)}
            min="0.01"
            max="1"
            step="0.01"
          />
        </label>

        <label>
          Trenutna snaga (kW):
          <input
            type="number"
            value={currentPower}
            onChange={(e) => setCurrentPower(parseFloat(e.target.value) || 0)}
            min="0"
            step="0.1"
          />
        </label>

        <div className="modal-buttons">
          <button
            onClick={handleSubmit}
            className="btn-primary"
            disabled={loading || !name.trim()}
          >
            {loading ? 'Dodavanje...' : 'Dodaj Kotao'}
          </button>
          <button onClick={onClose} className="btn-secondary" disabled={loading}>
            Otkaži
          </button>
        </div>
      </div>
    </div>
  );
};

export default CreateBoilerModal;