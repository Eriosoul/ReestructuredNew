// ============================================
// INTEL OPS PLATFORM - GLOBAL STATE STORE
// ============================================

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';
import type {
  User,
  AuthState,
  Mission,
  TargetObject,
  Event,
  Media,
  Relationship,
  Prediction,
  GlobalFilters,
  Notification,
  LayoutState,
  PanelState,
  PanelSize,
  MapViewport,
  MapLayer,
  GraphData,
  SearchResult,
  TrackingPoint,
  GeoZone,
  ActivityLogEntry,
  Note,
} from '@/types';

// ============================================
// AUTH STORE
// ============================================
interface AuthStore extends AuthState {
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  register: (email: string, password: string, name: string) => Promise<void>;
  updateUser: (user: Partial<User>) => void;
  resetPassword: (email: string) => Promise<void>;
  setToken: (token: string) => void;
}

export const useAuthStore = create<AuthStore>()(
  persist(
    immer((set) => ({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      token: undefined,

      login: async (email: string, password: string) => {
        set((state) => {
          state.isLoading = true;
        });
        // Mock login - would call API
        await new Promise((resolve) => setTimeout(resolve, 1000));
        set((state) => {
          state.user = {
            id: '1',
            email,
            name: 'Admin User',
            role: 'admin',
            permissions: ['*'],
            createdAt: new Date(),
          };
          state.isAuthenticated = true;
          state.isLoading = false;
        });
      },

      logout: () => {
        set((state) => {
          state.user = null;
          state.isAuthenticated = false;
          state.token = undefined;
        });
      },

      register: async (email: string, password: string, name: string) => {
        set((state) => {
          state.isLoading = true;
        });
        await new Promise((resolve) => setTimeout(resolve, 1000));
        set((state) => {
          state.user = {
            id: '2',
            email,
            name,
            role: 'analyst',
            permissions: ['read', 'write'],
            createdAt: new Date(),
          };
          state.isAuthenticated = true;
          state.isLoading = false;
        });
      },

      updateUser: (userData: Partial<User>) => {
        set((state) => {
          if (state.user) {
            Object.assign(state.user, userData);
          }
        });
      },

      resetPassword: async (email: string) => {
        await new Promise((resolve) => setTimeout(resolve, 500));
        // Mock password reset
      },

      setToken: (token: string) => {
        set((state) => {
          state.token = token;
        });
      },
    })),
    {
      name: 'auth-storage',
      partialize: (state) => ({ user: state.user, token: state.token }),
    }
  )
);

// ============================================
// GLOBAL FILTERS STORE
// ============================================
interface FilterStore {
  filters: GlobalFilters;
  setTimeRange: (start: Date | null, end: Date | null) => void;
  setMissions: (missions: string[]) => void;
  setObjectTypes: (types: string[]) => void;
  setObjectStatuses: (statuses: string[]) => void;
  setTags: (tags: string[]) => void;
  setConfidenceRange: (range: [number, number]) => void;
  setGeographicArea: (area: GlobalFilters['geographicArea']) => void;
  setRelationshipTypes: (types: string[]) => void;
  setEventTypes: (types: string[]) => void;
  setSeverity: (severity: string[]) => void;
  resetFilters: () => void;
  applyPreset: (preset: string) => void;
}

const defaultFilters: GlobalFilters = {
  timeRange: { start: null, end: null },
  missions: [],
  objectTypes: [],
  objectStatuses: [],
  tags: [],
  confidenceRange: [0, 100],
  geographicArea: null,
  relationshipTypes: [],
  eventTypes: [],
  severity: [],
};

