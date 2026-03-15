// lib/missionConstants.ts
import React from 'react';
import {
  Radio, Activity, BarChart3, Settings, Navigation, MapPin, Crosshair, Compass,
  Target, Eye, EyeOff, Radar, Search, Plane, AlertTriangle, Edit2, X, ArrowRight,
  ListChecks, Shield, BarChart, Layers, Link, ShieldAlert, Flag, AlertCircle,
  XCircle, Bell, Zap, CheckCircle, Play, Pause, StopCircle, CheckSquare,
  Database, Download, FileText, Globe, Power, Key, Clock, RadioReceiver,
  Camera, Satellite, Cpu, Wifi, Ship, Shield as ShieldIcon
} from 'lucide-react';

export type DomainType =
  | 'node_management'
  | 'positioning'
  | 'surveillance'
  | 'detection'
  | 'tracking'
  | 'identification'
  | 'fusion'
  | 'alert'
  | 'intervention'
  | 'assessment'
  | 'mission_management'
  | 'configuration'
  | 'interoperability'
  | 'security';

// Definir DOMAIN_TASKS (puedes copiarlo de tu antiguo TaskForm, pero aquí solo pondré un ejemplo)
export const DOMAIN_TASKS: Record<DomainType, Array<{
  id: string;
  name: string;
  description: string;
  requiresTarget?: boolean;
  requiresCoordinates?: boolean;
  requiresSensor?: boolean;
  requiresEffector?: boolean;
  icon: React.ReactNode; // Aquí sí podemos poner JSX porque es un componente
}>> = {
  // ... completa con todos los dominios (por brevedad, pondré solo uno)
  surveillance: [
    { id: 'start_surveillance', name: 'Start Surveillance', description: 'Comenzar vigilancia continua', icon: <Eye size={16} />, requiresSensor: true },
    { id: 'stop_surveillance', name: 'Stop Surveillance', description: 'Detener vigilancia', icon: <EyeOff size={16} />, requiresSensor: true },
    // ... resto
  ],
  // ... otros dominios
};

export const DOMAIN_NAMES: Record<DomainType, string> = {
  node_management: 'Gestión y control del nodo',
  positioning: 'Tareas de posicionamiento y orientación',
  surveillance: 'Tareas de vigilancia y búsqueda',
  detection: 'Tareas de detección',
  tracking: 'Tareas de seguimiento (Tracking)',
  identification: 'Tareas de identificación y clasificación',
  fusion: 'Tareas de fusión y correlación (C2 / Fusion Nodes)',
  alert: 'Tareas de alerta y notificación',
  intervention: 'Tareas de intervención / efectores',
  assessment: 'Tareas de evaluación post-acción',
  mission_management: 'Tareas de gestión de misión',
  configuration: 'Tareas de configuración y mantenimiento',
  interoperability: 'Tareas de interoperabilidad',
  security: 'Tareas de cierre y seguridad',
};

export const UNIT_DOMAIN_MAPPING: Record<string, DomainType[]> = {
  naval: ['surveillance', 'detection', 'tracking', 'identification', 'intervention', 'positioning'],
  ground: ['surveillance', 'detection', 'tracking', 'identification', 'intervention', 'positioning'],
  aerial: ['surveillance', 'detection', 'tracking', 'identification', 'intervention', 'positioning', 'node_management'],
};

export const UNIT_SENSOR_CONFIGS = {
  naval: [
    { type: 'RADAR', capabilities: ['Vigilancia de superficie', 'Vigilancia aérea', 'Control de fuego'], icon: 'Radar' },
    { type: 'AIS', capabilities: ['Identificación de buques', 'Seguimiento automático'], icon: 'Satellite' },
    { type: 'EO/IR', capabilities: ['Detección Objeto', 'Seguimiento (Tracking)', 'Identificación visual'], icon: 'Camera' },
    { type: 'SONAR', capabilities: ['Detección submarina', 'Clasificación de contactos'], icon: 'Radio' },
    { type: 'ESM', capabilities: ['Guerra electrónica', 'Análisis de señales'], icon: 'Cpu' }
  ],
  ground: [
    { type: 'RADAR', capabilities: ['Vigilancia terrestre', 'Detección de movimiento'], icon: 'Radar' },
    { type: 'EO/IR', capabilities: ['Observación diurna/nocturna', 'Designación láser'], icon: 'Camera' },
    { type: 'DF/RF', capabilities: ['Dirección de frecuencia', 'Análisis de señales'], icon: 'Radio' },
    { type: 'COMINT', capabilities: ['Interceptación de comunicaciones'], icon: 'Wifi' }
  ],
  aerial: [
    { type: 'RADAR', capabilities: ['Búsqueda aérea', 'Seguimiento múltiple'], icon: 'Radar' },
    { type: 'EO/IR', capabilities: ['Detección Objeto', 'Seguimiento (Tracking)'], icon: 'Camera' },
    { type: 'SIGINT', capabilities: ['Inteligencia de señales', 'Guerra electrónica'], icon: 'Database' },
    { type: 'ELINT', capabilities: ['Inteligencia electrónica'], icon: 'Cpu' }
  ]
};

