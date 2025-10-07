import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Navbar from '../../components/Navbar';
import { useAuth } from '../../context/AuthContext';
import apiClient from '../../services/apiService';
import './Profile.css';

interface FormData {
  username: string;
  email: string;
  currentPassword: string;
  newPassword: string;
  role?: string;
  isBlocked?: boolean;
}

const Profile: React.FC = () => {
  const { user } = useAuth();
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const userIdToEdit = id ? parseInt(id) : user?.userId;

  const [formData, setFormData] = useState<FormData>({
    username: '',
    email: '',
    currentPassword: '',
    newPassword: '',
    role: '',
    isBlocked: false,
  });

  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (!userIdToEdit) return;

    apiClient
      .get(`/user/${userIdToEdit}`)
      .then((res) => {
        const data = res.data;
        setFormData({
          username: data.username,
          email: data.email,
          currentPassword: '',
          newPassword: '',
          role: data.role,
          isBlocked: data.isBlocked ?? false,
        });
      })
      .catch(() => setError('Neuspešno učitavanje profila.'));
  }, [userIdToEdit]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const target = e.target as HTMLInputElement | HTMLSelectElement;
    const name = target.name;
    let value: string | boolean = target.value;

    if (target instanceof HTMLInputElement && target.type === 'checkbox') {
      value = target.checked;
    }

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage('');
    setError('');

    try {
      await apiClient.put(`/user/${userIdToEdit}`, formData);
      setMessage('Profil je uspešno ažuriran.');

      if (id && user?.role === 'Admin') {
        setTimeout(() => navigate('/admin/users'), 1500);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Greška pri ažuriranju profila.');
    }
  };

  return (
    <>
      <Navbar />
      <div className="profile-container">
        <div className="profile-card">
          <h2>
            {id && user?.role === 'Admin'
              ? `Uredi profil korisnika #${id}`
              : 'Moj profil'}
          </h2>

          {message && <div className="alert success">{message}</div>}
          {error && <div className="alert error">{error}</div>}

          <form onSubmit={handleSubmit}>
            <label>Korisničko ime:</label>
            <input
              type="text"
              name="username"
              value={formData.username}
              onChange={handleChange}
              required
            />

            <label>Email:</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
            />

            <label>Trenutna lozinka:</label>
            <input
              type="password"
              name="currentPassword"
              value={formData.currentPassword}
              onChange={handleChange}
              placeholder="Unesi trenutnu lozinku"
            />

            <label>Nova lozinka:</label>
            <input
              type="password"
              name="newPassword"
              value={formData.newPassword}
              onChange={handleChange}
              placeholder="Unesi novu lozinku"
            />

            {user?.role === 'Admin' && (
              <>
                <label>Uloga:</label>
                <select
                  name="role"
                  value={formData.role}
                  onChange={handleChange}
                >
                  <option value="User">User</option>
                  <option value="Admin">Admin</option>
                </select>

                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    name="isBlocked"
                    checked={!!formData.isBlocked}
                    onChange={handleChange}
                  />
                  Korisnik blokiran
                </label>
              </>
            )}

            <button type="submit" className="btn-primary">
              Sačuvaj izmene
            </button>

            {id && user?.role === 'Admin' && (
              <button
                type="button"
                className="btn-secondary"
                onClick={() => navigate('/admin/users')}
              >
                Nazad na listu korisnika
              </button>
            )}
          </form>
        </div>
      </div>
    </>
  );
};

export default Profile;
