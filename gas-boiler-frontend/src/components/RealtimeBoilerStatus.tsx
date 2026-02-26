import React from "react";
import { useRealtimeBoilers } from "../hooks/useRealtimeBoilers";
import "./RealtimeBoilerStatus.css";

interface Props {
  token: string;
  buildingIds?: number[];
}

const RealtimeBoilerStatus: React.FC<Props> = ({ token, buildingIds }) => {
  const {
    boilerPowers,
    temperatures,
    capacityWarnings,
    lastUpdate,
    isConnected,
  } = useRealtimeBoilers(token);

  const filterByBuilding = <T extends { buildingId: number }>(
    map: Map<number, T>,
  ): Map<number, T> => {
    if (!buildingIds || buildingIds.length === 0) return map;
    const filtered = new Map<number, T>();
    map.forEach((value, key) => {
      if (buildingIds.includes(value.buildingId)) filtered.set(key, value);
    });
    return filtered;
  };

  const visibleTemperatures = filterByBuilding(temperatures);
  const visibleBoilerPowers = filterByBuilding(boilerPowers);
  const visibleCapacityWarnings = filterByBuilding(capacityWarnings);

  const getPowerColor = (power: number, maxPower: number) => {
    const percentage = (power / maxPower) * 100;
    if (percentage > 80) return "#ef4444"; // Red
    if (percentage > 50) return "#f59e0b"; // Orange
    return "#10b981"; // Green
  };

  const getTempColor = (error: number) => {
    const absError = Math.abs(error);
    if (absError < 0.5) return "#10b981"; // Green
    if (absError < 2.0) return "#f59e0b"; // Orange
    return "#ef4444"; // Red
  };

  return (
    <div className="realtime-status">
      {/* Header */}
      <div className="realtime-header">
        <h3>⚡ Real-Time P-Controller Status</h3>
        <div className="realtime-indicators">
          <span
            className={`connection-badge ${isConnected ? "connected" : "disconnected"}`}
          >
            {isConnected ? "🟢 Live" : "🔴 Offline"}
          </span>
          {lastUpdate && (
            <span className="last-update">
              Updated: {lastUpdate.toLocaleTimeString()}
            </span>
          )}
        </div>
      </div>

      {/* Temperature Updates */}
      {visibleTemperatures.size > 0 && (
        <div className="temperature-section">
          <h4>🌡️ Indoor Temperatures</h4>
          <div className="temperature-grid">
            {Array.from(visibleTemperatures.values()).map((temp) => (
              <div key={temp.buildingId} className="temp-card">
                <div className="temp-building">{temp.buildingName}</div>
                <div className="temp-display">
                  <span
                    className="temp-current"
                    style={{ color: getTempColor(temp.error) }}
                  >
                    {temp.temperature.toFixed(1)}°C
                  </span>
                  <span className="temp-arrow">→</span>
                  <span className="temp-desired">
                    {temp.desiredTemperature.toFixed(1)}°C
                  </span>
                </div>
                <div className="temp-details">
                  <span>
                    Error: {temp.error > 0 ? "+" : ""}
                    {temp.error.toFixed(2)}°C
                  </span>
                  <span>Outside: {temp.outdoorTemperature.toFixed(1)}°C</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Boiler Power Updates */}
      {visibleBoilerPowers.size > 0 && (
        <div className="boilers-section">
          <h4>🔥 Boiler Power Levels</h4>
          <div className="boilers-grid">
            {Array.from(visibleBoilerPowers.values()).map((boiler) => (
              <div key={boiler.boilerId} className="boiler-card">
                <div className="boiler-header">
                  <span className="boiler-name">{boiler.boilerName}</span>
                  <span className="boiler-building">{boiler.buildingName}</span>
                </div>
                <div className="boiler-power">
                  <div className="power-bar-container">
                    <div
                      className="power-bar"
                      style={{
                        width: `${Math.min(100, (boiler.newPower / boiler.maxPower) * 100)}%`,
                        backgroundColor: getPowerColor(
                          boiler.newPower,
                          boiler.maxPower,
                        ),
                      }}
                    />
                  </div>
                  <div className="power-info">
                    <span className="power-value">
                      {boiler.newPower.toFixed(1)} kW
                    </span>
                    <span className="power-max">
                      / {boiler.maxPower.toFixed(1)} kW
                    </span>
                    {Math.abs(boiler.newPower - boiler.oldPower) > 0.1 && (
                      <span className="power-change">
                        {boiler.newPower > boiler.oldPower ? "↑" : "↓"}
                        {Math.abs(boiler.newPower - boiler.oldPower).toFixed(
                          1,
                        )}{" "}
                        kW
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Capacity Warnings */}
      {visibleCapacityWarnings.size > 0 && (
        <div className="warnings-section">
          <h4>⚠️ Capacity Warnings</h4>
          <div className="warnings-grid">
            {Array.from(visibleCapacityWarnings.values()).map((warning) => (
              <div key={warning.buildingId} className="warning-card">
                <div className="warning-icon">⚠️</div>
                <div className="warning-content">
                  <div className="warning-building">{warning.buildingName}</div>
                  <div className="warning-details">
                    <div>
                      Required:{" "}
                      <strong>{warning.requiredPower.toFixed(1)} kW</strong>
                    </div>
                    <div>
                      Available:{" "}
                      <strong>{warning.availablePower.toFixed(1)} kW</strong>
                    </div>
                    <div className="warning-deficit">
                      Deficit: <strong>{warning.deficit.toFixed(1)} kW</strong>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* No Data Message */}
      {visibleBoilerPowers.size === 0 && visibleTemperatures.size === 0 && (
        <div className="no-data">
          ⏳ Waiting for P-Controller updates (runs every 1 minute)...
        </div>
      )}
    </div>
  );
};

export default RealtimeBoilerStatus;