export const useFilterStore = create<FilterStore>()(
  immer((set) => ({
    filters: defaultFilters,

    setTimeRange: (start, end) => {
      set((state) => {
        state.filters.timeRange = { start, end };
      });
    },

    setMissions: (missions) => {
      set((state) => {
        state.filters.missions = missions;
      });
    },

    setObjectTypes: (types) => {
      set((state) => {
        state.filters.objectTypes = types as any;
      });
    },

    setObjectStatuses: (statuses) => {
      set((state) => {
        state.filters.objectStatuses = statuses as any;
      });
    },

    setTags: (tags) => {
      set((state) => {
        state.filters.tags = tags;
      });
    },

    setConfidenceRange: (range) => {
      set((state) => {
        state.filters.confidenceRange = range;
      });
    },

    setGeographicArea: (area) => {
      set((state) => {
        state.filters.geographicArea = area;
      });
    },

    setRelationshipTypes: (types) => {
      set((state) => {
        state.filters.relationshipTypes = types as any;
      });
    },

    setEventTypes: (types) => {
      set((state) => {
        state.filters.eventTypes = types as any;
      });
    },

    setSeverity: (severity) => {
      set((state) => {
        state.filters.severity = severity as any;
      });
    },

    resetFilters: () => {
      set((state) => {
        state.filters = defaultFilters;
      });
    },

    applyPreset: (preset) => {
      const presets: Record<string, Partial<GlobalFilters>> = {
        'last-24h': {
          timeRange: {
            start: new Date(Date.now() - 24 * 60 * 60 * 1000),
            end: new Date(),
          },
        },
        'last-7d': {
          timeRange: {
            start: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
            end: new Date(),
          },
        },
        'high-confidence': {
          confidenceRange: [80, 100],
        },
        'active-only': {
          objectStatuses: ['active'],
        },
        'critical-alerts': {
          severity: ['critical', 'high'],
        },
      };

      set((state) => {
        Object.assign(state.filters, presets[preset] || {});
      });
    },
  }))
);

// ============================================
// MISSION STORE
// ============================================
interface MissionStore {
  missions: Mission[];
  activeMission: Mission | null;
  selectedMissions: string[];
  setMissions: (missions: Mission[]) => void;
  addMission: (mission: Mission) => void;
  updateMission: (id: string, updates: Partial<Mission>) => void;
  deleteMission: (id: string) => void;
  setActiveMission: (mission: Mission | null) => void;
  toggleMissionSelection: (id: string) => void;
  addActivityLog: (missionId: string, entry: ActivityLogEntry) => void;
  addNote: (missionId: string, note: Note) => void;
}

export const useMissionStore = create<MissionStore>()(
  immer((set) => ({
    missions: [],
    activeMission: null,
    selectedMissions: [],

    setMissions: (missions) => {
      set((state) => {
        state.missions = missions;
      });
    },

    addMission: (mission) => {
      set((state) => {
        state.missions.push(mission);
      });
    },

    updateMission: (id, updates) => {
      set((state) => {
        const mission = state.missions.find((m) => m.id === id);
        if (mission) {
          Object.assign(mission, updates, { updatedAt: new Date() });
        }
      });
    },

    deleteMission: (id) => {
      set((state) => {
        state.missions = state.missions.filter((m) => m.id !== id);
        if (state.activeMission?.id === id) {
          state.activeMission = null;
        }
      });
    },

    setActiveMission: (mission) => {
      set((state) => {
        state.activeMission = mission;
      });
    },

    toggleMissionSelection: (id) => {
      set((state) => {
        const idx = state.selectedMissions.indexOf(id);
        if (idx > -1) {
          state.selectedMissions.splice(idx, 1);
        } else {
          state.selectedMissions.push(id);
        }
      });
    },

    addActivityLog: (missionId, entry) => {
      set((state) => {
        const mission = state.missions.find((m) => m.id === missionId);
        if (mission) {
          mission.activityLog.unshift(entry);
        }
      });
    },

    addNote: (missionId, note) => {
      set((state) => {
        const mission = state.missions.find((m) => m.id === missionId);
        if (mission) {
          mission.notes.unshift(note);
        }
      });
    },
  }))
);

// ============================================
// OBJECT STORE
// ============================================
interface ObjectStore {
  objects: TargetObject[];
  selectedObject: TargetObject | null;
  watchlist: string[];
  setObjects: (objects: TargetObject[]) => void;
  addObject: (object: TargetObject) => void;
  updateObject: (id: string, updates: Partial<TargetObject>) => void;
  deleteObject: (id: string) => void;
  setSelectedObject: (object: TargetObject | null) => void;
  addToWatchlist: (id: string) => void;
  removeFromWatchlist: (id: string) => void;
  addTimelineEvent: (objectId: string, event: any) => void;
  addPrediction: (objectId: string, prediction: Prediction) => void;
  updateLastLocation: (objectId: string, location: any) => void;
}

