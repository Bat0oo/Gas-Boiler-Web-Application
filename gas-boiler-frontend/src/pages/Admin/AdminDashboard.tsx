import React from 'react';
import GasBoilerMap from '../../components/GasBoilerMap';
import Navbar from '../../components/Navbar';
import { useAuth } from '../../context/AuthContext';
import './AdminDashboard.css';

const AdminDashboard: React.FC = () => {
  const { user } = useAuth();

  return (
    <>
      <Navbar />
      <div className="admin-dashboard-container">
        <h2>Admin panel</h2>
        <p>Dobrodošao, {user?.username}! Ovde možeš pregledati sve korisnike i njihove gasne kotlove.</p>

        <div className="map-section">
          <GasBoilerMap token={localStorage.getItem('token') || undefined} />
        </div>

        <div className="admin-actions">
          <button
            onClick={() => window.location.href = '/admin/users'}
            className="btn"
          >
            Pregled korisnika
          </button>
          <button
            onClick={() => window.location.href = '/admin/system-parameters'}
            className="btn btn-primary"
          >
            Sistemski parametri
          </button>
        </div>
      </div>
    </>
  );
};

export default AdminDashboard;