// Configuraciones de armamento: ahora icon es un string (nombre del icono)
export const UNIT_ARMAMENT_CONFIGS = {
  naval: [
    { name: 'Misiles superficie-superficie', iconName: 'Zap' },
    { name: 'Misiles superficie-aire', iconName: 'Plane' },
    { name: 'Cañón naval 76mm/127mm', iconName: 'Target' },
    { name: 'Armamento antiaéreo CIWS', iconName: 'ShieldAlert' },
    { name: 'Torpedos', iconName: 'Radio' },
    { name: 'Sistema de contramedidas', iconName: 'Shield' },
    { name: 'Cañones automáticos 20mm/30mm', iconName: 'Target' },
    { name: 'Lanzadores de señuelos', iconName: 'AlertTriangle' }
  ],
  ground: [
    { name: 'Artillería', iconName: 'Target' },
    { name: 'Misiles antitanque', iconName: 'Zap' },
    { name: 'Armamento portátil', iconName: 'Shield' },
    { name: 'Sistema de defensa aérea', iconName: 'Plane' },
    { name: 'Vehículos blindados', iconName: 'Shield' },
    { name: 'Morteros', iconName: 'Target' },
    { name: 'Munición guiada', iconName: 'Crosshair' }
  ],
  aerial: [
    { name: 'Misiles aire-aire', iconName: 'Plane' },
    { name: 'Misiles aire-superficie', iconName: 'Target' },
    { name: 'Bombas guiadas', iconName: 'Target' },
    { name: 'Cañón rotativo', iconName: 'Zap' },
    { name: 'Sistemas de guerra electrónica', iconName: 'Cpu' },
    { name: 'Misiles de crucero', iconName: 'Navigation' },
    { name: 'Bombas de racimo', iconName: 'Target' }
  ]
};

export const UNIT_OPERATIONS_CONFIGS = {
  naval: [
    'Patrulla marítima',
    'Vigilancia costera',
    'Interdicción marítima',
    'Protección de convoy',
    'Operaciones anfibias',
    'Guerra antisubmarina',
    'Defensa antiaérea'
  ],
  ground: [
    'Reconocimiento terrestre',
    'Control de área',
    'Defensa de posición',
    'Ataque coordinado',
    'Operaciones especiales',
    'Protección de infraestructuras'
  ],
  aerial: [
    'Patrulla aérea',
    'Vigilancia aérea',
    'Interceptación',
    'Apoyo aéreo cercano',
    'Reabastecimiento en vuelo',
    'Evacuación médica'
  ]
};

// Función para obtener el componente de icono por nombre
export const getIcon = (iconName: string, size: number = 16) => {
  const props = { size, className: "inline-block" };
  switch (iconName) {
    case 'Zap': return <Zap {...props} />;
    case 'Plane': return <Plane {...props} />;
    case 'Target': return <Target {...props} />;
    case 'ShieldAlert': return <ShieldAlert {...props} />;
    case 'Radio': return <Radio {...props} />;
    case 'Shield': return <ShieldIcon {...props} />;
    case 'AlertTriangle': return <AlertTriangle {...props} />;
    case 'Crosshair': return <Crosshair {...props} />;
    case 'Navigation': return <Navigation {...props} />;
    case 'Cpu': return <Cpu {...props} />;
    // Sensores
    case 'Radar': return <Radar {...props} />;
    case 'Camera': return <Camera {...props} />;
    case 'Satellite': return <Satellite {...props} />;
    case 'Wifi': return <Wifi {...props} />;
    case 'Database': return <Database {...props} />;
    case 'RadioReceiver': return <RadioReceiver {...props} />;
    default: return null;
  }
};

// Iconos por tipo de unidad (para usar en la UI)
export const UNIT_TYPE_ICONS = {
  naval: <Ship className="w-5 h-5" />,
  ground: <ShieldIcon className="w-5 h-5" />,
  aerial: <Plane className="w-5 h-5" />
};

// También puedes exportar una función para obtener icono de sensor
export const getSensorIcon = (iconName: string) => getIcon(iconName, 16);