export const useObjectStore = create<ObjectStore>()(
  immer((set) => ({
    objects: [],
    selectedObject: null,
    watchlist: [],

    setObjects: (objects) => {
      set((state) => {
        state.objects = objects;
      });
    },

    addObject: (object) => {
      set((state) => {
        state.objects.push(object);
      });
    },

    updateObject: (id, updates) => {
      set((state) => {
        const obj = state.objects.find((o) => o.id === id);
        if (obj) {
          Object.assign(obj, updates, { updatedAt: new Date() });
        }
      });
    },

    deleteObject: (id) => {
      set((state) => {
        state.objects = state.objects.filter((o) => o.id !== id);
        if (state.selectedObject?.id === id) {
          state.selectedObject = null;
        }
      });
    },

    setSelectedObject: (object) => {
      set((state) => {
        state.selectedObject = object;
      });
    },

    addToWatchlist: (id) => {
      set((state) => {
        if (!state.watchlist.includes(id)) {
          state.watchlist.push(id);
        }
        const obj = state.objects.find((o) => o.id === id);
        if (obj) {
          obj.status = 'watchlisted';
        }
      });
    },

    removeFromWatchlist: (id) => {
      set((state) => {
        state.watchlist = state.watchlist.filter((w) => w !== id);
        const obj = state.objects.find((o) => o.id === id);
        if (obj) {
          obj.status = 'active';
        }
      });
    },

    addTimelineEvent: (objectId, event) => {
      set((state) => {
        const obj = state.objects.find((o) => o.id === objectId);
        if (obj) {
          obj.timeline.unshift(event);
        }
      });
    },

    addPrediction: (objectId, prediction) => {
      set((state) => {
        const obj = state.objects.find((o) => o.id === objectId);
        if (obj) {
          obj.predictions.unshift(prediction);
        }
      });
    },

    updateLastLocation: (objectId, location) => {
      set((state) => {
        const obj = state.objects.find((o) => o.id === objectId);
        if (obj) {
          obj.lastKnownLocation = location;
          obj.lastSeenAt = new Date();
        }
      });
    },
  }))
);

// ============================================
// EVENT STORE
// ============================================
interface EventStore {
  events: Event[];
  selectedEvent: Event | null;
  unreadCount: number;
  setEvents: (events: Event[]) => void;
  addEvent: (event: Event) => void;
  updateEvent: (id: string, updates: Partial<Event>) => void;
  deleteEvent: (id: string) => void;
  setSelectedEvent: (event: Event | null) => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  getEventsByObject: (objectId: string) => Event[];
  getEventsByMission: (missionId: string) => Event[];
}

export const useEventStore = create<EventStore>()(
  immer((set, get) => ({
    events: [],
    selectedEvent: null,
    unreadCount: 0,

    setEvents: (events) => {
      set((state) => {
        state.events = events;
      });
    },

    addEvent: (event) => {
      set((state) => {
        state.events.unshift(event);
        state.unreadCount++;
      });
    },

    updateEvent: (id, updates) => {
      set((state) => {
        const evt = state.events.find((e) => e.id === id);
        if (evt) {
          Object.assign(evt, updates);
        }
      });
    },

    deleteEvent: (id) => {
      set((state) => {
        state.events = state.events.filter((e) => e.id !== id);
      });
    },

    setSelectedEvent: (event) => {
      set((state) => {
        state.selectedEvent = event;
      });
    },

    markAsRead: (id) => {
      set((state) => {
        const evt = state.events.find((e) => e.id === id);
        if (evt && !evt.verified) {
          evt.verified = true;
          state.unreadCount = Math.max(0, state.unreadCount - 1);
        }
      });
    },

    markAllAsRead: () => {
      set((state) => {
        state.events.forEach((e) => {
          e.verified = true;
        });
        state.unreadCount = 0;
      });
    },

    getEventsByObject: (objectId) => {
      return get().events.filter((e) => e.objectIds.includes(objectId));
    },

    getEventsByMission: (missionId) => {
      return get().events.filter((e) => e.missionId === missionId);
    },
  }))
);

