import React, { useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import "./LandingPage.css";

const LandingPage: React.FC = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && user) {
      navigate(user.role === "Admin" ? "/admin/map" : "/map", {
        replace: true,
      });
    }
  }, [user, loading, navigate]);

  if (loading) return null;

  return (
    <div className="landing-page">
      {/* Header */}
      <header className="landing-header">
        <div className="landing-header-inner">
          <div className="landing-logo">
            <span className="landing-logo-icon">🔥</span>
            <span className="landing-logo-text">GasBoilerApp</span>
          </div>
          <nav className="landing-nav">
            <Link to="/login" className="landing-nav-link">
              Login
            </Link>
            <Link to="/register" className="landing-nav-btn">
              Register
            </Link>
          </nav>
        </div>
      </header>

      {/* Hero */}
      <section className="landing-hero">
        <div className="landing-hero-content">
          <h1 className="landing-hero-title">
            Gas Boiler Management
            <br />
            <span className="landing-hero-accent">Made Simple</span>
          </h1>
          <p className="landing-hero-subtitle">
            Analyze and manage gas heating systems for any type of building.
            Calculate heat losses, monitor boiler performance, and track energy
            costs in real time.
          </p>
          <div className="landing-hero-cta">
            <Link to="/register" className="landing-cta-primary">
              Get Started
            </Link>
            <Link to="/login" className="landing-cta-secondary">
              Sign In
            </Link>
          </div>
        </div>
        <div className="landing-hero-visual">
          <div className="landing-hero-card">
            <div className="hero-stat">
              <span className="hero-stat-icon">🏢</span>
              <span className="hero-stat-label">Building Management</span>
            </div>
            <div className="hero-stat">
              <span className="hero-stat-icon">📊</span>
              <span className="hero-stat-label">Real-Time Analytics</span>
            </div>
            <div className="hero-stat">
              <span className="hero-stat-icon">💡</span>
              <span className="hero-stat-label">Smart Boiler Control</span>
            </div>
            <div className="hero-stat">
              <span className="hero-stat-icon">💶</span>
              <span className="hero-stat-label">Cost Tracking</span>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="landing-features">
        <div className="landing-section-inner">
          <h2 className="landing-section-title">Key Features</h2>
          <div className="landing-features-grid">
            <div className="landing-feature-card">
              <div className="feature-icon">🌡️</div>
              <h3>Heat Loss Calculation</h3>
              <p>
                Automatically calculates thermal losses based on building
                geometry, U-values, and real outdoor temperature from
                OpenWeatherMap.
              </p>
            </div>
            <div className="landing-feature-card">
              <div className="feature-icon">⚙️</div>
              <h3>P-Controller Regulation</h3>
              <p>
                Proportional controller continuously adjusts boiler power output
                to maintain your desired indoor temperature with minimal
                overshoot.
              </p>
            </div>
            <div className="landing-feature-card">
              <div className="feature-icon">🗺️</div>
              <h3>Interactive Map</h3>
              <p>
                Place and manage buildings on an interactive map. View live
                temperature and boiler status directly from the map markers.
              </p>
            </div>
            <div className="landing-feature-card">
              <div className="feature-icon">📈</div>
              <h3>Historical Charts</h3>
              <p>
                Visualize indoor/outdoor temperature, heat loss, required power,
                and heating costs over time with interactive diagrams.
              </p>
            </div>
            <div className="landing-feature-card">
              <div className="feature-icon">🔔</div>
              <h3>Smart Alarms</h3>
              <p>
                Real-time notifications via browser and sound alerts when
                capacity is insufficient, temperatures exceed thresholds, or
                costs spike.
              </p>
            </div>
            <div className="landing-feature-card">
              <div className="feature-icon">📄</div>
              <h3>CSV Export</h3>
              <p>
                Export all historical data — heat losses, gas consumption, and
                heating costs — for further analysis in Excel or other tools.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="landing-how">
        <div className="landing-section-inner">
          <h2 className="landing-section-title">How It Works</h2>
          <div className="landing-steps">
            <div className="landing-step">
              <div className="step-number">1</div>
              <h3>Define Your Building</h3>
              <p>
                Place your building on the map and enter its dimensions,
                wall/window/ceiling/floor areas, U-values, and desired indoor
                temperature.
              </p>
            </div>
            <div className="landing-step-arrow">→</div>
            <div className="landing-step">
              <div className="step-number">2</div>
              <h3>Add Gas Boilers</h3>
              <p>
                Assign one or more gas boilers to your building. Set their
                maximum power and efficiency. The system checks if total
                capacity is sufficient.
              </p>
            </div>
            <div className="landing-step-arrow">→</div>
            <div className="landing-step">
              <div className="step-number">3</div>
              <h3>Monitor & Analyze</h3>
              <p>
                Track live boiler performance, view historical charts, receive
                automatic alarms, and export your data for detailed cost
                analysis.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Roles */}
      <section className="landing-roles">
        <div className="landing-section-inner">
          <h2 className="landing-section-title">User Roles</h2>
          <div className="landing-roles-grid">
            <div className="landing-role-card role-admin">
              <div className="role-icon">🛡️</div>
              <h3>Administrator</h3>
              <ul>
                <li>Manage and monitor all users</li>
                <li>Block or unblock user accounts</li>
                <li>Configure global system parameters</li>
                <li>View all buildings and boilers</li>
                <li>Manage alarm thresholds</li>
              </ul>
            </div>
            <div className="landing-role-card role-user">
              <div className="role-icon">👤</div>
              <h3>User</h3>
              <ul>
                <li>Create and manage own buildings</li>
                <li>Configure gas boilers per building</li>
                <li>View real-time performance data</li>
                <li>Access historical charts and costs</li>
                <li>Export data as CSV</li>
              </ul>
            </div>
            <div className="landing-role-card role-guest">
              <div className="role-icon">👁️</div>
              <h3>Guest</h3>
              <ul>
                <li>View basic application info</li>
                <li>Learn how the system works</li>
                <li>No account required</li>
                <li>Register to access full features</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="landing-bottom-cta">
        <div className="landing-section-inner">
          <h2>Ready to optimize your heating system?</h2>
          <p>
            Create a free account and start managing your gas boilers today.
          </p>
          <div className="landing-hero-cta">
            <Link to="/register" className="landing-cta-primary">
              Create Account
            </Link>
            <Link to="/login" className="landing-cta-secondary">
              Sign In
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="landing-footer">
        <p>
          Gas Boiler Web Application &mdash; Faculty of Technical Sciences, Novi
          Sad
        </p>
      </footer>
    </div>
  );
};

export default LandingPage;
