import React from 'react';
import GasBoilerMap from '../../components/GasBoilerMap';
import Navbar from '../../components/Navbar';
import { useAuth } from '../../context/AuthContext';
import './Map.css';

const Map: React.FC = () => {
  const { user } = useAuth();

  return (
    <>
      <Navbar />
      <div className="dashboard-container">
        <h2>Welcome, {user?.username}</h2>
        <p>Here you can view all your gas boilers on the map and manage them.</p>

        <div className="map-section">
          <GasBoilerMap token={localStorage.getItem('token')!} />
        </div>
      </div>
    </>
  );
};

export default Map;
