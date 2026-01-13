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

  const [showBanner, setShowBanner] = useState(true);

  useEffect(() => {
    loadBuildings();
  }, []);

  useEffect(() => {
    if (isAdmin && !filterUserId && showBanner) {
      const timer = setTimeout(() => {
        setShowBanner(false);
      }, 5000);

      return () => clearTimeout(timer);
    }
  }, [isAdmin, filterUserId, showBanner]);

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
      alert('Administrators cannot edit buildings. You can only view.');
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
      alert('Administrators cannot delete buildings. You can only view.');
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
        <div className="loading">Loading...</div>
      </>
    );
  }

  return (
    <>
      <Navbar />

      {isAdmin && !filterUserId && showBanner && (
        <div className="admin-mode-banner-sticky">
          <span>🛡️ Administrator Mode - View Only (you cannot create, edit, or delete)</span>
          <button
            onClick={() => setShowBanner(false)}
            className="banner-dismiss"
            title="Close"
          >
            ✕
          </button>
        </div>
      )}

      <div className="all-buildings-page">
        <div className="page-header">
          {filterUsername ? (
            <>
              <h1>🏢 Buildings of user: {filterUsername}</h1>
              <p>View all buildings of user {filterUsername}</p>
            </>
          ) : (
            <>
              <h1>🏢 {isAdmin ? 'All Buildings' : 'All Buildings'}</h1>
              <p>{isAdmin ? 'View all buildings of all users' : 'View and manage your buildings'}</p>
            </>
          )}
        </div>

        {filterUsername && (
          <div className="filter-info-box">
            <span className="filter-text">
              📊 Showing: <strong>{filteredBuildings.length}</strong> {filteredBuildings.length === 1 ? 'building' : 'buildings'}
            </span>
            <button onClick={handleClearFilter} className="btn-clear-filter">
              ✕ Remove filter
            </button>
          </div>
        )}

        {error && <div className="error-message">{error}</div>}

        {filteredBuildings.length === 0 ? (
          <div className="no-data">
            {filterUsername ? (
              <p>User "{filterUsername}" has no buildings.</p>
            ) : (
              <>
                <p>You have no buildings created.</p>
                <p>Create a new building by right-clicking on the map.</p>
              </>
            )}
          </div>
        ) : (
          <div className="table-container">
            <table className="buildings-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Name</th>
                  <th>Location</th>
                  <th>Area (m²)</th>
                  <th>Height (m)</th>
                  <th>Volume (m³)</th>
                  <th>Desired Temp. (°C)</th>
                  <th>Number of Boilers</th>
                  <th>Actions</th>
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
                          title="View details"
                        >
                          👁️
                        </button>
                        {!isAdmin && (
                          <>
                            <button
                              onClick={() => handleEdit(building.id)}
                              className="btn-edit"
                              title="Edit"
                            >
                              ✏️
                            </button>
                            {deleteConfirm === building.id ? (
                              <div className="delete-confirm">
                                <button
                                  onClick={() => handleDelete(building.id)}
                                  className="btn-confirm-delete"
                                  title="Confirm deletion"
                                >
                                  ✓
                                </button>
                                <button
                                  onClick={() => setDeleteConfirm(null)}
                                  className="btn-cancel-delete"
                                  title="Cancel"
                                >
                                  ✗
                                </button>
                              </div>
                            ) : (
                              <button
                                onClick={() => setDeleteConfirm(building.id)}
                                className="btn-delete"
                                title="Delete"
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
            💡 Click on 👁️ to view building details on the map
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