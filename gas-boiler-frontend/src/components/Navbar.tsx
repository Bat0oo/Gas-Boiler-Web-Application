import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Navbar.css';

const Navbar: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  if (!user) return null;

  return (
    <nav className="navbar">
      <div className="navbar-logo" onClick={() => navigate(user.role === 'Admin' ? '/admin/dashboard' : '/dashboard')}>
        🔥 GasBoilerApp
      </div>

      <ul className="navbar-links">
        {user.role === 'Admin' ? (
          <>
            <li><Link to="/dashboard">Dashboard</Link></li>
            <li><Link to="/admin/map">Map</Link></li>
            <li><Link to="/admin/users">Users</Link></li>
            <li><Link to="/buildings">Buildings</Link></li>
            <li><Link to="/my-boilers">Boilers</Link></li>
            <li><Link to="/admin/system-parameters">Parameters</Link></li>
            <li><Link to="/data-management">Data Management</Link></li>
            <li><Link to="/profile">Profile</Link></li>
            
          </>
        ) : (
          <>
            <li><Link to="/dashboard">Dashboard</Link></li>
            <li><Link to="/map">Map</Link></li>
            <li><Link to="/my-boilers">My Boilers</Link></li>
            <li><Link to="/buildings">My Buildings</Link></li>
            <li><Link to="/parameters">Parameters</Link></li>
            <li><Link to="/profile">Profile</Link></li>
          </>
        )}
      </ul>

      <div className="navbar-user">
        <span className="navbar-username">{user.username}</span>
        <button className="logout-btn" onClick={handleLogout}>Logout</button>
      </div>
    </nav>
  );
};

export default Navbar;
