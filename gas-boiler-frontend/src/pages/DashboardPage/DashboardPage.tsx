import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../../components/Navbar';
import { useAuth } from '../../context/AuthContext';
import { dashboardService } from '../../services/dashboardService';
import { buildingService } from '../../services/buildingService';
import { DashboardStats } from '../../types/dashboardtypes';
import { Building } from '../../types/buildingtypes';
import './DashboardPage.css';

const DashboardPage: React.FC = () => {
  const {  user } = useAuth();
  const navigate = useNavigate();
  
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [buildings, setBuildings] = useState<Building[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    setLoading(true);
    setError('');
    if (!user?.token) return;
    
    try {
      const [statsData, buildingsData] = await Promise.all([
        dashboardService.getStats(user.token),
        buildingService.getAllBuildings(user.token)
      ]);
      
      setStats(statsData);
      setBuildings(buildingsData);
    } catch (err: any) {
      console.error('Error loading dashboard:', err);
      setError('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const handleBuildingClick = (buildingId: number) => {
    navigate('/map', { state: { openBuildingId: buildingId } });
  };

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="dashboard-container">
          <div className="dashboard-loading">
            <div className="loading-spinner"></div>
            <p>Loading dashboard...</p>
          </div>
        </div>
      </>
    );
  }

  if (error || !stats) {
    return (
      <>
        <Navbar />
        <div className="dashboard-container">
          <div className="dashboard-error">
            <p>❌ {error || 'Failed to load dashboard'}</p>
            <button onClick={loadDashboard} className="btn-retry">
              Retry
            </button>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className="dashboard-container">
        
        {/* Header */}
        <div className="dashboard-header">
          <h1>📊 Dashboard</h1>
          <p className="dashboard-subtitle">
            Welcome back, <strong>{user?.username}</strong>! Here's your system overview.
          </p>
        </div>

        {/* Main Stats Cards */}
        <div className="stats-grid">
          <div className="stat-card buildings">
            <div className="stat-icon">🏢</div>
            <div className="stat-content">
              <h3>Total Buildings</h3>
              <p className="stat-value">{stats.totalBuildings}</p>
              <span className="stat-detail">{stats.totalHeatingArea.toFixed(0)} m² total area</span>
            </div>
          </div>

          <div className="stat-card boilers">
            <div className="stat-icon">🔥</div>
            <div className="stat-content">
              <h3>Total Boilers</h3>
              <p className="stat-value">{stats.totalBoilers}</p>
              <span className="stat-detail">{stats.totalBoilerCapacity.toFixed(0)} kW capacity</span>
            </div>
          </div>

          <div className="stat-card power">
            <div className="stat-icon">⚡</div>
            <div className="stat-content">
              <h3>Required Power</h3>
              <p className="stat-value">{stats.totalRequiredPower.toFixed(1)} kW</p>
              <span className="stat-detail">
                {stats.totalBoilerCapacity >= stats.totalRequiredPower ? (
                  <span className="status-good">✅ Sufficient capacity</span>
                ) : (
                  <span className="status-warning">⚠️ Capacity deficit</span>
                )}
              </span>
            </div>
          </div>

          <div className="stat-card cost">
            <div className="stat-icon">💰</div>
            <div className="stat-content">
              <h3>Daily Cost</h3>
              <p className="stat-value">€{stats.estimatedTotalDailyCost.toFixed(2)}</p>
              <span className="stat-detail">€{stats.estimatedTotalMonthlyCost.toFixed(0)}/month</span>
            </div>
          </div>
        </div>

        {/* Alerts Section */}
        {stats.buildingsWithInsufficientCapacity > 0 && (
          <div className="alert-banner warning">
            <span className="alert-icon">⚠️</span>
            <div className="alert-content">
              <strong>Capacity Warning:</strong> {stats.buildingsWithInsufficientCapacity} building(s) have insufficient boiler capacity!
            </div>
            <button onClick={() => navigate('/buildings')} className="alert-action">
              View Buildings
            </button>
          </div>
        )}

        {/* Buildings Overview Table */}
        <div className="dashboard-section">
          <div className="section-header">
            <h2>🏢 Buildings Overview</h2>
            <button onClick={() => navigate('/map')} className="btn-view-map">
              🗺️ View on Map
            </button>
          </div>

          {buildings.length === 0 ? (
            <div className="empty-state">
              <p>No buildings yet. Add your first building on the map!</p>
              <button onClick={() => navigate('/map')} className="btn-primary">
                Go to Map
              </button>
            </div>
          ) : (
            <div className="buildings-table-container">
              <table className="buildings-table">
                <thead>
                  <tr>
                    <th>Building Name</th>
                    <th>Heating Area</th>
                    <th>Desired Temp</th>
                    <th>Boilers</th>
                    <th>Capacity</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {buildings.map((building) => (
                    <tr key={building.id} onClick={() => handleBuildingClick(building.id)}>
                      <td>
                        <strong>{building.name}</strong>
                      </td>
                      <td>{building.heatingArea} m²</td>
                      <td>{building.desiredTemperature}°C</td>
                      <td>{building.boilerCount}</td>
                      <td>
                        {building.boilerCount > 0 ? (
                          <span className="capacity-badge">
                            {/* Capacity is sum of boilers - would need to fetch */}
                            {building.boilerCount} boiler(s)
                          </span>
                        ) : (
                          <span className="no-boilers">No boilers</span>
                        )}
                      </td>
                      <td>
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            handleBuildingClick(building.id);
                          }}
                          className="btn-view-details"
                        >
                          View Details
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Quick Stats Summary */}
        <div className="quick-stats">
          <div className="quick-stat-item">
            <span className="quick-stat-label">Average Heating Area:</span>
            <span className="quick-stat-value">
              {stats.totalBuildings > 0 
                ? (stats.totalHeatingArea / stats.totalBuildings).toFixed(0) 
                : 0} m²
            </span>
          </div>
          <div className="quick-stat-item">
            <span className="quick-stat-label">Monthly Cost:</span>
            <span className="quick-stat-value">€{stats.estimatedTotalMonthlyCost.toFixed(2)}</span>
          </div>
          <div className="quick-stat-item">
            <span className="quick-stat-label">Annual Cost:</span>
            <span className="quick-stat-value">€{stats.estimatedTotalAnnualCost.toFixed(2)}</span>
          </div>
          <div className="quick-stat-item">
            <span className="quick-stat-label">Avg Boilers per Building:</span>
            <span className="quick-stat-value">
              {stats.totalBuildings > 0 
                ? (stats.totalBoilers / stats.totalBuildings).toFixed(1) 
                : 0}
            </span>
          </div>
        </div>

      </div>
    </>
  );
};

export default DashboardPage;