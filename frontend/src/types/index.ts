// ============================================
// INTEL OPS PLATFORM - TYPES
// ============================================

// Auth Types
export type UserRole = 'admin' | 'analyst' | 'operator' | 'viewer';

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  avatar?: string;
  createdAt: Date;
  lastLogin?: Date;
  permissions: string[];
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  token?: string;
}

// Mission Types
export type MissionStatus = 'active' | 'archived' | 'pending' | 'completed';
export type MissionPriority = 'critical' | 'high' | 'medium' | 'low';

export interface Mission {
  id: string;
  name: string;
  description: string;
  status: MissionStatus;
  priority: MissionPriority;
  startDate: Date;
  endDate?: Date;
  createdBy: string;
  assignedUsers: string[];
  objects: string[];
  tags: string[];
  location?: GeoPoint;
  radius?: number;
  createdAt: Date;
  updatedAt: Date;
  activityLog: ActivityLogEntry[];
  notes: Note[];
  color: string;
}

// Object/Target Types
export type ObjectType = 'person' | 'vehicle' | 'vessel' | 'aircraft' | 'device' | 'organization' | 'location' | 'unknown';
export type ObjectStatus = 'active' | 'inactive' | 'flagged' | 'watchlisted' | 'archived';

export interface TargetObject {
  id: string;
  name: string;
  type: ObjectType;
  status: ObjectStatus;
  missions: string[];
  aliases: string[];
  description: string;
  metadata: ObjectMetadata;
  lastKnownLocation?: GeoPoint;
  lastSeenAt?: Date;
  createdAt: Date;
  updatedAt: Date;
  confidence: number;
  riskScore: number;
  tags: string[];
  relationships: string[];
  media: string[];
  notes: Note[];
  timeline: TimelineEvent[];
  predictions: Prediction[];
}

export interface ObjectMetadata {
  [key: string]: any;
  nationality?: string;
  dob?: string;
  identifiers?: string[];
  communications?: string[];
  associations?: string[];
  physicalDescription?: string;
  capabilities?: string[];
}

// Geographic Types
export interface GeoPoint {
  lat: number;
  lng: number;
  altitude?: number;
  accuracy?: number;
}

export interface GeoZone {
  id: string;
  name: string;
  type: 'circle' | 'polygon' | 'rectangle';
  coordinates: GeoPoint[];
  radius?: number;
  missionId: string;
  alertOnEnter: boolean;
  alertOnExit: boolean;
  color: string;
  createdAt: Date;
}

export interface TrackingPoint {
  id: string;
  objectId: string;
  location: GeoPoint;
  timestamp: Date;
  speed?: number;
  heading?: number;
  accuracy?: number;
  source: string;
  metadata?: any;
}

export interface TrackingPath {
  objectId: string;
  points: TrackingPoint[];
  startTime: Date;
  endTime: Date;
  totalDistance: number;
  averageSpeed: number;
  stops: StopPoint[];
}

export interface StopPoint {
  location: GeoPoint;
  startTime: Date;
  endTime: Date;
  duration: number;
}

// Event Types
export type EventType = 'sighting' | 'movement' | 'communication' | 'transaction' | 'alert' | 'prediction' | 'manual' | 'system';
export type EventSeverity = 'critical' | 'high' | 'medium' | 'low' | 'info';

export interface Event {
  id: string;
  type: EventType;
  severity: EventSeverity;
  title: string;
  description: string;
  timestamp: Date;
  missionId?: string;
  objectIds: string[];
  location?: GeoPoint;
  source: string;
  confidence: number;
  verified: boolean;
  verifiedBy?: string;
  tags: string[];
  media: string[];
  relatedEvents: string[];
  metadata?: any;
}

// Timeline Types
export interface TimelineEvent {
  id: string;
  timestamp: Date;
  type: EventType;
  title: string;
  description: string;
  location?: GeoPoint;
  confidence: number;
  source: string;
  metadata?: any;
}

// Media Types
export type MediaType = 'image' | 'video' | 'document' | 'audio';

export interface Media {
  id: string;
  type: MediaType;
  url: string;
  thumbnail?: string;
  filename: string;
  size: number;
  mimeType: string;
  uploadedBy: string;
  uploadedAt: Date;
  objectIds: string[];
  missionId?: string;
  eventId?: string;
  tags: string[];
  metadata?: any;
  analysis?: MediaAnalysis;
}

export interface MediaAnalysis {
  facesDetected?: number;
  objectsDetected?: string[];
  textExtracted?: string;
  locationInferred?: GeoPoint;
  timestampInferred?: Date;
  confidence: number;
}

// Relationship Types
export type RelationshipType = 'associate' | 'family' | 'colleague' | 'communication' | 'transaction' | 'movement' | 'ownership' | 'unknown';

export interface Relationship {
  id: string;
  sourceId: string;
  targetId: string;
  type: RelationshipType;
  strength: number;
  confidence: number;
  firstObserved: Date;
  lastObserved: Date;
  evidence: string[];
  metadata?: any;
}

// Graph Types
export interface GraphNode {
  id: string;
  type: 'object' | 'event' | 'location' | 'media' | 'mission';
  label: string;
  data: any;
  x?: number;
  y?: number;
  size?: number;
  color?: string;
  icon?: string;
}

export interface GraphEdge {
  id: string;
  source: string;
  target: string;
  type: RelationshipType;
  label?: string;
  weight: number;
  confidence: number;
  directed: boolean;
  color?: string;
}

export interface GraphData {
  nodes: GraphNode[];
  edges: GraphEdge[];
}

// Prediction Types
export type PredictionType = 'movement' | 'behavior' | 'anomaly' | 'encounter' | 'location';

