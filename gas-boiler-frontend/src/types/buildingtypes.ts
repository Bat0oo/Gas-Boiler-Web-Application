export interface Building {
  id: number;
  name: string;
  userId: number;
  latitude: number;
  longitude: number;
  heatingArea: number;
  height: number;
  volume: number;
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
  
  currentTemperature?: number;
  weatherDescription?: string;
  weatherIcon?: string;
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

// SIMPLIFIED - Only user inputs!
export interface CreateBuildingPayload {
  name: string;
  latitude: number;
  longitude: number;
  heatingArea: number;
  height: number;
  desiredTemperature: number;
  // U-values and surface areas are auto-calculated in backend!
}

// Update still includes all fields (for editing existing buildings)
export interface UpdateBuildingPayload {
  name: string;
  latitude: number;
  longitude: number;
  heatingArea: number;
  height: number;
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