// ============================================
// MAP STORE
// ============================================
interface MapStore {
  viewport: MapViewport;
  layers: MapLayer[];
  trackingPoints: TrackingPoint[];
  zones: GeoZone[];
  selectedPoint: TrackingPoint | null;
  playbackState: {
    isPlaying: boolean;
    currentTime: Date | null;
    speed: number;
  };
  mapStyle: string;
  setViewport: (viewport: Partial<MapViewport>) => void;
  setMapStyle: (style: string) => void;
  addLayer: (layer: MapLayer) => void;
  removeLayer: (id: string) => void;
  toggleLayer: (id: string) => void;
  setTrackingPoints: (points: TrackingPoint[]) => void;
  addTrackingPoint: (point: TrackingPoint) => void;
  setZones: (zones: GeoZone[]) => void;
  addZone: (zone: GeoZone) => void;
  setSelectedPoint: (point: TrackingPoint | null) => void;
  setPlaybackState: (state: Partial<MapStore['playbackState']>) => void;
  flyTo: (lat: number, lng: number, zoom?: number) => void;
}

export const useMapStore = create<MapStore>()(
  immer((set) => ({
    viewport: {
      latitude: 40.7128,
      longitude: -74.006,
      zoom: 10,
      bearing: 0,
      pitch: 0,
    },
    layers: [],
    trackingPoints: [],
    zones: [],
    selectedPoint: null,
    playbackState: {
      isPlaying: false,
      currentTime: null,
      speed: 1,
    },
    mapStyle: 'mapbox://styles/mapbox/dark-v11',

    setViewport: (viewport) => {
      set((state) => {
        Object.assign(state.viewport, viewport);
      });
    },

    setMapStyle: (style) => {
      set((state) => {
        state.mapStyle = style;
      });
    },

    addLayer: (layer) => {
      set((state) => {
        state.layers.push(layer);
      });
    },

    removeLayer: (id) => {
      set((state) => {
        state.layers = state.layers.filter((l) => l.id !== id);
      });
    },

    toggleLayer: (id) => {
      set((state) => {
        const layer = state.layers.find((l) => l.id === id);
        if (layer) {
          layer.visible = !layer.visible;
        }
      });
    },

    setTrackingPoints: (points) => {
      set((state) => {
        state.trackingPoints = points;
      });
    },

    addTrackingPoint: (point) => {
      set((state) => {
        state.trackingPoints.push(point);
      });
    },

    setZones: (zones) => {
      set((state) => {
        state.zones = zones;
      });
    },

    addZone: (zone) => {
      set((state) => {
        state.zones.push(zone);
      });
    },

    setSelectedPoint: (point) => {
      set((state) => {
        state.selectedPoint = point;
      });
    },

    setPlaybackState: (playbackState) => {
      set((state) => {
        Object.assign(state.playbackState, playbackState);
      });
    },

    flyTo: (lat, lng, zoom = 14) => {
      set((state) => {
        state.viewport.latitude = lat;
        state.viewport.longitude = lng;
        state.viewport.zoom = zoom;
      });
    },
  }))
);

// ============================================
// GRAPH STORE
// ============================================
interface GraphStore {
  graphData: GraphData;
  selectedNode: string | null;
  selectedEdge: string | null;
  layout: 'force' | 'hierarchical' | 'circular' | 'grid';
  filters: {
    minConfidence: number;
    nodeTypes: string[];
    edgeTypes: string[];
    showLabels: boolean;
  };
  setGraphData: (data: GraphData) => void;
  addNode: (node: any) => void;
  addEdge: (edge: any) => void;
  removeNode: (id: string) => void;
  removeEdge: (id: string) => void;
  setSelectedNode: (id: string | null) => void;
  setSelectedEdge: (id: string | null) => void;
  setLayout: (layout: GraphStore['layout']) => void;
  expandNode: (id: string) => void;
  collapseNode: (id: string) => void;
  findPath: (source: string, target: string) => string[];
  setFilters: (filters: Partial<GraphStore['filters']>) => void;
}