export interface Prediction {
  id: string;
  objectId: string;
  type: PredictionType;
  title: string;
  description: string;
  confidence: number;
  predictedAt: Date;
  validUntil: Date;
  predictedLocation?: GeoPoint;
  predictedPath?: GeoPoint[];
  predictedTime?: Date;
  confidenceInterval?: number;
  factors: string[];
  model: string;
  accuracy?: number;
  status: 'pending' | 'confirmed' | 'rejected' | 'expired';
}

// Filter Types
export interface GlobalFilters {
  timeRange: {
    start: Date | null;
    end: Date | null;
  };
  missions: string[];
  objectTypes: ObjectType[];
  objectStatuses: ObjectStatus[];
  tags: string[];
  confidenceRange: [number, number];
  geographicArea: {
    center?: GeoPoint;
    radius?: number;
    polygon?: GeoPoint[];
  } | null;
  relationshipTypes: RelationshipType[];
  eventTypes: EventType[];
  severity: EventSeverity[];
}

// Search Types
export interface SearchResult {
  id: string;
  type: 'object' | 'mission' | 'event' | 'media' | 'location';
  title: string;
  subtitle?: string;
  description?: string;
  thumbnail?: string;
  relevance: number;
  data: any;
}

export interface SearchFilters {
  query: string;
  types: string[];
  dateRange?: { start: Date; end: Date };
  missions?: string[];
  tags?: string[];
  confidence?: number;
  location?: GeoPoint;
  radius?: number;
}

// Activity Log
export interface ActivityLogEntry {
  id: string;
  timestamp: Date;
  userId: string;
  userName: string;
  action: string;
  entityType: string;
  entityId: string;
  details: string;
  metadata?: any;
}

// Notes
export interface Note {
  id: string;
  content: string;
  createdBy: string;
  createdByName: string;
  createdAt: Date;
  updatedAt: Date;
  tags: string[];
  attachments: string[];
}

// Notification Types
export type NotificationType = 'alert' | 'info' | 'success' | 'warning';

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
  entityType?: string;
  entityId?: string;
  action?: string;
}

// UI Types
export type PanelSize = 'compact' | 'default' | 'expanded';
export type ViewMode = 'split' | 'full' | 'overlay';

export interface PanelState {
  id: string;
  isOpen: boolean;
  size: PanelSize;
  position: 'left' | 'right' | 'bottom' | 'floating';
}

export interface LayoutState {
  sidebarCollapsed: boolean;
  activePanel: string | null;
  panels: PanelState[];
  viewMode: ViewMode;
  fullscreen: boolean;
}

// Network Analysis Types
export interface NetworkMetrics {
  nodeId: string;
  degree: number;
  betweenness: number;
  closeness: number;
  eigenvector: number;
  clustering: number;
}

export interface NetworkFlow {
  source: string;
  target: string;
  volume: number;
  frequency: number;
  pattern: string;
}

export interface Community {
  id: string;
  nodes: string[];
  density: number;
  centralNode?: string;
  patterns: string[];
}

// Analytics Types
export interface TimeSeriesData {
  timestamp: Date;
  value: number;
  label?: string;
  category?: string;
}

export interface HeatmapData {
  lat: number;
  lng: number;
  weight: number;
  timestamp?: Date;
}

export interface PatternDetection {
  id: string;
  type: string;
  description: string;
  confidence: number;
  objects: string[];
  startTime: Date;
  endTime: Date;
  frequency: string;
  locations: GeoPoint[];
}

// Report Types
export interface Report {
  id: string;
  title: string;
  description: string;
  type: 'intelligence' | 'analysis' | 'summary' | 'custom';
  createdBy: string;
  createdAt: Date;
  missions: string[];
  objects: string[];
  sections: ReportSection[];
  format: 'pdf' | 'docx' | 'html';
  status: 'draft' | 'generated' | 'archived';
}

export interface ReportSection {
  id: string;
  title: string;
  type: 'text' | 'chart' | 'map' | 'timeline' | 'graph' | 'table' | 'media';
  content: any;
  order: number;
}

// Plugin Types
export interface Plugin {
  id: string;
  name: string;
  description: string;
  version: string;
  author: string;
  enabled: boolean;
  config: any;
  hooks: string[];
}

// Audit Log
export interface AuditEntry {
  id: string;
  timestamp: Date;
  userId: string;
  action: string;
  resource: string;
  resourceId: string;
  oldValue?: any;
  newValue?: any;
  ipAddress?: string;
  userAgent?: string;
}

// Command Palette
export interface Command {
  id: string;
  name: string;
  description: string;
  shortcut?: string;
  category: string;
  icon?: string;
  action: () => void;
  disabled?: boolean;
}

// Map Types
export type MapStyle = 'satellite' | 'streets' | 'dark' | 'light' | 'terrain';

export interface MapLayer {
  id: string;
  name: string;
  type: 'heatmap' | 'cluster' | 'path' | 'marker' | 'zone' | 'tile';
  visible: boolean;
  opacity: number;
  data: any;
  config: any;
}

export interface MapViewport {
  latitude: number;
  longitude: number;
  zoom: number;
  bearing: number;
  pitch: number;
}

// WebSocket Types
export interface WSMessage {
  type: 'tracking' | 'alert' | 'event' | 'notification' | 'command';
  payload: any;
  timestamp: Date;
  sender: string;
}

// API Response Types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  meta?: {
    page?: number;
    limit?: number;
    total?: number;
    hasMore?: boolean;
  };
}

// Export Types
export interface ExportOptions {
  format: 'json' | 'csv' | 'kml' | 'geojson' | 'pdf';
  include: string[];
  filters: Partial<GlobalFilters>;
  timestamp: Date;
}
