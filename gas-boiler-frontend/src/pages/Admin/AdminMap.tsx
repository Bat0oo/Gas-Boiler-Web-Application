import React from 'react';
import GasBoilerMap from '../../components/GasBoilerMap';
import Navbar from '../../components/Navbar';
import { useAuth } from '../../context/AuthContext';
import './AdminMap.css';

const AdminMap: React.FC = () => {
  const { user } = useAuth();

  return (
    <>
      <Navbar />
      <div className="admin-dashboard-container">
        <h2>Admin Panel</h2>
        <p>Welcome, {user?.username}! Here you can view all users and their gas boilers.</p>

        <div className="map-section">
          <GasBoilerMap token={localStorage.getItem('token')!} />
        </div>
      </div>
    </>
  );
};

export default AdminMap;
