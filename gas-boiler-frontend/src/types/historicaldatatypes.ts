export interface BuildingReading {
  id: number;
  buildingId: number;
  buildingName: string;
  timestamp: string; // ISO date string
  indoorTemperature: number;
  outdoorTemperature: number;
  temperatureDifference: number;
  heatLossWatts: number;
  requiredPowerKw: number;
  availablePowerKw: number;
  hasSufficientCapacity: boolean;
  dailyCostEur: number;
}

export interface SeedHistoricalDataResponse {
  message: string;
  readingsGenerated: number;
  buildingsProcessed: number;
  daysGenerated: number;
}