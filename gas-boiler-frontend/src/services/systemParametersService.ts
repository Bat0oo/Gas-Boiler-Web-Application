import apiClient from './apiService';

export interface SystemParameters {
  id: number;
  wallUValue: number;
  windowUValue: number;
  ceilingUValue: number;
  floorUValue: number;
  outdoorDesignTemp: number;
  groundTemp: number;
  gasPricePerKwh: number;
  windowToWallRatio: number;  
  safetyFactor: number;
  defaultBoilerEfficiency: number;

  thermalMassCoefficient: number;
  outdoorInfluenceFactor: number;
  temperatureTimeStepSeconds: number;

  lastUpdated: string;
  updatedBy: string;
}

export interface UpdateSystemParametersDto {
  wallUValue: number;
  windowUValue: number;
  ceilingUValue: number;
  floorUValue: number;
  outdoorDesignTemp: number;
  groundTemp: number;
  gasPricePerKwh: number;
  windowToWallRatio: number;  
  safetyFactor: number;
  defaultBoilerEfficiency: number;

  thermalMassCoefficient: number;
  outdoorInfluenceFactor: number;
  temperatureTimeStepSeconds: number;
}

export const systemParametersService = {

  async getParameters(): Promise<SystemParameters> {
    const response = await apiClient.get<SystemParameters>('/systemparameters');
    return response.data;
  },

  async updateParameters(params: UpdateSystemParametersDto): Promise<SystemParameters> {
    const response = await apiClient.put<{ message: string; data: SystemParameters }>(
      '/systemparameters',
      params
    );
    return response.data.data;
  },
};