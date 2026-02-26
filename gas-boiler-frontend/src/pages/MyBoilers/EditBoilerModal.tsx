import React, { useState } from "react";
import {
  gasBoilerService,
  GasBoilerFullResponse,
} from "../../services/gasBoilerService";
import "./EditBoilerModal.css";

interface Props {
  boiler: GasBoilerFullResponse;
  onClose: () => void;
  onSave: (updatedBoiler: GasBoilerFullResponse) => void;
  onEditBuilding?: (buildingId: number) => void; // Optional callback to open building edit
  token: string;
}

const EditBoilerModal: React.FC<Props> = ({
  boiler,
  onClose,
  onSave,
  onEditBuilding,
  token,
}) => {
  const [formData, setFormData] = useState({
    name: boiler.name,
    maxPower: boiler.maxPower,
    efficiency: boiler.efficiency,
    currentPower: boiler.currentPower,
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const buildingName =
    boiler.buildingName || boiler.buildingObject?.name || "N/A";
  const buildingId = boiler.buildingObjectId || boiler.buildingObject?.id;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: parseFloat(value) || 0,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const payload = {
        name: formData.name,
        maxPower: formData.maxPower,
        efficiency: formData.efficiency,
        currentPower: formData.currentPower,
      };

      const updated = await gasBoilerService.updateGasBoiler(
        boiler.id,
        payload,
        token,
      );
      onSave(updated);
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to update boiler");
    } finally {
      setLoading(false);
    }
  };

  const handleEditBuilding = () => {
    if (onEditBuilding && buildingId) {
      onEditBuilding(buildingId);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>✏️ Edit Gas Boiler</h2>
          <button onClick={onClose} className="close-btn">
            &times;
          </button>
        </div>

        {error && <div className="error-message">{error}</div>}

        <form onSubmit={handleSubmit} className="edit-form">
          <div className="form-section">
            <h3>Basic Informations</h3>

            <div className="form-group">
              <label>Boiler Name</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, name: e.target.value }))
                }
                required
                disabled={loading}
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Maximum Power (kW)</label>
                <input
                  type="number"
                  name="maxPower"
                  value={formData.maxPower}
                  onChange={handleChange}
                  step="0.1"
                  min="0.1"
                  max="1000"
                  required
                  disabled={loading}
                />
              </div>

              <div className="form-group">
                <label>Efficiency (0-1)</label>
                <input
                  type="number"
                  name="efficiency"
                  value={formData.efficiency}
                  onChange={handleChange}
                  step="0.01"
                  min="0.01"
                  max="1"
                  required
                  disabled={loading}
                />
              </div>
            </div>

            <div className="form-group readonly-display">
              <label>Current Power (kW) - Display only</label>
              <input
                type="number"
                value={formData.currentPower}
                disabled
                className="readonly-input"
              />
              <span className="help-text">
                📊 Current operating power of the boiler (controlled by system)
              </span>
            </div>
          </div>

          <div className="form-section building-info-section">
            <h3>Building</h3>

            <div className="building-info-box">
              <div className="building-info-row">
                <label>Building Name:</label>
                <span className="building-name">🏢 {buildingName}</span>
              </div>

              <div className="info-notice">
                ℹ️ Other building properties (area, temperature, U-values) can
                be changed through "Edit Building" option
              </div>

              {onEditBuilding && buildingId && (
                <button
                  type="button"
                  onClick={handleEditBuilding}
                  className="btn-edit-building"
                  disabled={loading}
                >
                  📝 Edit Building
                </button>
              )}
            </div>
          </div>

          <div className="modal-actions">
            <button
              type="button"
              onClick={onClose}
              className="btn-secondary"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn-primary"
              disabled={loading || !formData.name.trim()}
            >
              {loading ? "Saving..." : "Save"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditBoilerModal;
