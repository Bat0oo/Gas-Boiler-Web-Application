import React, { useEffect, useState } from 'react';
import Navbar from '../../components/Navbar';
import { useAuth } from '../../context/AuthContext';
import apiClient from '../../services/apiService';
import './Profile.css';

interface UserProfile {
  id: number;
  username: string;
  email: string;
  role: string;
  createdAt: string;
  gasBoilersCount: number;
}

const Profile: React.FC = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await apiClient.get<UserProfile>('/user/me');
        setProfile(response.data);
      } catch (err: any) {
        setError(err.response?.data?.message || 'Greška pri učitavanju profila.');
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  if (loading) return <p>Učitavanje...</p>;
  if (error) return <p style={{ color: 'red' }}>{error}</p>;

  return (
    <>
      <Navbar />
      <div className="profile-container">
        <div className="profile-card">
          <h2>Profil korisnika</h2>

          <div className="profile-item">
            <strong>Korisničko ime:</strong> {profile?.username || user?.username}
          </div>
          <div className="profile-item">
            <strong>Email:</strong> {profile?.email || user?.email}
          </div>
          <div className="profile-item">
            <strong>Uloga:</strong> {profile?.role || user?.role}
          </div>
          <div className="profile-item">
            <strong>Datum kreiranja:</strong>{' '}
            {profile?.createdAt ? new Date(profile.createdAt).toLocaleDateString('sr-RS') : 'Nepoznato'}
          </div>
          <div className="profile-item">
            <strong>Broj gasnih kotlova:</strong> {profile?.gasBoilersCount ?? 0}
          </div>
        </div>
      </div>
    </>
  );
};

export default Profile;
