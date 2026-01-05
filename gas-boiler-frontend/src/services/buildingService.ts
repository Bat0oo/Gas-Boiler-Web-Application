// services/buildingService.ts - NEW SERVICE FOR C# BACKEND
import apiClient from './apiService';
import {
  Building,
  BuildingDetail,
  BuildingMapPoint,
  CreateBuildingPayload,
  UpdateBuildingPayload,
} from '../types/buildingtypes';

export const buildingService = {
  /**
   * GET /api/BuildingObject/map
   * Get all buildings for map (marker data only)
   */
  getMapPoints: async (token: string): Promise<BuildingMapPoint[]> => {
    const response = await apiClient.get<BuildingMapPoint[]>('/BuildingObject/map', {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  },

  /**
   * GET /api/BuildingObject
   * Get all buildings for current user
   */
  getAllBuildings: async (token: string): Promise<Building[]> => {
    const response = await apiClient.get<Building[]>('/BuildingObject', {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  },

  /**
   * GET /api/BuildingObject/{id}
   * Get building details with all boilers
   */
  getBuildingById: async (id: number, token: string): Promise<BuildingDetail> => {
    const response = await apiClient.get<BuildingDetail>(`/BuildingObject/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  },

  /**
   * POST /api/BuildingObject
   * Create new building
   */
  createBuilding: async (
    payload: CreateBuildingPayload,
    token: string
  ): Promise<Building> => {
    const response = await apiClient.post<Building>('/BuildingObject', payload, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  },

  /**
   * PUT /api/BuildingObject/{id}
   * Update existing building
   */
  updateBuilding: async (
    id: number,
    payload: UpdateBuildingPayload,
    token: string
  ): Promise<Building> => {
    const response = await apiClient.put<Building>(`/BuildingObject/${id}`, payload, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  },

  /**
   * DELETE /api/BuildingObject/{id}
   * Delete building (cascades to all boilers in building)
   */
  deleteBuilding: async (id: number, token: string): Promise<void> => {
    await apiClient.delete(`/BuildingObject/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
  },
};