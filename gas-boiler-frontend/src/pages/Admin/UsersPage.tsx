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
      setUsers(response.data);
      setError('');
    } catch (err: any) {
      console.error('❌ Error loading users:', err);
      setError('Error loading users.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, [user]);

  const handleBlockToggle = async (id: number, currentIsBlocked: boolean) => {
    setProcessingUserId(id);

    try {
      const endpoint = currentIsBlocked ? `/user/${id}/unblock` : `/user/${id}/block`;

      await apiClient.post(endpoint);

      setUsers(prevUsers =>
        prevUsers.map(u => u.id === id ? { ...u, isBlocked: !currentIsBlocked } : u)
      );

      setTimeout(async () => {
        try {
          const freshResponse = await apiClient.get('/user');
          setUsers(freshResponse.data);
        } catch (err) {
          console.error('Failed to reload users:', err);
        }
      }, 500);
    } catch (err: any) {
      console.error('Block toggle failed:', err);
      alert(`Error: ${err.response?.data?.message || 'Unknown error'}`);
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
          <div className="loading">⏳ Loading users...</div>
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
          <h2>👥 User List</h2>
          <p className="subtitle">
            Total users: <strong>{users.length}</strong>
          </p>

          <div className="search-bar">
            <input
              type="text"
              placeholder="🔍 Search users (name, email, role)..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="clear-search-btn"
                title="Clear search"
              >
                ✕
              </button>
            )}
          </div>

          {filteredUsers.length === 0 ? (
            <div className="no-users">
              {searchTerm
                ? `No users matching search "${searchTerm}"`
                : 'No registered users.'}
            </div>
          ) : (
            <>
              {searchTerm && (
                <p className="search-results">
                  Found: <strong>{filteredUsers.length}</strong> users
                </p>
              )}

              <div className="table-container">
                <table>
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Username</th>
                      <th>Email</th>
                      <th>Role</th>
                      <th>Number of Boilers</th>
                      <th>Status</th>
                      <th>Actions</th>
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
                          <span
                            className={u.isBlocked ? 'status blocked' : 'status active'}
                          >
                            {u.isBlocked ? 'Blocked' : 'Active'}
                          </span>
                        </td>
                        <td>
                          <div className="actions">
                            <button
                              onClick={() => handleViewBuildings(u.id, u.username)}
                              className="btn-action btn-buildings"
                              title="View user buildings"
                            >
                              🏢 Buildings
                            </button>
                            <button
                              onClick={() => handleViewBoilers(u.id, u.username)}
                              className="btn-action btn-boilers"
                              title="View user boilers"
                            >
                              🔥 Boilers
                            </button>
                            <button
                              onClick={() => handleBlockToggle(u.id, u.isBlocked)}
                              className={u.isBlocked ? 'btn-action btn-unblock' : 'btn-action btn-block'}
                              title={u.isBlocked ? 'Unblock user' : 'Block user'}
                              disabled={processingUserId === u.id}
                            >
                              {processingUserId === u.id ? (
                                '⏳ Loading...'
                              ) : u.isBlocked ? (
                                '✓ Unblock'
                              ) : (
                                '🚫 Block'
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