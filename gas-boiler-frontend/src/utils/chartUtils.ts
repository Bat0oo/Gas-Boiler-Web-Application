import { BuildingReading } from '../types/historicaldatatypes';
import {
  TemperatureDataPoint,
  PowerDataPoint,
  CostDataPoint,
  HeatLossDataPoint,
} from '../types/chartstypes';
import { format as formatDate, parseISO, isWithinInterval } from 'date-fns';

/**
 * Process historical readings into temperature chart data
 */
export const processTemperatureData = (
  readings: BuildingReading[]
): TemperatureDataPoint[] => {
  return readings.map((reading) => ({
    timestamp: reading.timestamp,
    indoorTemp: reading.indoorTemperature,
    outdoorTemp: reading.outdoorTemperature,
  }));
};

/**
 * Process historical readings into power chart data
 */
export const processPowerData = (
  readings: BuildingReading[]
): PowerDataPoint[] => {
  return readings.map((reading) => ({
    timestamp: reading.timestamp,
    requiredPower: reading.requiredPowerKw,
    availablePower: reading.availablePowerKw,
    hasCapacity: reading.hasSufficientCapacity,
  }));
};

/**
 * Process historical readings into daily cost data
 */
export const processCostData = (readings: BuildingReading[]): CostDataPoint[] => {
  // Group by date and sum costs
  const costByDate = new Map<string, number>();

  readings.forEach((reading) => {
    const date = formatDate(parseISO(reading.timestamp), 'yyyy-MM-dd');
    const currentCost = costByDate.get(date) || 0;
    costByDate.set(date, currentCost + reading.dailyCostEur);
  });

  // Convert to array and sort
  return Array.from(costByDate.entries())
    .map(([date, cost]) => ({ date, cost }))
    .sort((a, b) => a.date.localeCompare(b.date));
};

/**
 * Process historical readings into heat loss data
 */
export const processHeatLossData = (
  readings: BuildingReading[]
): HeatLossDataPoint[] => {
  return readings.map((reading) => ({
    timestamp: reading.timestamp,
    heatLossKw: reading.heatLossWatts / 1000, // Convert W to kW
  }));
};

/**
 * Filter readings by date range
 */
export const filterReadingsByDateRange = (
  readings: BuildingReading[],
  startDate: Date,
  endDate: Date
): BuildingReading[] => {
  return readings.filter((reading) => {
    const timestamp = parseISO(reading.timestamp);
    return isWithinInterval(timestamp, { start: startDate, end: endDate });
  });
};

/**
 * Get date range for preset options
 */
export const getDateRangeFromPreset = (
  preset: 'last7days' | 'last30days'
): { startDate: Date; endDate: Date } => {
  const endDate = new Date();
  const startDate = new Date();

  if (preset === 'last7days') {
    startDate.setDate(endDate.getDate() - 7);
  } else if (preset === 'last30days') {
    startDate.setDate(endDate.getDate() - 30);
  }

  return { startDate, endDate };
};

/**
 * Format timestamp for chart labels
 */
export const formatChartLabel = (
  timestamp: string,
  formatType: 'short' | 'long' = 'short'
): string => {
  const date = parseISO(timestamp);

  if (formatType === 'short') {
    return formatDate(date, 'MM/dd HH:mm');
  }
  return formatDate(date, 'MMM dd, yyyy HH:mm');
};

/**
 * Format date for daily charts
 */
export const formatDateLabel = (dateString: string): string => {
  const date = parseISO(dateString);
  return formatDate(date, 'MMM dd');
};

/**
 * Calculate average from array of numbers
 */
export const calculateAverage = (values: number[]): number => {
  if (values.length === 0) return 0;
  const sum = values.reduce((acc, val) => acc + val, 0);
  return sum / values.length;
};

/**
 * Find min and max from array of numbers
 */
export const findMinMax = (values: number[]): { min: number; max: number } => {
  if (values.length === 0) return { min: 0, max: 0 };
  return {
    min: Math.min(...values),
    max: Math.max(...values),
  };
};