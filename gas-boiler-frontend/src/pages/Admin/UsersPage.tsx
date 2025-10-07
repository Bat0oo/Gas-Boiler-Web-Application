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

  useEffect(() => {
    if (!user || user.role !== 'Admin') return;

    apiClient
      .get('/user')
      .then((res) => {
        setUsers(res.data);
        setLoading(false);
      })
      .catch(() => {
        setError('Greška prilikom učitavanja korisnika.');
        setLoading(false);
      });
  }, [user]);

  const handleBlockToggle = async (id: number, isBlocked: boolean) => {
    try {
      if (isBlocked) {
        await apiClient.post(`/user/${id}/unblock`);
      } else {
        await apiClient.post(`/user/${id}/block`);
      }

      setUsers((prev) =>
        prev.map((u) =>
          u.id === id ? { ...u, isBlocked: !isBlocked } : u
        )
      );
    } catch {
      alert('Greška prilikom blokiranja/odblokiranja korisnika.');
    }
  };

  const handleDelete = async (id: number) => {
  if (!window.confirm('Da li ste sigurni da želite da obrišete ovog korisnika?')) return;

  try {
    await apiClient.delete(`/user/${id}`);
    setUsers((prev) => prev.filter((u) => u.id !== id));
  } catch {
    alert('Greška prilikom brisanja korisnika.');
  }
};

  const handleEdit = (id: number) => {
    navigate(`/user/${id}`);
  };

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="userslist-container">Učitavanje...</div>
      </>
    );
  }

  if (error) {
    return (
      <>
        <Navbar />
        <div className="userslist-container error">{error}</div>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className="userslist-container">
        <div className="userslist-card">
          <h2>Spisak korisnika</h2>
          {users.length === 0 ? (
            <p>Nema registrovanih korisnika.</p>
          ) : (
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
                {users.map((u) => (
                  <tr key={u.id}>
                    <td>{u.id}</td>
                    <td>{u.username}</td>
                    <td>{u.email}</td>
                    <td>{u.role}</td>
                    <td>{u.gasBoilersCount}</td>
                    <td>
                      <span
                        className={
                          u.isBlocked ? 'status blocked' : 'status active'
                        }
                      >
                        {u.isBlocked ? 'Blokiran' : 'Aktivan'}
                      </span>
                    </td>
                    <td className="actions">
                      <button
                        onClick={() => handleEdit(u.id)}
                        className="btn-edit"
                      >
                        Uredi
                      </button>
                      <button
                        onClick={() => handleBlockToggle(u.id, u.isBlocked)}
                        className={
                          u.isBlocked ? 'btn-unblock' : 'btn-block'
                        }
                      >
                        {u.isBlocked ? 'Odblokiraj' : 'Blokiraj'}
                      </button>
                        <button onClick={() => handleDelete(u.id)} className="btn-delete">
                           Obriši
                        </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </>
  );
};

export default UsersList;
