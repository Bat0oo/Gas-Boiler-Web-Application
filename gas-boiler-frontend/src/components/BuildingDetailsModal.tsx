import React, { useState, useEffect } from 'react';
import { BuildingDetail } from '../types/buildingtypes';
import { buildingService } from '../services/buildingService';
import './BuildingDetailsModal.css';

interface Props {
  isOpen: boolean;
  buildingId: number | null;
  token: string;
  onClose: () => void;
  onAddBoiler: (buildingId: number) => void;
  onEditBuilding: (buildingId: number) => void;
  onDeleteBuilding: (buildingId: number) => void;
  onEditBoiler: (boilerId: number) => void;
  onDeleteBoiler: (boilerId: number) => Promise<void>;
  isAdmin?: boolean;
}

const BuildingDetailsModal: React.FC<Props> = ({
  isOpen,
  buildingId,
  token,
  onClose,
  onAddBoiler,
  onEditBuilding,
  onDeleteBuilding,
  onEditBoiler,
  onDeleteBoiler,
  isAdmin = false,
}) => {
  const [building, setBuilding] = useState<BuildingDetail | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen && buildingId) {
      loadBuilding();
    }
  }, [isOpen, buildingId]);

  const loadBuilding = async () => {
    if (!buildingId) return;

    setLoading(true);
    try {
      const data = await buildingService.getBuildingById(buildingId, token);
      setBuilding(data);
    } catch (err) {
      console.error('Error loading building:', err);
      alert('Error loading building');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteBuilding = () => {
    if (window.confirm('Are you sure you want to delete this building? All boilers in this building will be deleted!')) {
      if (buildingId) {
        onDeleteBuilding(buildingId);
        onClose();
      }
    }
  };

  const handleDeleteBoiler = async (boilerId: number) => {
    if (window.confirm('Are you sure you want to delete this boiler?')) {
      try {
        await onDeleteBoiler(boilerId);
        await loadBuilding();
      } catch (err) {
        console.error('Error deleting boiler:', err);
        alert('Error deleting boiler');
      }
    }
  };

  if (!isOpen || !building) return null;

  return (
    <div className="modal-overlay">
      <div className="modal building-details-modal">
        {loading ? (
          <div className="loading-message">Loading...</div>
        ) : (
          <>
            <div className="building-details-header">
              <h2>🏢 {building.name}</h2>
              <button onClick={onClose} className="close-button">
                ✕
              </button>
            </div>

            {isAdmin && (
              <div className="admin-notice">
                ℹ️ Administrator mode - view only. You cannot create, edit, or delete.
              </div>
            )}

            <div className="building-info-box">
              <h3 className="section-label">Building: {building.name}</h3>
              <p>
                <strong>Location:</strong> {building.latitude.toFixed(6)}, {building.longitude.toFixed(6)}
              </p>
              <p>
                <strong>Heating area:</strong> {building.heatingArea} m²
              </p>
              <p>
                <strong>Desired temperature:</strong> {building.desiredTemperature}°C
              </p>
              <p>
                <strong>Number of boilers:</strong> {building.boilerCount}
              </p>
              {building.currentTemperature !== undefined && building.currentTemperature !== null && (
  <>
    <hr style={{ margin: '1rem 0', border: 'none', borderTop: '1px solid #e5e7eb' }} />
    <div className="weather-info">
      <p className="weather-main">
        <strong>🌡️ Outdoor temperature:</strong>
        <span className="temp-value">{building.currentTemperature.toFixed(1)}°C</span>
      </p>
      {building.weatherDescription && (
        <p className="weather-desc">
          <strong>Weather:</strong> {building.weatherDescription}
          {building.weatherIcon && (
            <img
              src={`https://openweathermap.org/img/wn/${building.weatherIcon}.png`}
              alt={building.weatherDescription}
              className="weather-icon"
            />
          )}
        </p>
      )}
      <p className="temp-diff">
        <strong>Temperature difference:</strong> {(building.desiredTemperature - (building.currentTemperature || 0)).toFixed(1)}°C
      </p>
    </div>
  </>
)}
            </div>

            <hr className="building-details-divider" />

            <h3 className="section-label">Boilers:</h3>

            {!isAdmin && (
              <div className="add-boiler-section">
                <button
                  onClick={() => onAddBoiler(building.id)}
                  className="btn-add-boiler"
                >
                  + Add Boiler
                </button>
              </div>
            )}

            {building.gasBoilers.length === 0 ? (
              <div className="no-boilers-message">
                {isAdmin
                  ? 'No boilers in this building.'
                  : 'No boilers in this building. Click "Add Boiler" to add the first one.'}
              </div>
            ) : (
              <div className="boilers-list">
                {building.gasBoilers.map((boiler) => (
                  <div key={boiler.id} className="boiler-card">
                    <div className="boiler-card-content">
                      <div className="boiler-info">
                        <h4>🔥 {boiler.name}</h4>
                        <div className="boiler-details">
                          <p>
                            <strong>Max power:</strong> {boiler.maxPower} kW
                          </p>
                          <p>
                            <strong>Current power:</strong> {boiler.currentPower} kW
                          </p>
                          <p>
                            <strong>Efficiency:</strong> {(boiler.efficiency * 100).toFixed(0)}%
                          </p>
                        </div>
                      </div>
                      <div className="boiler-actions">
                        {!isAdmin && (
                          <>
                            <button
                              onClick={() => onEditBoiler(boiler.id)}
                              className="boiler-edit-button"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => handleDeleteBoiler(boiler.id)}
                              className="boiler-delete-button"
                            >
                              Delete
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <hr className="building-details-divider" />

            <div className="building-action-buttons">
              {!isAdmin && (
                <>
                  <button
                    onClick={() => onEditBuilding(building.id)}
                    className="btn-edit-building"
                  >
                    Edit Building
                  </button>
                  <button
                    onClick={handleDeleteBuilding}
                    className="btn-delete-building"
                  >
                    Delete Building
                  </button>
                </>
              )}
              <button onClick={onClose} className="btn-close">
                Close
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default BuildingDetailsModal;