import React from 'react';
import GasBoilerMap from '../../components/GasBoilerMap';
import Navbar from '../../components/Navbar';
import { useAuth } from '../../context/AuthContext';
import './Dashboard.css';

const Dashboard: React.FC = () => {
  const { user } = useAuth();

  return (
    <>
      <Navbar />
      <div className="dashboard-container">
        <h2>Dobrodošao, {user?.username}</h2>
        <p>Ovde možeš videti sve svoje gasne kotlove na mapi i upravljati njima.</p>

        <div className="map-section">
          <GasBoilerMap token={localStorage.getItem('token')!} />
        </div>
      </div>
    </>
  );
};

export default Dashboard;
