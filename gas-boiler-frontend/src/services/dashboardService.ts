import apiClient from './apiService';
import { DashboardStats } from '../types/dashboardtypes';

export const dashboardService = {
  // Get dashboard statistics
  async getStats(token: string): Promise<DashboardStats> {
    const response = await apiClient.get<DashboardStats>('/Dashboard/stats', {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  },
};