import apiClient from "./apiService";
import {
  GasBoiler,
  CreateGasBoilerPayload,
  UpdateGasBoilerPayload,
} from "../types/gasBoilertypes";

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
  getAllBoilers: async (token: string): Promise<GasBoilerFullResponse[]> => {
    const response = await apiClient.get<GasBoilerFullResponse[]>(
      "/GasBoiler",
      {
        headers: { Authorization: `Bearer ${token}` },
      },
    );
    return response.data;
  },

  getBoilerById: async (
    id: number,
    token: string,
  ): Promise<GasBoilerFullResponse> => {
    const response = await apiClient.get<GasBoilerFullResponse>(
      `/GasBoiler/${id}`,
      {
        headers: { Authorization: `Bearer ${token}` },
      },
    );
    return response.data;
  },

  createGasBoiler: async (
    payload: CreateGasBoilerPayload,
    token: string,
  ): Promise<GasBoilerFullResponse> => {
    const response = await apiClient.post<GasBoilerFullResponse>(
      "/GasBoiler",
      payload,
      {
        headers: { Authorization: `Bearer ${token}` },
      },
    );
    return response.data;
  },

  updateGasBoiler: async (
    id: number,
    payload: UpdateGasBoilerPayload,
    token: string,
  ): Promise<GasBoilerFullResponse> => {
    const response = await apiClient.put<GasBoilerFullResponse>(
      `/GasBoiler/${id}`,
      payload,
      {
        headers: { Authorization: `Bearer ${token}` },
      },
    );
    return response.data;
  },

  deleteGasBoiler: async (id: number, token: string): Promise<void> => {
    await apiClient.delete(`/GasBoiler/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
  },
};
