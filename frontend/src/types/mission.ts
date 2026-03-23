// types/mission.ts

export interface SensorConfig {
  type: string;
  capabilities: string[];
  assignedTargets?: any[];
}

export interface UnitConfig {
  id: string;
  type: 'naval' | 'ground' | 'aerial';
  name: string;
  country?: string;
  classification?: string;
  sensors: SensorConfig[];
  armamento: string[];
  operaciones: string[];
  targets: any[];
  orig_trayectory?: { lat: number; lon: number };
  actual_trayectory?: { lat: number; lon: number };
  speed?: string;
  high?: string;
  unitData?: any;
  domain?: string;
}

export interface SelectedTask {
  domain: string;
  taskId: string;
  name: string;
  description: string;
  assignedToUnit?: string;
  assignedToUnitName?: string;
  requiresTarget?: boolean;
  requiresCoordinates?: boolean;
  requiresSensor?: boolean;
  requiresEffector?: boolean;
  icon?: React.ReactNode;
}

export interface Mission {
  id: string;
  name: string;
  description: string;
  status: 'active' | 'pending' | 'completed' | 'archived';
  priority: 'critical' | 'high' | 'medium' | 'low';
  startDate: Date;
  endDate?: Date;
  createdBy: string;
  assignedUsers?: string[];
  objects?: string[];
  tags?: string[];
  color?: string;
  units?: UnitConfig[];
  tasks?: SelectedTask[];
  coords?: string;
  video_feed?: string;
  createdAt: Date;
  updatedAt: Date;
  activityLog?: Array<{
    timestamp: Date;
    user: string;
    action: string;
    details: string;
  }>;
  notes?: string[];
}

export interface Operation {
  _id: string;
  name: string;
  description?: string;
  status: 'active' | 'pending' | 'completed' | 'archived';
  priority: 'critical' | 'high' | 'medium' | 'low';
  startDate: Date;
  endDate?: Date;
  createdBy: string;
  assignedUsers?: string[];
  tags?: string[];
  color?: string;
  missions?: any[];
  createdAt: Date;
  updatedAt: Date;
}