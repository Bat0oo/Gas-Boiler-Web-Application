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
  const sorted = [...readings].sort(
    (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
  );

  return sorted.map((reading) => ({
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
  const sorted = [...readings].sort(
    (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
  );

  return sorted.map((reading) => ({
    timestamp: reading.timestamp,
    requiredPower: reading.requiredPowerKw,
    availablePower: reading.availablePowerKw,
    hasCapacity: reading.hasSufficientCapacity,
    buildingId: reading.buildingId, // NEW!
    buildingName: reading.buildingName, // NEW!
  }));
};

/**
 * Process historical readings into daily cost data
 */
export const processCostData = (readings: BuildingReading[]): CostDataPoint[] => {
  const costByDate = new Map<string, number>();

  readings.forEach((reading) => {
    const date = formatDate(parseISO(reading.timestamp), 'yyyy-MM-dd');
    const currentCost = costByDate.get(date) || 0;
    costByDate.set(date, currentCost + reading.dailyCostEur);
  });

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
  const sorted = [...readings].sort(
    (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
  );

  return sorted.map((reading) => ({
    timestamp: reading.timestamp,
    heatLossKw: reading.heatLossWatts / 1000,
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
    return formatDate(date, 'MMM d, HH:mm');
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

/**
 * Limit number of data points for better chart readability
 */
export const limitDataPoints = <T,>(data: T[], maxPoints: number = 50): T[] => {
  if (data.length <= maxPoints) {
    return data;
  }

  const step = Math.ceil(data.length / maxPoints);
  return data.filter((_, index) => index % step === 0);
};