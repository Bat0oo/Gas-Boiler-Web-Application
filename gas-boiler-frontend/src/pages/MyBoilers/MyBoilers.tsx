import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { gasBoilerService, GasBoilerFullResponse } from '../../services/gasBoilerService';
import EditBoilerModal from './EditBoilerModal';
import './MyBoilers.css';
import Navbar from '../../components/Navbar';

const MyBoilersPage: React.FC = () => {
  const { user } = useAuth();
  const [boilers, setBoilers] = useState<GasBoilerFullResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editingBoiler, setEditingBoiler] = useState<GasBoilerFullResponse | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null);

  useEffect(() => {
    loadBoilers();
  }, []);

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

  const handleEdit = (boiler: GasBoilerFullResponse) => {
    setEditingBoiler(boiler);
  };

  const handleDelete = async (id: number) => {
    if (!user?.token) return;
    
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

  if (loading) {
    return <div className="loading">Učitavanje...</div>;
  }

  return (
    <>
    <Navbar />
    <div className="my-boilers-page">
      <div className="page-header">
        <h1>Moji Kotlovi</h1>
        <p>Upravljajte svojim gasnim kotlovima</p>
      </div>

      {error && <div className="error-message">{error}</div>}

      {boilers.length === 0 ? (
        <div className="no-data">
          <p>Nemate kreiranih kotlova.</p>
          <p>Kreirajte novi kotao klikom desnim tasterom miša na mapu.</p>
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
              {boilers.map((boiler) => (
                <tr key={boiler.id}>
                  <td>{boiler.id}</td>
                  <td>{boiler.name}</td>
                  <td>{boiler.buildingObject?.name ?? 'N/A'}</td>
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