import apiClient from "./apiService";
import {
  Building,
  BuildingMapPoint,
  BuildingDetail,
  CreateBuildingPayload,
  UpdateBuildingPayload,
  HeatLossCalculation,
} from "../types/buildingtypes";

export const buildingService = {
  getAllBuildings: async (token: string): Promise<Building[]> => {
    const response = await apiClient.get<Building[]>("/BuildingObject", {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  },

  // Get building map points (for map markers)
  getMapPoints: async (token: string): Promise<BuildingMapPoint[]> => {
    const response = await apiClient.get<BuildingMapPoint[]>(
      "/BuildingObject/map",
      {
        headers: { Authorization: `Bearer ${token}` },
      },
    );
    return response.data;
  },

  getBuildingById: async (
    id: number,
    token: string,
  ): Promise<BuildingDetail> => {
    const response = await apiClient.get<BuildingDetail>(
      `/BuildingObject/${id}`,
      {
        headers: { Authorization: `Bearer ${token}` },
      },
    );
    return response.data;
  },

  createBuilding: async (
    payload: CreateBuildingPayload,
    token: string,
  ): Promise<Building> => {
    const response = await apiClient.post<Building>(
      "/BuildingObject",
      payload,
      {
        headers: { Authorization: `Bearer ${token}` },
      },
    );
    return response.data;
  },

  updateBuilding: async (
    id: number,
    payload: UpdateBuildingPayload,
    token: string,
  ): Promise<Building> => {
    const response = await apiClient.put<Building>(
      `/BuildingObject/${id}`,
      payload,
      {
        headers: { Authorization: `Bearer ${token}` },
      },
    );
    return response.data;
  },

  deleteBuilding: async (id: number, token: string): Promise<void> => {
    await apiClient.delete(`/BuildingObject/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
  },
  updateDesiredTemperature: async (
    id: number,
    desiredTemperature: number,
    token: string,
  ): Promise<Building> => {
    const response = await apiClient.patch<Building>(
      `/BuildingObject/${id}/desired-temperature`,
      { desiredTemperature },
      { headers: { Authorization: `Bearer ${token}` } },
    );
    return response.data;
  },

  getCalculations: async (
    buildingId: number,
    token: string,
  ): Promise<HeatLossCalculation> => {
    const response = await apiClient.get<HeatLossCalculation>(
      `/BuildingObject/${buildingId}/calculations`,
      {
        headers: { Authorization: `Bearer ${token}` },
      },
    );
    return response.data;
  },
};
