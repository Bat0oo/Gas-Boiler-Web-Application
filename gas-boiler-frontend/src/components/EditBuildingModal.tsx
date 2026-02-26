import React, { useState, useEffect } from "react";
import { Building, UpdateBuildingPayload } from "../types/buildingtypes";
import { buildingService } from "../services/buildingService";
import "./EditBuildingModal.css";

interface Props {
  isOpen: boolean;
  building: Building | null;
  token: string;
  onClose: () => void;
  onSuccess: (updatedBuilding: Building) => void;
}

const EditBuildingModal: React.FC<Props> = ({
  isOpen,
  building,
  token,
  onClose,
  onSuccess,
}) => {
  const [name, setName] = useState("");
  const [heatingArea, setHeatingArea] = useState(0);
  const [height, setHeight] = useState(2.7);
  const [desiredTemperature, setDesiredTemperature] = useState(22);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const calculatedVolume = heatingArea * height;

  useEffect(() => {
    if (isOpen && building) {
      setName(building.name);
      setHeatingArea(building.heatingArea);
      setHeight(building.height);
      setDesiredTemperature(building.desiredTemperature);
      setError("");
    }
  }, [isOpen, building]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!building) return;

    setLoading(true);
    setError("");

    try {
      const payload: UpdateBuildingPayload = {
        name: name.trim(),
        latitude: building.latitude,
        longitude: building.longitude,
        heatingArea,
        height,
        desiredTemperature,
        wallUValue: building.wallUValue,
        windowUValue: building.windowUValue,
        ceilingUValue: building.ceilingUValue,
        floorUValue: building.floorUValue,
        wallArea: building.wallArea,
        windowArea: building.windowArea,
        ceilingArea: building.ceilingArea,
        floorArea: building.floorArea,
      };

      const updated = await buildingService.updateBuilding(
        building.id,
        payload,
        token,
      );
      onSuccess(updated);
      onClose();
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to update building");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen || !building) return null;

  return (
    <div className="modal-overlay">
      <div className="modal edit-building-modal">
        <div className="modal-header">
          <h2>✏️ Edit Building</h2>
          <button onClick={onClose} className="close-button" disabled={loading}>
            ✕
          </button>
        </div>

        {error && <div className="error-message">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-section">
            <div className="form-group">
              <label>Building name:</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                disabled={loading}
                placeholder="e.g. My House"
              />
            </div>

            <div className="form-group">
              <label>Location:</label>
              <input
                type="text"
                value={`${building.latitude.toFixed(6)}, ${building.longitude.toFixed(6)}`}
                disabled
                className="readonly-input"
              />
              <span className="help-text">📍 Location cannot be changed</span>
            </div>

            <div className="form-group">
              <label>Heating area (m²):</label>
              <input
                type="number"
                value={heatingArea}
                onChange={(e) =>
                  setHeatingArea(parseFloat(e.target.value) || 0)
                }
                min="1"
                step="1"
                required
                disabled={loading}
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
                required
                disabled={loading}
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
                required
                disabled={loading}
              />
            </div>
          </div>

          <div className="modal-buttons">
            <button
              type="submit"
              className="btn-primary"
              disabled={loading || !name.trim()}
            >
              {loading ? "Saving..." : "Save Changes"}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="btn-secondary"
              disabled={loading}
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditBuildingModal;
