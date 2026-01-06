import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { buildingService } from '../../services/buildingService';
import { Building } from '../../types/buildingtypes';
import Navbar from '../../components/Navbar';
import EditBuildingModal from '../../components/EditBuildingModal';
import './AllBuildingsPage.css';

const AllBuildingsPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [buildings, setBuildings] = useState<Building[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null);
  const [editingBuilding, setEditingBuilding] = useState<Building | null>(null);

  useEffect(() => {
    loadBuildings();
  }, []);

  const loadBuildings = async () => {
    if (!user?.token) return;
    
    setLoading(true);
    try {
      const data = await buildingService.getAllBuildings(user.token);
      setBuildings(data);
      setError('');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load buildings');
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetails = (buildingId: number) => {
    // Navigate to map with building selected
    navigate(`/map?building=${buildingId}`);
  };

  const handleEdit = (buildingId: number) => {
    const building = buildings.find(b => b.id === buildingId);
    if (building) {
      setEditingBuilding(building);
    }
  };

  const handleBuildingUpdated = (updatedBuilding: Building) => {
    // Update buildings list
    setBuildings(buildings.map(b => 
      b.id === updatedBuilding.id ? updatedBuilding : b
    ));
    
    // Close modal
    setEditingBuilding(null);
  };

  const handleDelete = async (id: number) => {
    if (!user?.token) return;
    
    try {
      await buildingService.deleteBuilding(id, user.token);
      setBuildings(buildings.filter(b => b.id !== id));
      setDeleteConfirm(null);
      setError('');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to delete building');
    }
  };

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="loading">Učitavanje...</div>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className="all-buildings-page">
        <div className="page-header">
          <h1>🏢 Sve Zgrade</h1>
          <p>Pregledajte i upravljajte svojim zgradama</p>
        </div>

        {error && <div className="error-message">{error}</div>}

        {buildings.length === 0 ? (
          <div className="no-data">
            <p>Nemate kreiranih zgrada.</p>
            <p>Kreirajte novu zgradu klikom desnim tasterom miša na mapu.</p>
          </div>
        ) : (
          <div className="table-container">
            <table className="buildings-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Naziv</th>
                  <th>Lokacija</th>
                  <th>Površina (m²)</th>
                  <th>Visina (m)</th>
                  <th>Zapremina (m³)</th>
                  <th>Željena Temp. (°C)</th>
                  <th>Broj Kotlova</th>
                  <th>Akcije</th>
                </tr>
              </thead>
              <tbody>
                {buildings.map((building) => (
                  <tr key={building.id}>
                    <td>{building.id}</td>
                    <td className="building-name">{building.name}</td>
                    <td className="location">
                      {building.latitude.toFixed(4)}, {building.longitude.toFixed(4)}
                    </td>
                    <td>{building.heatingArea.toFixed(0)}</td>
                    <td>{building.height.toFixed(1)}</td>
                    <td className="volume">{building.volume.toFixed(1)}</td>
                    <td>{building.desiredTemperature.toFixed(1)}</td>
                    <td className="boiler-count">
                      {building.boilerCount > 0 ? (
                        <span className="has-boilers">{building.boilerCount}</span>
                      ) : (
                        <span className="no-boilers">0</span>
                      )}
                    </td>
                    <td className="actions">
                      <div className="actions-wrapper">
                        <button
                          onClick={() => handleViewDetails(building.id)}
                          className="btn-view"
                          title="Pogledaj detalje"
                        >
                          👁️
                        </button>
                        <button
                          onClick={() => handleEdit(building.id)}
                          className="btn-edit"
                          title="Izmeni"
                        >
                          ✏️
                        </button>
                        {deleteConfirm === building.id ? (
                          <div className="delete-confirm">
                            <button
                              onClick={() => handleDelete(building.id)}
                              className="btn-confirm-delete"
                              title="Potvrdi brisanje"
                            >
                              ✓
                            </button>
                            <button
                              onClick={() => setDeleteConfirm(null)}
                              className="btn-cancel-delete"
                              title="Otkaži"
                            >
                              ✗
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => setDeleteConfirm(building.id)}
                            className="btn-delete"
                            title="Obriši"
                          >
                            🗑️
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <div className="page-footer">
          <p className="info-text">
            💡 Kliknite na 👁️ da vidite detalje zgrade na mapi
          </p>
        </div>
      </div>

      <EditBuildingModal
        isOpen={editingBuilding !== null}
        building={editingBuilding}
        token={user?.token || ''}
        onClose={() => setEditingBuilding(null)}
        onSuccess={handleBuildingUpdated}
      />
    </>
  );
};

export default AllBuildingsPage;