import React, { useEffect, useState } from 'react';
import Navbar from '../../components/Navbar';
import apiClient from '../../services/apiService';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import './UsersPage.css';

interface User {
  id: number;
  username: string;
  email: string;
  role: string;
  createdAt: string;
  gasBoilersCount: number;
  isBlocked: boolean;
}

const UsersList: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [processingUserId, setProcessingUserId] = useState<number | null>(null);

  const loadUsers = async () => {
    if (!user || user.role !== 'Admin') return;

    try {
      const response = await apiClient.get('/user');
      console.log('✅ Loaded users:', response.data);
      setUsers(response.data);
      setError('');
    } catch (err: any) {
      console.error('❌ Error loading users:', err);
      setError('Greška prilikom učitavanja korisnika.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, [user]);

  const handleBlockToggle = async (id: number, currentIsBlocked: boolean) => {
    console.log(`🔄 Toggling block for user ${id}, current: ${currentIsBlocked ? 'Blokiran' : 'Aktivan'}`);
    
    setProcessingUserId(id);
    
    try {
      const endpoint = currentIsBlocked ? `/user/${id}/unblock` : `/user/${id}/block`;
      console.log(`📡 POST ${endpoint}`);
      
      const response = await apiClient.post(endpoint);
      console.log('✅ API success:', response.data);
      
      // ========== METHOD 1: Immediate optimistic update ==========
      console.log('🔄 Method 1: Immediate optimistic update');
      setUsers(prevUsers => {
        const updated = prevUsers.map(u => 
          u.id === id ? { ...u, isBlocked: !currentIsBlocked } : u
        );
        console.log('📊 Updated users state:', updated.find(u => u.id === id));
        return updated;
      });
      
      // ========== METHOD 2: Reload from server (after 500ms) ==========
      console.log('🔄 Method 2: Reloading from server in 500ms...');
      setTimeout(async () => {
        try {
          const freshResponse = await apiClient.get('/user');
          console.log('✅ Fresh data:', freshResponse.data);
          setUsers(freshResponse.data);
          console.log('✅ State updated from server');
        } catch (err) {
          console.error('❌ Failed to reload:', err);
        }
      }, 500);
      
      console.log('✅ Block toggle complete!');
    } catch (err: any) {
      console.error('❌ Block toggle failed:', err);
      console.error('❌ Response:', err.response?.data);
      alert(`Greška: ${err.response?.data?.message || 'Nepoznata greška'}`);
    } finally {
      setProcessingUserId(null);
    }
  };

  const handleViewBuildings = (userId: number, username: string) => {
    navigate(`/buildings?userId=${userId}&username=${username}`);
  };

  const handleViewBoilers = (userId: number, username: string) => {
    navigate(`/my-boilers?userId=${userId}&username=${username}`);
  };

  const filteredUsers = users.filter((u) => {
    const search = searchTerm.toLowerCase();
    return (
      u.username.toLowerCase().includes(search) ||
      u.email.toLowerCase().includes(search) ||
      u.role.toLowerCase().includes(search)
    );
  });

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="userslist-container">
          <div className="loading">⏳ Učitavanje korisnika...</div>
        </div>
      </>
    );
  }

  if (error) {
    return (
      <>
        <Navbar />
        <div className="userslist-container">
          <div className="error">❌ {error}</div>
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className="userslist-container">
        <div className="userslist-card">
          <h2>👥 Spisak korisnika</h2>
          <p className="subtitle">
            Ukupno korisnika: <strong>{users.length}</strong>
          </p>

          <div className="search-bar">
            <input
              type="text"
              placeholder="🔍 Pretraži korisnike (ime, email, uloga)..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="clear-search-btn"
                title="Obriši pretragu"
              >
                ✕
              </button>
            )}
          </div>

          {filteredUsers.length === 0 ? (
            <div className="no-users">
              {searchTerm
                ? `Nema korisnika koji odgovaraju pretrazi "${searchTerm}"`
                : 'Nema registrovanih korisnika.'}
            </div>
          ) : (
            <>
              {searchTerm && (
                <p className="search-results">
                  Pronađeno: <strong>{filteredUsers.length}</strong> korisnika
                </p>
              )}
              
              <div className="table-container">
                <table>
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Korisničko ime</th>
                      <th>Email</th>
                      <th>Uloga</th>
                      <th>Broj kotlova</th>
                      <th>Status</th>
                      <th>Akcije</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredUsers.map((u) => (
                      <tr key={u.id}>
                        <td>{u.id}</td>
                        <td className="username">{u.username}</td>
                        <td className="email">{u.email}</td>
                        <td>
                          <span className={`role-badge ${u.role.toLowerCase()}`}>
                            {u.role}
                          </span>
                        </td>
                        <td>
                          <span className="boiler-count">{u.gasBoilersCount}</span>
                        </td>
                        <td>
                          {/* Show both the badge AND the raw value for debugging */}
                          <span
                            className={u.isBlocked ? 'status blocked' : 'status active'}
                            title={`DEBUG: isBlocked = ${u.isBlocked}`}
                          >
                            {u.isBlocked ? 'Blokiran' : 'Aktivan'}
                          </span>
                        </td>
                        <td>
                          <div className="actions">
                            <button
                              onClick={() => handleViewBuildings(u.id, u.username)}
                              className="btn-action btn-buildings"
                              title="Vidi zgrade korisnika"
                            >
                              🏢 Zgrade
                            </button>
                            <button
                              onClick={() => handleViewBoilers(u.id, u.username)}
                              className="btn-action btn-boilers"
                              title="Vidi kotlove korisnika"
                            >
                              🔥 Kotlovi
                            </button>
                            <button
                              onClick={() => handleBlockToggle(u.id, u.isBlocked)}
                              className={u.isBlocked ? 'btn-action btn-unblock' : 'btn-action btn-block'}
                              title={u.isBlocked ? 'Odblokiraj korisnika' : 'Blokiraj korisnika'}
                              disabled={processingUserId === u.id}
                            >
                              {processingUserId === u.id ? (
                                '⏳ Učitavanje...'
                              ) : u.isBlocked ? (
                                '✓ Odblokiraj'
                              ) : (
                                '🚫 Blokiraj'
                              )}
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
};

export default UsersList;