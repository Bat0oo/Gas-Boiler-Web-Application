export interface ChartDataPoint {
  timestamp: string;
  value: number;
  label?: string;
}

export interface TemperatureDataPoint {
  timestamp: string;
  indoorTemp: number;
  outdoorTemp: number;
}

export interface PowerDataPoint {
  timestamp: string;
  requiredPower: number;
  availablePower: number;
  hasCapacity: boolean;
  buildingId?: number; 
  buildingName?: string; 
}

export interface CostDataPoint {
  date: string;
  cost: number;
}

export interface HeatLossDataPoint {
  timestamp: string;
  heatLossKw: number;
}

export type DateRangeOption = 'last7days' | 'last30days' | 'custom';

export interface ChartFilters {
  buildingId: number | null;
  dateRange: DateRangeOption;
  startDate: Date | null;
  endDate: Date | null;
}

export interface BuildingCapacityIssue {
  buildingId: number;
  buildingName: string;
  issueCount: number;
  worstDeficit: number;
  issues: {
    timestamp: string;
    requiredPower: number;
    availablePower: number;
    deficit: number;
  }[];
}