export const useGraphStore = create<GraphStore>()(
  immer((set, get) => ({
    graphData: { nodes: [], edges: [] },
    selectedNode: null,
    selectedEdge: null,
    layout: 'force',
    filters: {
      minConfidence: 0,
      nodeTypes: [],
      edgeTypes: [],
      showLabels: true,
    },

    setGraphData: (data) => {
      set((state) => {
        state.graphData = data;
      });
    },

    addNode: (node) => {
      set((state) => {
        state.graphData.nodes.push(node);
      });
    },

    addEdge: (edge) => {
      set((state) => {
        state.graphData.edges.push(edge);
      });
    },

    removeNode: (id) => {
      set((state) => {
        state.graphData.nodes = state.graphData.nodes.filter((n) => n.id !== id);
        state.graphData.edges = state.graphData.edges.filter(
          (e) => e.source !== id && e.target !== id
        );
      });
    },

    removeEdge: (id) => {
      set((state) => {
        state.graphData.edges = state.graphData.edges.filter((e) => e.id !== id);
      });
    },

    setSelectedNode: (id) => {
      set((state) => {
        state.selectedNode = id;
      });
    },

    setSelectedEdge: (id) => {
      set((state) => {
        state.selectedEdge = id;
      });
    },

    setLayout: (layout) => {
      set((state) => {
        state.layout = layout;
      });
    },

    expandNode: (id) => {
      // Would fetch related nodes from API
    },

    collapseNode: (id) => {
      set((state) => {
        // Remove child nodes
        const childEdges = state.graphData.edges.filter((e) => e.source === id);
        const childIds = childEdges.map((e) => e.target);
        state.graphData.nodes = state.graphData.nodes.filter(
          (n) => !childIds.includes(n.id)
        );
        state.graphData.edges = state.graphData.edges.filter(
          (e) => !childIds.includes(e.source) && !childIds.includes(e.target)
        );
      });
    },

    findPath: (source, target) => {
      // BFS path finding
      const { edges } = get().graphData;
      const adj: Record<string, string[]> = {};
      edges.forEach((e) => {
        if (!adj[e.source]) adj[e.source] = [];
        adj[e.source].push(e.target);
      });

      const queue: [string, string[]][] = [[source, [source]]];
      const visited = new Set([source]);

      while (queue.length) {
        const [curr, path] = queue.shift()!;
        if (curr === target) return path;

        for (const next of adj[curr] || []) {
          if (!visited.has(next)) {
            visited.add(next);
            queue.push([next, [...path, next]]);
          }
        }
      }
      return [];
    },

    setFilters: (filters) => {
      set((state) => {
        Object.assign(state.filters, filters);
      });
    },
  }))
);

// ============================================
// SEARCH STORE
// ============================================
interface SearchStore {
  query: string;
  results: SearchResult[];
  isSearching: boolean;
  recentSearches: string[];
  filters: {
    types: string[];
    dateRange?: { start: Date; end: Date };
    missions?: string[];
    tags?: string[];
    confidence?: number;
  };
  setQuery: (query: string) => void;
  search: (query: string) => Promise<void>;
  clearSearch: () => void;
  setFilters: (filters: Partial<SearchStore['filters']>) => void;
  addRecentSearch: (query: string) => void;
  clearRecentSearches: () => void;
}

export const useSearchStore = create<SearchStore>()(
  immer((set) => ({
    query: '',
    results: [],
    isSearching: false,
    recentSearches: [],
    filters: {
      types: [],
    },

    setQuery: (query) => {
      set((state) => {
        state.query = query;
      });
    },

    search: async (query) => {
      set((state) => {
        state.isSearching = true;
        state.query = query;
      });

      // Mock search - would call API
      await new Promise((resolve) => setTimeout(resolve, 500));

      set((state) => {
        state.isSearching = false;
        state.results = []; // Would be populated from API
        if (query) {
          state.recentSearches.unshift(query);
          state.recentSearches = state.recentSearches.slice(0, 10);
        }
      });
    },

    clearSearch: () => {
      set((state) => {
        state.query = '';
        state.results = [];
      });
    },

    setFilters: (filters) => {
      set((state) => {
        Object.assign(state.filters, filters);
      });
    },

    addRecentSearch: (query) => {
      set((state) => {
        if (query && !state.recentSearches.includes(query)) {
          state.recentSearches.unshift(query);
          state.recentSearches = state.recentSearches.slice(0, 10);
        }
      });
    },

    clearRecentSearches: () => {
      set((state) => {
        state.recentSearches = [];
      });
    },
  }))
);

// ============================================
// NOTIFICATION STORE
// ============================================
interface NotificationStore {
  notifications: Notification[];
  unreadCount: number;
  showPanel: boolean;
  addNotification: (notification: Notification) => void;
  removeNotification: (id: string) => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  clearAll: () => void;
  togglePanel: () => void;
  setShowPanel: (show: boolean) => void;
}

