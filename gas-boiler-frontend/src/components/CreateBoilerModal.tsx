import React, { useState } from "react";
import { CreateGasBoilerPayload } from "../types/gasBoilertypes";
import "./CreateBoilerModal.css";

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
  const [name, setName] = useState("");
  const [maxPower, setMaxPower] = useState(24);
  const [efficiency, setEfficiency] = useState(0.95);
  const [currentPower, setCurrentPower] = useState(0);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!buildingId || !name.trim()) {
      alert("Enter boiler name");
      return;
    }

    if (maxPower <= 0) {
      alert("Maximum power must be greater than 0");
      return;
    }

    if (efficiency <= 0 || efficiency > 1) {
      alert("Efficiency must be between 0 and 1 (e.g. 0.95 for 95%)");
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

      setName("");
      setMaxPower(24);
      setEfficiency(0.95);
      setCurrentPower(0);
      onClose();
    } catch (err) {
      console.error("Error creating boiler:", err);
      alert("Error creating boiler");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal create-boiler-modal">
        <h2>Add Boiler</h2>

        <div className="building-info-banner">
          <p>
            <strong>Building:</strong> {buildingName}
          </p>
        </div>

        <label>
          Boiler name:
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Main Boiler"
            required
            autoFocus
          />
        </label>

        <label>
          Maximum power (kW):
          <input
            type="number"
            value={maxPower}
            onChange={(e) => setMaxPower(parseFloat(e.target.value) || 0)}
            min="0.1"
            step="0.1"
          />
        </label>

        <label>
          Efficiency (0-1, e.g. 0.95 = 95%):
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
          Current power (kW):
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
            {loading ? "Adding..." : "Add Boiler"}
          </button>
          <button
            onClick={onClose}
            className="btn-secondary"
            disabled={loading}
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default CreateBoilerModal;
