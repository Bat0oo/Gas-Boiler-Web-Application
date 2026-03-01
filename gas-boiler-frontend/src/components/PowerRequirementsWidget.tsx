import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { historicalDataService } from "../services/historicalDataService";
import { BuildingReading } from "../types/historicaldatatypes";
import PowerChart from "./charts/PowerChart";
import { processPowerData, getDateRangeFromPreset } from "../utils/chartUtils";
import "./PowerRequirementsWidget.css";

interface BuildingIssue {
  buildingId: number;
  buildingName: string;
  issueCount: number;
  worstDeficit: number;
}

const PowerRequirementsWidget: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [powerData, setPowerData] = useState<any[]>([]);
  const [buildingIssues, setBuildingIssues] = useState<BuildingIssue[]>([]);

  useEffect(() => {
    loadPowerData();
  }, []);

  const loadPowerData = async () => {
    if (!user?.token) return;

    try {
      setLoading(true);

      const { startDate, endDate } = getDateRangeFromPreset("last7days");
      const readings: BuildingReading[] =
        await historicalDataService.getAllHistory(
          user.token,
          startDate.toISOString(),
          endDate.toISOString(),
        );

      const processed = processPowerData(readings);
      setPowerData(processed);

      const issuesByBuilding = new Map<number, BuildingIssue>();

      processed
        .filter((d) => !d.hasCapacity)
        .forEach((d) => {
          const buildingId = d.buildingId || 0;
          const buildingName = d.buildingName || "Unknown Building";
          const deficit = d.requiredPower - d.availablePower;

          if (issuesByBuilding.has(buildingId)) {
            const existing = issuesByBuilding.get(buildingId)!;
            existing.issueCount++;
            existing.worstDeficit = Math.max(existing.worstDeficit, deficit);
          } else {
            issuesByBuilding.set(buildingId, {
              buildingId,
              buildingName,
              issueCount: 1,
              worstDeficit: deficit,
            });
          }
        });

      // Convert to array and sort by worst deficit
      const issues = Array.from(issuesByBuilding.values()).sort(
        (a, b) => b.worstDeficit - a.worstDeficit,
      );

      setBuildingIssues(issues);
    } catch (err) {
      console.error("Error loading power data:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetails = () => {
    navigate("/charts");
  };

  if (loading) {
    return (
      <div className="power-widget">
        <div className="widget-header">
          <h3>⚡ Power Requirements</h3>
        </div>
        <div className="widget-loading">
          <div className="loading-spinner-small"></div>
          <p>Loading chart...</p>
        </div>
      </div>
    );
  }

  if (powerData.length === 0) {
    return (
      <div className="power-widget">
        <div className="widget-header">
          <h3>⚡ Power Requirements</h3>
        </div>
        <div className="widget-empty">
          <p>No historical data available yet.</p>
          <p className="widget-hint">
            Data will appear once the background service records readings.
          </p>
        </div>
      </div>
    );
  }

  const hasIssues = buildingIssues.length > 0;
  const totalIssues = buildingIssues.reduce((sum, b) => sum + b.issueCount, 0);

  return (
    <div className="power-widget">
      <div className="widget-header">
        <div className="widget-title">
          <h3>⚡ Power Requirements (Last 7 Days)</h3>
          {hasIssues ? (
            <span className="status-badge warning">
              ⚠️ {buildingIssues.length} Building
              {buildingIssues.length > 1 ? "s" : ""} with Issues
            </span>
          ) : (
            <span className="status-badge success">✅ All Buildings OK</span>
          )}
        </div>
        <button onClick={handleViewDetails} className="btn-view-analytics">
          View Detailed Analytics →
        </button>
      </div>

      {/* Building-Specific Capacity Issues */}
      {hasIssues && (
        <div className="capacity-issues-summary">
          <div className="issue-header">
            <span className="issue-icon">⚠️</span>
            <strong>Buildings Need Attention!</strong>
          </div>

          <div className="buildings-with-issues">
            {buildingIssues.map((building) => (
              <div key={building.buildingId} className="building-issue-card">
                <div className="building-issue-header">
                  <span className="building-icon">🏢</span>
                  <strong>{building.buildingName}</strong>
                </div>
                <div className="building-issue-stats">
                  <div className="issue-stat-item">
                    <span className="stat-label">Occurrences:</span>
                    <span className="stat-value">{building.issueCount}</span>
                  </div>
                  <div className="issue-stat-item">
                    <span className="stat-label">Worst Deficit:</span>
                    <span className="stat-value highlight">
                      {building.worstDeficit.toFixed(2)} kW
                    </span>
                  </div>
                </div>
                <div className="building-action-hint">
                  💡 Add more boilers or reduce temperature
                </div>
              </div>
            ))}
          </div>

          <div className="issue-note">
            <strong>How to fix:</strong> Hover over RED bars to see exactly when
            each building had issues. Then add boilers or adjust settings for
            that building.
          </div>
        </div>
      )}

      <div className="widget-chart">
        <PowerChart data={powerData} height={300} showLegend={true} />
      </div>

      <div className="widget-footer">
        <div className="widget-legend">
          <div className="legend-item">
            <span className="legend-color green"></span>
            <span>Available Power (Boiler Capacity)</span>
          </div>
          <div className="legend-item">
            <span className="legend-color blue"></span>
            <span>Required Power (Sufficient)</span>
          </div>
          <div className="legend-item">
            <span className="legend-color red"></span>
            <span>Required Power (Insufficient - Need More Capacity!)</span>
          </div>
        </div>
        <p className="widget-info">
          💡 <strong>Hover over any bar</strong> to see the building name, date,
          time, and exact power details. RED bars show which buildings need more
          boilers.
        </p>
      </div>
    </div>
  );
};

export default PowerRequirementsWidget;
