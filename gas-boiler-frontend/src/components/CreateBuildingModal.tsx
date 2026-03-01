import React, { useState } from "react";
import { CreateBuildingPayload } from "../types/buildingtypes";
import "./CreateBuildingModal.css";

interface Props {
  isOpen: boolean;
  position: { lat: number; lng: number } | null;
  onClose: () => void;
  onCreate: (building: CreateBuildingPayload) => Promise<void>;
}

const CreateBuildingModal: React.FC<Props> = ({
  isOpen,
  position,
  onClose,
  onCreate,
}) => {
  const [name, setName] = useState("");
  const [heatingArea, setHeatingArea] = useState(100);
  const [height, setHeight] = useState(2.7);
  const [desiredTemperature, setDesiredTemperature] = useState(22);
  const [loading, setLoading] = useState(false);

  // Calculated volume for display
  const calculatedVolume = heatingArea * height;

  const handleSubmit = async () => {
    if (!position || !name.trim()) {
      alert("Enter building name");
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

      setName("");
      setHeatingArea(100);
      setHeight(2.7);
      setDesiredTemperature(22);
      onClose();
    } catch (err) {
      console.error("Error creating building:", err);
      alert("Error creating building");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal create-building-modal">
        <h2>🏢 Create Building</h2>

        <div className="form-group">
          <label>Building name:</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. My House"
            required
          />
        </div>

        <div className="form-group">
          <label>Location:</label>
          <input
            type="text"
            value={
              position
                ? `${position.lat.toFixed(6)}, ${position.lng.toFixed(6)}`
                : ""
            }
            disabled
          />
        </div>

        <div className="form-group">
          <label>Heating area (m²):</label>
          <input
            type="number"
            value={heatingArea}
            onChange={(e) => setHeatingArea(parseFloat(e.target.value) || 0)}
            min="1"
            step="1"
          />
        </div>

        <div className="form-group">
          <label>Ceiling height (m):</label>
          <input
            type="number"
            step="0.1"
            value={height}
            onChange={(e) => setHeight(parseFloat(e.target.value) || 0)}
            min="0.1"
            max="10"
          />
          <span className="calculated-info">
            📦 Volume: {calculatedVolume.toFixed(1)} m³
          </span>
        </div>

        <div className="form-group">
          <label>Desired temperature (°C):</label>
          <input
            type="number"
            value={desiredTemperature}
            onChange={(e) =>
              setDesiredTemperature(parseFloat(e.target.value) || 0)
            }
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
            {loading ? "Creating..." : "Create"}
          </button>
          <button
            onClick={onClose}
            className="btn-secondary"
            disabled={loading}
          >
            Cancel
          </button>
        </div>

        <div className="info-note">
          ℹ️ Thermal properties and areas will be automatically calculated based
          on standard values.
        </div>
      </div>
    </div>
  );
};

export default CreateBuildingModal;
