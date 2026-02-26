export interface DashboardStats {
  totalBuildings: number;
  totalHeatingArea: number;
  totalBoilers: number;
  totalBoilerCapacity: number;
  estimatedTotalDailyCost: number;
  estimatedTotalMonthlyCost: number;
  estimatedTotalAnnualCost: number;
  totalRequiredPower: number;
  buildingsWithInsufficientCapacity: number;
  recentActivities: RecentActivity[];
}

export interface RecentActivity {
  type: string;
  description: string;
  timestamp: string;
}
