export interface Building {
  id: number;
  name: string;
  userId: number;
  latitude: number;
  longitude: number;
  heatingArea: number;
  height: number;
  volume: number;
  wallUValue: number;
  windowUValue: number;
  ceilingUValue: number;
  floorUValue: number;
  wallArea: number;
  windowArea: number;
  ceilingArea: number;
  floorArea: number;
  boilerCount: number;

  desiredTemperature: number;
  indoorTemperature?: number;
  currentTemperature?: number;
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

  desiredTemperature: number;
  indoorTemperature?: number;
  currentTemperature?: number;

  weatherDescription?: string;
}

export interface CreateBuildingPayload {
  name: string;
  latitude: number;
  longitude: number;
  heatingArea: number;
  height: number;
  desiredTemperature: number;
}

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

export interface HeatLossCalculation {
  // Individual heat losses (Watts)
  wallHeatLoss: number;
  windowHeatLoss: number;
  ceilingHeatLoss: number;
  floorHeatLoss: number;

  // Total heat loss
  totalHeatLossBeforeSafety: number;
  safetyFactor: number;
  totalHeatLoss: number;
  requiredPowerKw: number;

  // Temperature data
  indoorTemperature: number;
  outdoorTemperature: number;
  groundTemperature: number;
  temperatureDifference: number;

  // Cost calculations
  dailyEnergyKwh: number;
  dailyCostEur: number;
  monthlyCostEur: number;
  annualCostEur: number;

  // Efficiency & Price
  boilerEfficiency: number;
  gasPricePerKwh: number;

  // Capacity
  currentBoilerCapacityKw: number;
  hasSufficientCapacity: boolean;
  capacityDeficitKw: number;
}
