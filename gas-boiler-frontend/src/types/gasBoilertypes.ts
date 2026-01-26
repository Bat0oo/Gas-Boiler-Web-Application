export interface GasBoiler {
  id: number;
  name: string;
  maxPower: number;
  efficiency: number;
  currentPower: number;
  userId: number;
  userName?: string;
  buildingObjectId: number;
  buildingName?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateGasBoilerPayload {
  name: string;
  maxPower: number;
  efficiency: number;
  currentPower: number;
  buildingObjectId: number;
}

export interface UpdateGasBoilerPayload {
  name: string;
  maxPower: number;
  efficiency: number;
  currentPower: number;
}