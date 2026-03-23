// types/mission.ts
import { Mission as BaseMission } from '@/store/missionStore'; // Ajusta la ruta

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
  unitData?: any; // datos brutos de la unidad seleccionada
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

export interface Mission extends BaseMission {
  units?: UnitConfig[];
  tasks?: SelectedTask[];
  coords?: string;
  video_feed?: string;
}