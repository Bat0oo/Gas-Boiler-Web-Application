// services/gasBoilerService.ts - EXTENDED VERSION
import apiClient from './apiService';

export interface GasBoilerPayload {
  name: string;
  maxPower: number;
  efficiency: number;
  currentPower: number;
  buildingObject: {
    name: string;
    latitude: number;
    longitude: number;
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
  };
}

export interface GasBoilerResponse {
  id: number;
  name: string;
  lat: number;
  lon: number;
  currentPower: number;
  maxPower?: number;
  efficiency?: number;
}

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

export interface GasBoilerUpdatePayload {
  name: string;
  maxPower: number;
  efficiency: number;
  currentPower: number;
  buildingObject?: {
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
  // GET /gasboiler/map - returns simple map points
  getMapPoints: async (token?: string): Promise<GasBoilerResponse[]> => {
    const config = token
      ? { headers: { Authorization: `Bearer ${token}` } }
      : undefined;
    
    const response = await apiClient.get<any[]>('/gasboiler/map', config);
    
    return response.data.map((item: any) => ({
      id: item.id,
      name: item.name,
      lat: item.lat,
      lon: item.lon,
      currentPower: item.currentPower,
      maxPower: item.maxPower,
      efficiency: item.efficiency,
    }));
  },

  // GET /gasboiler - get all boilers for current user
  getAllBoilers: async (token: string): Promise<GasBoilerFullResponse[]> => {
    const response = await apiClient.get<GasBoilerFullResponse[]>(
      '/gasboiler',
      { headers: { Authorization: `Bearer ${token}` } }
    );
    return response.data;
  },

  // GET /gasboiler/{id} - get single boiler
  getBoilerById: async (id: number, token: string): Promise<GasBoilerFullResponse> => {
    const response = await apiClient.get<GasBoilerFullResponse>(
      `/gasboiler/${id}`,
      { headers: { Authorization: `Bearer ${token}` } }
    );
    return response.data;
  },

  // POST /gasboiler - create new boiler
  createGasBoiler: async (
    payload: GasBoilerPayload,
    token: string
  ): Promise<GasBoilerResponse> => {
    const response = await apiClient.post<GasBoilerFullResponse>(
      '/gasboiler',
      payload,
      { headers: { Authorization: `Bearer ${token}` } }
    );
    
    return {
      id: response.data.id,
      name: response.data.name,
      lat: response.data.buildingObject?.latitude ?? 0,
      lon: response.data.buildingObject?.longitude ?? 0,
      currentPower: response.data.currentPower,
      maxPower: response.data.maxPower,
      efficiency: response.data.efficiency,
    };
  },

  // PUT /gasboiler/{id} - update boiler
  updateGasBoiler: async (
    id: number,
    payload: GasBoilerUpdatePayload,
    token: string
  ): Promise<GasBoilerFullResponse> => {
    const response = await apiClient.put<GasBoilerFullResponse>(
      `/gasboiler/${id}`,
      payload,
      { headers: { Authorization: `Bearer ${token}` } }
    );
    return response.data;
  },

  // DELETE /gasboiler/{id} - delete boiler
  deleteGasBoiler: async (id: number, token: string): Promise<void> => {
    await apiClient.delete(
      `/gasboiler/${id}`,
      { headers: { Authorization: `Bearer ${token}` } }
    );
  },
};