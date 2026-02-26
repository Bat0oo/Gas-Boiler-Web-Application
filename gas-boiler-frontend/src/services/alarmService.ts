import apiClient from './apiService';
import { Alarm, AlarmFilters, AlarmStats, AlarmSettings, UpdateAlarmSettings } from '../types/alarmtypes';

export const alarmService = {
  getAll: async (token: string, filters?: AlarmFilters): Promise<Alarm[]> => {
    const params = new URLSearchParams();

    if (filters) {
      if (filters.type) params.append('type', filters.type);
      if (filters.severity) params.append('severity', filters.severity);
      if (filters.buildingId) params.append('buildingId', filters.buildingId.toString());
      if (filters.userId) params.append('userId', filters.userId.toString());
      if (filters.isActive !== undefined) params.append('isActive', filters.isActive.toString());
      if (filters.isAcknowledged !== undefined) params.append('isAcknowledged', filters.isAcknowledged.toString());
      if (filters.startDate) params.append('startDate', filters.startDate);
      if (filters.endDate) params.append('endDate', filters.endDate);
    }

    const response = await apiClient.get<Alarm[]>(`/Alarms?${params.toString()}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  },

  getActive: async (token: string): Promise<Alarm[]> => {
    const response = await apiClient.get<Alarm[]>('/Alarms/active', {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  },

  getStats: async (token: string): Promise<AlarmStats> => {
    const response = await apiClient.get<AlarmStats>('/Alarms/stats', {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  },

  getById: async (id: number, token: string): Promise<Alarm> => {
    const response = await apiClient.get<Alarm>(`/Alarms/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  },

  acknowledge: async (id: number, token: string): Promise<Alarm> => {
    const response = await apiClient.post<Alarm>(`/Alarms/${id}/acknowledge`, {}, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  },

  resolve: async (id: number, token: string): Promise<Alarm> => {
    const response = await apiClient.post<Alarm>(`/Alarms/${id}/resolve`, {}, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  },

  deleteAlarm: async (id: number, token: string): Promise<void> => {
    await apiClient.delete(`/Alarms/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
  },

  getSettings: async (token: string): Promise<AlarmSettings> => {
    const response = await apiClient.get<AlarmSettings>('/Alarms/settings', {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  },

  updateSettings: async (token: string, data: UpdateAlarmSettings): Promise<AlarmSettings> => {
    const response = await apiClient.put<AlarmSettings>('/Alarms/settings', data, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  },

  triggerCheck: async (token: string): Promise<void> => {
    await apiClient.post('/Alarms/check', {}, {
      headers: { Authorization: `Bearer ${token}` },
    });
  },
};
