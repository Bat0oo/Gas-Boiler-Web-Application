export interface Building {
  id: number;
  name: string;
  userId: number;
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
  boilerCount: number;
}

export interface BuildingDetail extends Building {
  gasBoilers: BuildingBoiler[];
}

export interface BuildingBoiler {
  id: number;
  name: string;
  maxPower: number;
  efficiency: number;
  currentPower: number;
}

export interface BuildingMapPoint {
  id: number;
  name: string;
  latitude: number;
  longitude: number;
  boilerCount: number;
  totalMaxPower: number;
  totalCurrentPower: number;
}

export interface CreateBuildingPayload {
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
}

export interface UpdateBuildingPayload extends CreateBuildingPayload {}