// components/BuildingDetailsModal.tsx
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
  onDeleteBoiler: (boilerId: number) => void;
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
      console.error('Greška prilikom učitavanja zgrade:', err);
      alert('Greška prilikom učitavanja zgrade');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteBuilding = () => {
    if (window.confirm('Da li ste sigurni da želite da obrišete ovu zgradu? Svi kotlovi u zgradi će biti obrisani!')) {
      if (buildingId) {
        onDeleteBuilding(buildingId);
        onClose();
      }
    }
  };

  const handleDeleteBoiler = (boilerId: number) => {
    if (window.confirm('Da li ste sigurni da želite da obrišete ovaj kotao?')) {
      onDeleteBoiler(boilerId);
      loadBuilding(); // Refresh after delete
    }
  };

  if (!isOpen || !building) return null;

  return (
    <div className="modal-overlay">
      <div className="modal building-details-modal">
        {loading ? (
          <div className="loading-message">Učitavanje...</div>
        ) : (
          <>
            <div className="building-details-header">
              <h2>🏢 {building.name}</h2>
              <button onClick={onClose} className="close-button">
                ✕
              </button>
            </div>

            <div className="building-info-box">
              <p>
                <strong>Lokacija:</strong> {building.latitude.toFixed(6)}, {building.longitude.toFixed(6)}
              </p>
              <p>
                <strong>Površina grejanja:</strong> {building.heatingArea} m²
              </p>
              <p>
                <strong>Željena temperatura:</strong> {building.desiredTemperature}°C
              </p>
              <p>
                <strong>Broj kotlova:</strong> {building.boilerCount}
              </p>
            </div>

            <hr className="building-details-divider" />

            <div className="boilers-section-header">
              <h3>Kotlovi ({building.gasBoilers.length})</h3>
              <button
                onClick={() => onAddBoiler(building.id)}
                className="btn-primary add-boiler-button"
              >
                + Dodaj Kotao
              </button>
            </div>

            {building.gasBoilers.length === 0 ? (
              <div className="no-boilers-message">
                Nema kotlova u ovoj zgradi. Kliknite "Dodaj Kotao" da dodate prvi.
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
                            <strong>Maks. snaga:</strong> {boiler.maxPower} kW
                          </p>
                          <p>
                            <strong>Trenutna snaga:</strong> {boiler.currentPower} kW
                          </p>
                          <p>
                            <strong>Efikasnost:</strong> {(boiler.efficiency * 100).toFixed(0)}%
                          </p>
                        </div>
                      </div>
                      <div className="boiler-actions">
                        <button
                          onClick={() => onEditBoiler(boiler.id)}
                          className="boiler-edit-button"
                        >
                          Izmeni
                        </button>
                        <button
                          onClick={() => handleDeleteBoiler(boiler.id)}
                          className="boiler-delete-button"
                        >
                          Obriši
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <hr className="building-details-divider" />

            <div className="building-action-buttons">
              <button
                onClick={() => onEditBuilding(building.id)}
                className="btn-edit-building"
              >
                Izmeni Zgradu
              </button>
              <button
                onClick={handleDeleteBuilding}
                className="btn-delete-building"
              >
                Obriši Zgradu
              </button>
              <button onClick={onClose} className="btn-secondary">
                Zatvori
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default BuildingDetailsModal;