export const useNotificationStore = create<NotificationStore>()(
  immer((set) => ({
    notifications: [],
    unreadCount: 0,
    showPanel: false,

    addNotification: (notification) => {
      set((state) => {
        state.notifications.unshift(notification);
        if (!notification.read) {
          state.unreadCount++;
        }
      });
    },

    removeNotification: (id) => {
      set((state) => {
        const idx = state.notifications.findIndex((n) => n.id === id);
        if (idx > -1) {
          if (!state.notifications[idx].read) {
            state.unreadCount = Math.max(0, state.unreadCount - 1);
          }
          state.notifications.splice(idx, 1);
        }
      });
    },

    markAsRead: (id) => {
      set((state) => {
        const notif = state.notifications.find((n) => n.id === id);
        if (notif && !notif.read) {
          notif.read = true;
          state.unreadCount = Math.max(0, state.unreadCount - 1);
        }
      });
    },

    markAllAsRead: () => {
      set((state) => {
        state.notifications.forEach((n) => {
          n.read = true;
        });
        state.unreadCount = 0;
      });
    },

    clearAll: () => {
      set((state) => {
        state.notifications = [];
        state.unreadCount = 0;
      });
    },

    togglePanel: () => {
      set((state) => {
        state.showPanel = !state.showPanel;
      });
    },

    setShowPanel: (show) => {
      set((state) => {
        state.showPanel = show;
      });
    },
  }))
);

// ============================================
// LAYOUT STORE
// ============================================
interface LayoutStore {
  sidebarCollapsed: boolean;
  activePanel: string | null;
  panels: PanelState[];
  commandPaletteOpen: boolean;
  theme: 'dark' | 'light' | 'system';
  toggleSidebar: () => void;
  setActivePanel: (panel: string | null) => void;
  togglePanel: (id: string) => void;
  setPanelSize: (id: string, size: PanelSize) => void;
  openCommandPalette: () => void;
  closeCommandPalette: () => void;
  setTheme: (theme: LayoutStore['theme']) => void;
}

export const useLayoutStore = create<LayoutStore>()(
  persist(
    immer((set) => ({
      sidebarCollapsed: false,
      activePanel: null,
      panels: [],
      commandPaletteOpen: false,
      theme: 'dark',

      toggleSidebar: () => {
        set((state) => {
          state.sidebarCollapsed = !state.sidebarCollapsed;
        });
      },

      setActivePanel: (panel) => {
        set((state) => {
          state.activePanel = panel;
        });
      },

      togglePanel: (id) => {
        set((state) => {
          const panel = state.panels.find((p) => p.id === id);
          if (panel) {
            panel.isOpen = !panel.isOpen;
          }
        });
      },

      setPanelSize: (id, size) => {
        set((state) => {
          const panel = state.panels.find((p) => p.id === id);
          if (panel) {
            panel.size = size;
          }
        });
      },

      openCommandPalette: () => {
        set((state) => {
          state.commandPaletteOpen = true;
        });
      },

      closeCommandPalette: () => {
        set((state) => {
          state.commandPaletteOpen = false;
        });
      },

      setTheme: (theme) => {
        set((state) => {
          state.theme = theme;
        });
      },
    })),
    {
      name: 'layout-storage',
      partialize: (state) => ({ sidebarCollapsed: state.sidebarCollapsed, theme: state.theme }),
    }
  )
);

// ============================================
// WEBSOCKET STORE
// ============================================
interface WebSocketStore {
  connected: boolean;
  reconnecting: boolean;
  lastMessage: any | null;
  trackingUpdates: any[];
  alerts: any[];
  connect: () => void;
  disconnect: () => void;
  send: (message: any) => void;
  subscribe: (channel: string) => void;
  unsubscribe: (channel: string) => void;
}

export const useWebSocketStore = create<WebSocketStore>()(
  immer((set) => ({
    connected: false,
    reconnecting: false,
    lastMessage: null,
    trackingUpdates: [],
    alerts: [],

    connect: () => {
      set((state) => {
        state.connected = true;
      });
      // Would establish WebSocket connection
    },

    disconnect: () => {
      set((state) => {
        state.connected = false;
      });
    },

    send: (message) => {
      // Would send via WebSocket
    },

    subscribe: (channel) => {
      // Would subscribe to channel
    },

    unsubscribe: (channel) => {
      // Would unsubscribe from channel
    },
  }))
);
