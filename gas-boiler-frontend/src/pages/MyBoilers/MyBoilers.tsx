import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { gasBoilerService, GasBoilerFullResponse } from '../../services/gasBoilerService';
import EditBoilerModal from './EditBoilerModal';
import './MyBoilers.css';
import Navbar from '../../components/Navbar';

const MyBoilersPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const isAdmin = user?.role === 'Admin';
  const filterUserId = searchParams.get('userId');
  const filterUsername = searchParams.get('username');
  
  const [boilers, setBoilers] = useState<GasBoilerFullResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editingBoiler, setEditingBoiler] = useState<GasBoilerFullResponse | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null);

  const [showBanner, setShowBanner] = useState(true);

  useEffect(() => {
    loadBoilers();
  }, []);

  useEffect(() => {
    if (isAdmin && !filterUserId && showBanner) {
      const timer = setTimeout(() => {
        setShowBanner(false);
      }, 5000);

      return () => clearTimeout(timer);
    }
  }, [isAdmin, filterUserId, showBanner]);

  const loadBoilers = async () => {
    if (!user?.token) return;
    
    setLoading(true);
    try {
      const data = await gasBoilerService.getAllBoilers(user.token);
      setBoilers(data);
      setError('');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load boilers');
    } finally {
      setLoading(false);
    }
  };

  const filteredBoilers = filterUserId
    ? boilers.filter(b => b.userId === parseInt(filterUserId))
    : boilers;

  const handleEdit = (boiler: GasBoilerFullResponse) => {
    if (isAdmin) {
      alert('Administrators cannot edit boilers. You can only view.');
      return;
    }
    setEditingBoiler(boiler);
  };

  const handleDelete = async (id: number) => {
    if (!user?.token) return;

    if (isAdmin) {
      alert('Administrators cannot delete boilers. You can only view.');
      return;
    }

    try {
      await gasBoilerService.deleteGasBoiler(id, user.token);
      setBoilers(boilers.filter(b => b.id !== id));
      setDeleteConfirm(null);
      setError('');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to delete boiler');
    }
  };

  const handleSaveEdit = async (updatedBoiler: GasBoilerFullResponse) => {
    setBoilers(boilers.map(b => b.id === updatedBoiler.id ? updatedBoiler : b));
    setEditingBoiler(null);
  };

  const handleClearFilter = () => {
    navigate('/my-boilers');
  };

  if (loading) {
    return <div className="loading">Loading...</div>;
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

      <div className="my-boilers-page">
        <div className="page-header">
          {filterUsername ? (
            <>
              <h1>🔥 Boilers of user: {filterUsername}</h1>
              <p>View all boilers of user {filterUsername}</p>
            </>
          ) : (
            <>
              <h1>{isAdmin ? '🔥 All Boilers' : 'My Boilers'}</h1>
              <p>{isAdmin ? 'View all boilers of all users' : 'Manage your gas boilers'}</p>
            </>
          )}
        </div>

        {filterUsername && (
          <div className="filter-info-box">
            <span className="filter-text">
              📊 Showing: <strong>{filteredBoilers.length}</strong> {filteredBoilers.length === 1 ? 'boiler' : 'boilers'}
            </span>
            <button onClick={handleClearFilter} className="btn-clear-filter">
              ✕ Remove filter
            </button>
          </div>
        )}

        {error && <div className="error-message">{error}</div>}

        {filteredBoilers.length === 0 ? (
          <div className="no-data">
            {filterUsername ? (
              <p>User "{filterUsername}" has no boilers.</p>
            ) : (
              <>
                <p>You have no boilers created.</p>
                <p>Create a new boiler by right-clicking on the map.</p>
              </>
            )}
          </div>
        ) : (
          <div className="table-container">
            <table className="boilers-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Name</th>
                  <th>Building Name</th>
                  <th>Max. Power (kW)</th>
                  <th>Efficiency</th>
                  <th>Current Power (kW)</th>
                  <th>Location</th>
                  <th>Area (m²)</th>
                  <th>Desired Temp. (°C)</th>
                  <th>Created</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredBoilers.map((boiler) => (
                  <tr key={boiler.id}>
                    <td>{boiler.id}</td>
                    <td>{boiler.name}</td>
                    <td>{boiler.buildingName || 'N/A'}</td>
                    <td>{boiler.maxPower.toFixed(2)}</td>
                    <td>{(boiler.efficiency * 100).toFixed(0)}%</td>
                    <td className="current-power">{boiler.currentPower.toFixed(2)}</td>
                    <td className="location">
                      {boiler.buildingObject ? (
                        <>
                          {boiler.buildingObject.latitude.toFixed(4)}, {boiler.buildingObject.longitude.toFixed(4)}
                        </>
                      ) : (
                        'N/A'
                      )}
                    </td>
                    <td>{boiler.buildingObject?.heatingArea.toFixed(0) ?? 'N/A'}</td>
                    <td>{boiler.buildingObject?.desiredTemperature.toFixed(1) ?? 'N/A'}</td>
                    <td>{new Date(boiler.createdAt).toLocaleDateString('sr-RS')}</td>
                    <td className="actions">
                      <div className="actions-wrapper">
                        {!isAdmin && (
                          <>
                            <button
                              onClick={() => handleEdit(boiler)}
                              className="btn-edit"
                              title="Edit"
                            >
                              ✏️
                            </button>
                            {deleteConfirm === boiler.id ? (
                              <div className="delete-confirm">
                                <button
                                  onClick={() => handleDelete(boiler.id)}
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
                                onClick={() => setDeleteConfirm(boiler.id)}
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

        {editingBoiler && (
          <EditBoilerModal
            boiler={editingBoiler}
            onClose={() => setEditingBoiler(null)}
            onSave={handleSaveEdit}
            token={user?.token || ''}
          />
        )}
      </div>
    </>
  );
};

export default MyBoilersPage;