export interface DataManagementSettings {
  id: number;
  recordingIntervalMinutes: number;
  lastUpdated: string;
  updatedBy: string;
}

export interface UpdateDataManagementSettings {
  recordingIntervalMinutes: number;
}

export interface DataStatistics {
  totalReadings: number;
  totalBuildings: number;
  oldestReading: string | null;
  newestReading: string | null;
  dateRange: string;
}

export interface IntervalOption {
  label: string;
  value: number;
  description?: string;
}
