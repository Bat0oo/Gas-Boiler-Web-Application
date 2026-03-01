export type AlarmType =
  | "INSUFFICIENT_CAPACITY"
  | "HIGH_INDOOR_TEMP"
  | "LOW_INDOOR_TEMP"
  | "HIGH_OUTDOOR_TEMP"
  | "LOW_OUTDOOR_TEMP"
  | "HIGH_DAILY_COST";

export type AlarmSeverity = "INFO" | "WARNING" | "CRITICAL";

export interface Alarm {
  id: number;
  type: AlarmType;
  severity: AlarmSeverity;
  message: string;
  details: string | null;
  createdAt: string;
  acknowledgedAt: string | null;
  resolvedAt: string | null;
  isActive: boolean;
  isAcknowledged: boolean;
  buildingId: number;
  buildingName: string;
}

export interface AlarmFilters {
  type?: AlarmType;
  severity?: AlarmSeverity;
  buildingId?: number;
  userId?: number;
  isActive?: boolean;
  isAcknowledged?: boolean;
  startDate?: string;
  endDate?: string;
}

export interface AlarmStats {
  totalAlarms: number;
  activeAlarms: number;
  acknowledgedAlarms: number;
  resolvedAlarms: number;
  byType: { [key: string]: number };
  bySeverity: { [key: string]: number };
}

export interface AlarmSettings {
  id: number;
  highIndoorTempThreshold: number;
  lowIndoorTempThreshold: number;
  highOutdoorTempThreshold: number;
  lowOutdoorTempThreshold: number;
  highDailyCostThreshold: number;
  capacityDeficitThreshold: number;
  alertCooldownMinutes: number;
  capacityAlertsEnabled: boolean;
  highIndoorTempAlertsEnabled: boolean;
  lowIndoorTempAlertsEnabled: boolean;
  highOutdoorTempAlertsEnabled: boolean;
  lowOutdoorTempAlertsEnabled: boolean;
  highCostAlertsEnabled: boolean;
  lastUpdated: string;
  updatedBy: string;
}

export interface UpdateAlarmSettings {
  highIndoorTempThreshold?: number;
  lowIndoorTempThreshold?: number;
  highOutdoorTempThreshold?: number;
  lowOutdoorTempThreshold?: number;
  highDailyCostThreshold?: number;
  capacityDeficitThreshold?: number;
  alertCooldownMinutes?: number;
  capacityAlertsEnabled?: boolean;
  highIndoorTempAlertsEnabled?: boolean;
  lowIndoorTempAlertsEnabled?: boolean;
  highOutdoorTempAlertsEnabled?: boolean;
  lowOutdoorTempAlertsEnabled?: boolean;
  highCostAlertsEnabled?: boolean;
}
