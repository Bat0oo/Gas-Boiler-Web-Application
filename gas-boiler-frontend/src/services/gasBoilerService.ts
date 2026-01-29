import apiClient from './apiService';
import {
  GasBoiler,
  CreateGasBoilerPayload,
  UpdateGasBoilerPayload,
} from '../types/gasBoilertypes';

// BACKWARDS COMPATIBILITY: Export old type for existing components
// This is the FULL response from backend (includes buildingObject)
export interface GasBoilerFullResponse {
  id: number;
  name: string;
  maxPower: number;
  efficiency: number;
  currentPower: number;
  createdAt: string;
  updatedAt: string;
  userId: number;
  userName: string;
  buildingObjectId: number;
  buildingName?: string;
  buildingObject?: {
    id: number;
    name: string;
    heatingArea: number;
    desiredTemperature: number;
    wallUValue: number;
    windowUValue: number;
    ceilingUValue: number;
    floorUValue: number;
    wallArea: number;
    windowArea: number;
    ceilingArea: number;
    floorArea: number;
    latitude: number;
    longitude: number;
  };
}

export const gasBoilerService = {
  /**
   * GET /api/GasBoiler
   * Get all boilers for current user
   */
  getAllBoilers: async (token: string): Promise<GasBoilerFullResponse[]> => {
    const response = await apiClient.get<GasBoilerFullResponse[]>('/GasBoiler', {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  },

  /**
   * GET /api/GasBoiler/{id}
   * Get single boiler by ID
   */
  getBoilerById: async (id: number, token: string): Promise<GasBoilerFullResponse> => {
    const response = await apiClient.get<GasBoilerFullResponse>(`/GasBoiler/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  },

  /**
   * POST /api/GasBoiler
   * Create new boiler (must belong to existing building)
   * NEW: Requires buildingObjectId instead of full buildingObject
   */
  createGasBoiler: async (
    payload: CreateGasBoilerPayload,
    token: string
  ): Promise<GasBoilerFullResponse> => {
    const response = await apiClient.post<GasBoilerFullResponse>('/GasBoiler', payload, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  },

  /**
   * PUT /api/GasBoiler/{id}
   * Update boiler (cannot change which building it belongs to)
   */
  updateGasBoiler: async (
    id: number,
    payload: UpdateGasBoilerPayload,
    token: string
  ): Promise<GasBoilerFullResponse> => {
    const response = await apiClient.put<GasBoilerFullResponse>(`/GasBoiler/${id}`, payload, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  },

  /**
   * DELETE /api/GasBoiler/{id}
   * Delete boiler
   */
  deleteGasBoiler: async (id: number, token: string): Promise<void> => {
    await apiClient.delete(`/GasBoiler/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
  },
};