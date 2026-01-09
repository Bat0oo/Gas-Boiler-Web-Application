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

  if (!user) return null; // ne prikazuj navbar ako nije ulogovan

  return (
    <nav className="navbar">
      <div className="navbar-logo" onClick={() => navigate(user.role === 'Admin' ? '/admin/dashboard' : '/dashboard')}>
        🔥 GasBoilerApp
      </div>

      <ul className="navbar-links">
        {user.role === 'Admin' ? (
          <>
            <li><Link to="/admin/dashboard">Dashboard</Link></li>
            <li><Link to="/admin/users">Korisnici</Link></li>
            <li><Link to="/buildings">Zgrade</Link></li>
            <li><Link to="/my-boilers">Kotlovi</Link></li>
            <li><Link to="/admin/system-parameters">Parametri</Link></li>
            <li><Link to="/profile">Profil</Link></li>
          </>
        ) : (
          <>
            <li><Link to="/dashboard">Dashboard</Link></li>
            <li><Link to="/my-boilers">Moji kotlovi</Link></li>
            <li><Link to="/buildings">Moje zgrade</Link></li>
            <li><Link to="/profile">Profil</Link></li>
          </>
        )}
      </ul>

      <div className="navbar-user">
        <span className="navbar-username">{user.username}</span>
        <button className="logout-btn" onClick={handleLogout}>Odjavi se</button>
      </div>
    </nav>
  );
};

export default Navbar;
