import apiClient from "./apiService";
import {
  DataManagementSettings,
  UpdateDataManagementSettings,
  DataStatistics,
} from "../types/datamanagementtypes";
import { SeedHistoricalDataResponse } from "../types/historicaldatatypes";

export const dataManagementService = {
  // Get current settings (Admin only)
  async getSettings(token: string): Promise<DataManagementSettings> {
    const response = await apiClient.get<DataManagementSettings>(
      "/DataManagement/settings",
      {
        headers: { Authorization: `Bearer ${token}` },
      },
    );
    return response.data;
  },

  // Update settings (Admin only)
  async updateSettings(
    token: string,
    settings: UpdateDataManagementSettings,
  ): Promise<DataManagementSettings> {
    const response = await apiClient.put<DataManagementSettings>(
      "/DataManagement/settings",
      settings,
      {
        headers: { Authorization: `Bearer ${token}` },
      },
    );
    return response.data;
  },

  // Get statistics (Admin only)
  async getStatistics(token: string): Promise<DataStatistics> {
    const response = await apiClient.get<DataStatistics>(
      "/DataManagement/statistics",
      {
        headers: { Authorization: `Bearer ${token}` },
      },
    );
    return response.data;
  },

  // Export ALL data as CSV (Admin only)
  async exportCsv(token: string): Promise<Blob> {
    const response = await apiClient.get("/DataManagement/export/csv", {
      headers: { Authorization: `Bearer ${token}` },
      responseType: "blob",
    });
    return response.data;
  },

  // Export user's own buildings data as CSV (Any authenticated user)
  async exportMyBuildingsCsv(token: string): Promise<Blob> {
    const response = await apiClient.get(
      "/DataManagement/export/csv/my-buildings",
      {
        headers: { Authorization: `Bearer ${token}` },
        responseType: "blob",
      },
    );
    return response.data;
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

  // Clear all data (Admin only)
  async clearAllData(token: string): Promise<{ message: string }> {
    const response = await apiClient.delete<{ message: string }>(
      "/HistoricalData/clear",
      {
        headers: { Authorization: `Bearer ${token}` },
      },
    );
    return response.data;
  },

  // Get readings count
  async getReadingsCount(token: string): Promise<number> {
    const response = await apiClient.get<{ totalReadings: number }>(
      "/HistoricalData/count",
      {
        headers: { Authorization: `Bearer ${token}` },
      },
    );
    return response.data.totalReadings;
  },
};
