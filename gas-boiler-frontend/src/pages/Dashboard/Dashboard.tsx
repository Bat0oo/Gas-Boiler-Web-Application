import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const Dashboard: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div style={{ padding: '2rem' }}>
      <h1>Welcome, {user?.username}!</h1>
      <p>Role: {user?.role}</p>
      <p>Email: {user?.email}</p>
      <button onClick={handleLogout} style={{ marginTop: '1rem', padding: '0.5rem 1rem' }}>
        Logout
      </button>
      <hr />
      <p>Dashboard content coming soon...</p>
    </div>
  );
};

export default Dashboard;