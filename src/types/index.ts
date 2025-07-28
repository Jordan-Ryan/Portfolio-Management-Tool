export interface Project {
  id: string;
  name: string;
  priority: number;
  color: string;
  startDate?: Date;
}

export interface PDTTeam {
  id: string;
  name: string;
  maxCapacity: number; // Percentage (e.g., 80 for 80%)
  color: string;
}

export interface WorkItem {
  id: string;
  name: string;
  projectId: string;
  pdtTeamId: string;
  startDate?: Date;
  endDate?: Date;
  duration: number; // weeks
  capacity: number; // Percentage of team capacity (e.g., 50 for 50%)
  completedPercentage: number; // 0-100
  dependencies: string[]; // IDs of predecessor work items
  successors: string[]; // IDs of successor work items
  isInBacklog: boolean;
  acknowledgedDependencies?: string[]; // IDs of dependencies that have been acknowledged
}

export interface Dependency {
  id: string;
  fromWorkItemId: string;
  toWorkItemId: string;
}

export interface CapacityData {
  pdtTeamId: string;
  weekIndex: number;
  capacityUsed: number;
  percentage: number;
}

export interface TimelinePosition {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface Alert {
  id: string;
  type: 'delay' | 'dependency' | 'capacity';
  workItemId?: string;
  pdtTeamId?: string;
  message: string;
  severity: 'warning' | 'error';
} 