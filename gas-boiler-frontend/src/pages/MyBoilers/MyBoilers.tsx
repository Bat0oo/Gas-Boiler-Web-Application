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
  
  // ========== ADDED: Banner visibility state ==========
  const [showBanner, setShowBanner] = useState(true);

  useEffect(() => {
    loadBoilers();
  }, []);

  // ========== ADDED: Auto-hide banner after 5 seconds ==========
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
      alert('Administratori ne mogu menjati kotlove. Samo možete pregledati.');
      return;
    }
    setEditingBoiler(boiler);
  };

  const handleDelete = async (id: number) => {
    if (!user?.token) return;
    
    if (isAdmin) {
      alert('Administratori ne mogu brisati kotlove. Samo možete pregledati.');
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
    return <div className="loading">Učitavanje...</div>;
  }

  return (
    <>
      <Navbar />
      
      {/* ========== CHANGED: Sticky banner below navbar with dismiss button ========== */}
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
      {/* ============================================================================= */}
      
      <div className="my-boilers-page">
        <div className="page-header">
          {filterUsername ? (
            <>
              <h1>🔥 Kotlovi korisnika: {filterUsername}</h1>
              <p>Pregled svih kotlova korisnika {filterUsername}</p>
            </>
          ) : (
            <>
              <h1>{isAdmin ? '🔥 Svi Kotlovi' : 'Moji Kotlovi'}</h1>
              <p>{isAdmin ? 'Pregled svih kotlova svih korisnika' : 'Upravljajte svojim gasnim kotlovima'}</p>
            </>
          )}
        </div>

        {filterUsername && (
          <div className="filter-info-box">
            <span className="filter-text">
              📊 Prikazano: <strong>{filteredBoilers.length}</strong> {filteredBoilers.length === 1 ? 'kotao' : 'kotlova'}
            </span>
            <button onClick={handleClearFilter} className="btn-clear-filter">
              ✕ Ukloni filter
            </button>
          </div>
        )}

        {error && <div className="error-message">{error}</div>}

        {filteredBoilers.length === 0 ? (
          <div className="no-data">
            {filterUsername ? (
              <p>Korisnik "{filterUsername}" nema kotlova.</p>
            ) : (
              <>
                <p>Nemate kreiranih kotlova.</p>
                <p>Kreirajte novi kotao klikom desnim tasterom miša na mapu.</p>
              </>
            )}
          </div>
        ) : (
          <div className="table-container">
            <table className="boilers-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Naziv</th>
                  <th>Naziv Objekta</th>
                  <th>Maks. Snaga (kW)</th>
                  <th>Efikasnost</th>
                  <th>Trenutna Snaga (kW)</th>
                  <th>Lokacija</th>
                  <th>Površina (m²)</th>
                  <th>Željena Temp. (°C)</th>
                  <th>Kreiran</th>
                  <th>Akcije</th>
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
                              title="Izmeni"
                            >
                              ✏️
                            </button>
                            {deleteConfirm === boiler.id ? (
                              <div className="delete-confirm">
                                <button
                                  onClick={() => handleDelete(boiler.id)}
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
                                onClick={() => setDeleteConfirm(boiler.id)}
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