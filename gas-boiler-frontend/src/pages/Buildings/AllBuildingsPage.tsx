import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { buildingService } from '../../services/buildingService';
import { Building } from '../../types/buildingtypes';
import Navbar from '../../components/Navbar';
import EditBuildingModal from '../../components/EditBuildingModal';
import './AllBuildingsPage.css';

const AllBuildingsPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const isAdmin = user?.role === 'Admin';
  const filterUserId = searchParams.get('userId');
  const filterUsername = searchParams.get('username');
  
  const [buildings, setBuildings] = useState<Building[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null);
  const [editingBuilding, setEditingBuilding] = useState<Building | null>(null);
  
  // ========== ADDED: Banner visibility state ==========
  const [showBanner, setShowBanner] = useState(true);

  useEffect(() => {
    loadBuildings();
  }, []);

  // ========== ADDED: Auto-hide banner after 5 seconds ==========
  useEffect(() => {
    if (isAdmin && !filterUserId && showBanner) {
      const timer = setTimeout(() => {
        setShowBanner(false);
      }, 5000); // Hide after 5 seconds

      return () => clearTimeout(timer);
    }
  }, [isAdmin, filterUserId, showBanner]);
  // ===========================================================

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

  const filteredBuildings = filterUserId
    ? buildings.filter(b => b.userId === parseInt(filterUserId))
    : buildings;

  const handleViewDetails = (buildingId: number) => {
    navigate(`/map?building=${buildingId}`);
  };

  const handleEdit = (buildingId: number) => {
    if (isAdmin) {
      alert('Administratori ne mogu menjati zgrade. Samo možete pregledati.');
      return;
    }
    
    const building = buildings.find(b => b.id === buildingId);
    if (building) {
      setEditingBuilding(building);
    }
  };

  const handleBuildingUpdated = (updatedBuilding: Building) => {
    setBuildings(buildings.map(b => 
      b.id === updatedBuilding.id ? updatedBuilding : b
    ));
    setEditingBuilding(null);
  };

  const handleDelete = async (id: number) => {
    if (!user?.token) return;
    
    if (isAdmin) {
      alert('Administratori ne mogu brisati zgrade. Samo možete pregledati.');
      return;
    }
    
    try {
      await buildingService.deleteBuilding(id, user.token);
      setBuildings(buildings.filter(b => b.id !== id));
      setDeleteConfirm(null);
      setError('');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to delete building');
    }
  };

  const handleClearFilter = () => {
    navigate('/buildings');
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
      
      {/* ========== CHANGED: Admin banner with dismiss button and auto-hide ========== */}
      {isAdmin && !filterUserId && showBanner && (
        <div className="admin-mode-banner-sticky">
          <span>🛡️ Administrator Režim - Samo Pregled (ne možete kreirati, menjati ili brisati)</span>
          <button 
            onClick={() => setShowBanner(false)} 
            className="banner-dismiss"
            title="Zatvori"
          >
            ✕
          </button>
        </div>
      )}
      {/* ============================================================================== */}
      
      <div className="all-buildings-page">
        <div className="page-header">
          {filterUsername ? (
            <>
              <h1>🏢 Zgrade korisnika: {filterUsername}</h1>
              <p>Pregled svih zgrada korisnika {filterUsername}</p>
            </>
          ) : (
            <>
              <h1>🏢 {isAdmin ? 'Sve Zgrade' : 'Sve Zgrade'}</h1>
              <p>{isAdmin ? 'Pregledajte sve zgrade svih korisnika' : 'Pregledajte i upravljajte svojim zgradama'}</p>
            </>
          )}
        </div>

        {filterUsername && (
          <div className="filter-info-box">
            <span className="filter-text">
              📊 Prikazano: <strong>{filteredBuildings.length}</strong> {filteredBuildings.length === 1 ? 'zgrada' : 'zgrada'}
            </span>
            <button onClick={handleClearFilter} className="btn-clear-filter">
              ✕ Ukloni filter
            </button>
          </div>
        )}

        {error && <div className="error-message">{error}</div>}

        {filteredBuildings.length === 0 ? (
          <div className="no-data">
            {filterUsername ? (
              <p>Korisnik "{filterUsername}" nema zgrada.</p>
            ) : (
              <>
                <p>Nemate kreiranih zgrada.</p>
                <p>Kreirajte novu zgradu klikom desnim tasterom miša na mapu.</p>
              </>
            )}
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
                {filteredBuildings.map((building) => (
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
                        {!isAdmin && (
                          <>
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
                          </>
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