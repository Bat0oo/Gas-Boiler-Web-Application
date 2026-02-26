import apiClient from "./apiService";
import {
  BuildingReading,
  SeedHistoricalDataResponse,
} from "../types/historicaldatatypes";

export const historicalDataService = {
  // Get historical data for a specific building
  async getBuildingHistory(
    buildingId: number,
    token: string,
    startDate?: string,
    endDate?: string,
  ): Promise<BuildingReading[]> {
    const params = new URLSearchParams();
    if (startDate) params.append("startDate", startDate);
    if (endDate) params.append("endDate", endDate);

    const url = `/HistoricalData/building/${buildingId}${params.toString() ? `?${params}` : ""}`;

    const response = await apiClient.get<BuildingReading[]>(url, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  },

  // Get all historical data (admin or filtered by user)
  async getAllHistory(
    token: string,
    startDate?: string,
    endDate?: string,
  ): Promise<BuildingReading[]> {
    const params = new URLSearchParams();
    if (startDate) params.append("startDate", startDate);
    if (endDate) params.append("endDate", endDate);

    const url = `/HistoricalData${params.toString() ? `?${params}` : ""}`;

    const response = await apiClient.get<BuildingReading[]>(url, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  },

  // Get total count of readings
  async getReadingsCount(token: string): Promise<number> {
    const response = await apiClient.get<{ totalReadings: number }>(
      "/HistoricalData/count",
      {
        headers: { Authorization: `Bearer ${token}` },
      },
    );
    return response.data.totalReadings;
  },

  // Generate test data (Admin only)
  async seedData(
    token: string,
    days: number = 30,
  ): Promise<SeedHistoricalDataResponse> {
    const response = await apiClient.post<SeedHistoricalDataResponse>(
      `/HistoricalData/seed?days=${days}`,
      {},
      {
        headers: { Authorization: `Bearer ${token}` },
      },
    );
    return response.data;
  },

  // Manually trigger recording (Admin only)
  async recordNow(token: string): Promise<{ message: string }> {
    const response = await apiClient.post<{ message: string }>(
      "/HistoricalData/record",
      {},
      {
        headers: { Authorization: `Bearer ${token}` },
      },
    );
    return response.data;
  },
};
