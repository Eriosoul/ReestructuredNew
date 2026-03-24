// ============================================
// INTEL OPS PLATFORM - GLOBAL STATE STORE
// ============================================

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';
export { useOperationStore } from './operationStore';
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
// Configuración de la API
// ============================================
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Helper para incluir el token JWT en las peticiones
const fetchWithAuth = async (url: string, options: RequestInit = {}) => {
  const token = useAuthStore.getState().token;
  return fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });
};

// ============================================
// AUTH STORE
// ============================================
interface AuthStore extends AuthState {
  error?: string;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  register: (email: string, password: string, name: string) => Promise<void>;
  updateUser: (user: Partial<User>) => Promise<void>;
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
      error: undefined,

      login: async (email: string, password: string) => {
        set((state) => {
          state.isLoading = true;
          state.error = undefined;
        });
        try {
          const res = await fetch(`${API_BASE_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password }),
          });
          const data = await res.json();
          if (!res.ok) throw new Error(data.message || 'Error al iniciar sesión');
          
          // 🔍 LOG: mostrar la respuesta completa del servidor
          console.log('📥 Respuesta login:', data);
          
          // ⚠️ Ajusta aquí según el nombre del campo que devuelve tu backend
          // Posibles nombres: 'token', 'access_token', 'accessToken'
          const token = data.token || data.access_token || data.accessToken;
          if (!token) {
            throw new Error('El servidor no devolvió un token de autenticación');
          }
          
          set((state) => {
            state.user = data.user;
            state.token = token;
            state.isAuthenticated = true;
            state.isLoading = false;
          });
        } catch (error: any) {
          console.error('❌ Error en login:', error);
          set((state) => {
            state.isLoading = false;
            state.error = error.message;
          });
          throw error;
        }
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
          state.error = undefined;
        });
        try {
          const res = await fetch(`${API_BASE_URL}/auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password, name }),
          });
          const data = await res.json();
          if (!res.ok) throw new Error(data.message || 'Error al registrar');
          
          const token = data.token || data.access_token || data.accessToken;
          if (!token) throw new Error('El servidor no devolvió un token');
          
          set((state) => {
            state.user = data.user;
            state.token = token;
            state.isAuthenticated = true;
            state.isLoading = false;
          });
        } catch (error: any) {
          set((state) => {
            state.isLoading = false;
            state.error = error.message;
          });
          throw error;
        }
      },

      updateUser: async (userData: Partial<User>) => {
        try {
          const res = await fetchWithAuth(`${API_BASE_URL}/auth/profile`, {
            method: 'PUT',
            body: JSON.stringify(userData),
          });
          const updatedUser = await res.json();
          set((state) => {
            if (state.user) {
              Object.assign(state.user, updatedUser);
            }
          });
        } catch (error) {
          console.error('Error actualizando usuario:', error);
        }
      },

      resetPassword: async (email: string) => {
        await fetch(`${API_BASE_URL}/auth/reset-password`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email }),
        });
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
// GLOBAL FILTERS STORE (sin cambios, solo local)
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
  setMissions(mockMissions: Mission[]): unknown;
  missions: Mission[];
  activeMission: Mission | null;
  selectedMissions: string[];
  isLoading: boolean;
  error: string | null;
  fetchMissions: (filters?: Record<string, any>) => Promise<void>;
  fetchMissionById: (id: string) => Promise<void>;
  createMission: (data: Partial<Mission>) => Promise<void>;
  updateMission: (id: string, updates: Partial<Mission>) => Promise<void>;
  deleteMission: (id: string) => Promise<void>;
  setActiveMission: (mission: Mission | null) => void;
  toggleMissionSelection: (id: string) => void;
  addActivityLog: (missionId: string, entry: ActivityLogEntry) => void;
  addNote: (missionId: string, note: Note) => void;
}

export const useMissionStore = create<MissionStore>()(
  immer((set, get) => ({
    missions: [],
    activeMission: null,
    selectedMissions: [],
    isLoading: false,
    error: null,

    fetchMissions: async (filters = {}) => {
      set((state) => {
        state.isLoading = true;
        state.error = null;
      });
      try {
        const query = new URLSearchParams(filters).toString();
        const res = await fetchWithAuth(`${API_BASE_URL}/missions?${query}`);
        if (!res.ok) throw new Error('Error al cargar misiones');
        const data = await res.json();
        set((state) => {
          state.missions = data;
          state.isLoading = false;
        });
      } catch (error: any) {
        set((state) => {
          state.error = error.message;
          state.isLoading = false;
        });
      }
    },

    fetchMissionById: async (id) => {
      set((state) => {
        state.isLoading = true;
        state.error = null;
      });
      try {
        const res = await fetchWithAuth(`${API_BASE_URL}/missions/${id}`);
        if (!res.ok) throw new Error('Error al cargar la misión');
        const data = await res.json();
        set((state) => {
          state.activeMission = data;
          state.isLoading = false;
        });
      } catch (error: any) {
        set((state) => {
          state.error = error.message;
          state.isLoading = false;
        });
      }
    },

    createMission: async (data) => {
      set((state) => {
        state.isLoading = true;
        state.error = null;
      });
      try {
        const res = await fetchWithAuth(`${API_BASE_URL}/missions`, {
          method: 'POST',
          body: JSON.stringify(data),
        });
        if (!res.ok) throw new Error('Error al crear misión');
        const newMission = await res.json();
        set((state) => {
          state.missions.push(newMission);
          state.isLoading = false;
        });
      } catch (error: any) {
        set((state) => {
          state.error = error.message;
          state.isLoading = false;
        });
      }
    },

    updateMission: async (id, updates) => {
      set((state) => {
        state.isLoading = true;
        state.error = null;
      });
      try {
        const res = await fetchWithAuth(`${API_BASE_URL}/missions/${id}`, {
          method: 'PUT',
          body: JSON.stringify(updates),
        });
        if (!res.ok) throw new Error('Error al actualizar misión');
        const updated = await res.json();
        set((state) => {
          const index = state.missions.findIndex((m) => m.id === id);
          if (index !== -1) state.missions[index] = updated;
          if (state.activeMission?.id === id) state.activeMission = updated;
          state.isLoading = false;
        });
      } catch (error: any) {
        set((state) => {
          state.error = error.message;
          state.isLoading = false;
        });
      }
    },

    deleteMission: async (id) => {
      set((state) => {
        state.isLoading = true;
        state.error = null;
      });
      try {
        const res = await fetchWithAuth(`${API_BASE_URL}/missions/${id}`, {
          method: 'DELETE',
        });
        if (!res.ok) throw new Error('Error al eliminar misión');
        set((state) => {
          state.missions = state.missions.filter((m) => m.id !== id);
          if (state.activeMission?.id === id) state.activeMission = null;
          state.isLoading = false;
        });
      } catch (error: any) {
        set((state) => {
          state.error = error.message;
          state.isLoading = false;
        });
      }
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
  setObjects(mockObjects: TargetObject[]): unknown;
  objects: TargetObject[];
  selectedObject: TargetObject | null;
  watchlist: string[];
  isLoading: boolean;
  error: string | null;
  fetchObjects: (filters?: Record<string, any>) => Promise<void>;
  fetchObjectById: (id: string) => Promise<void>;
  createObject: (data: Partial<TargetObject>) => Promise<void>;
  updateObject: (id: string, updates: Partial<TargetObject>) => Promise<void>;
  deleteObject: (id: string) => Promise<void>;
  setSelectedObject: (object: TargetObject | null) => void;
  addToWatchlist: (id: string) => Promise<void>;
  removeFromWatchlist: (id: string) => Promise<void>;
  addTimelineEvent: (objectId: string, event: any) => void;
  addPrediction: (objectId: string, prediction: Prediction) => void;
  updateLastLocation: (objectId: string, location: any) => void;
}

export const useObjectStore = create<ObjectStore>()(
  immer((set, get) => ({
    objects: [],
    selectedObject: null,
    watchlist: [],
    isLoading: false,
    error: null,

    fetchObjects: async (filters = {}) => {
      set((state) => {
        state.isLoading = true;
        state.error = null;
      });
      try {
        const query = new URLSearchParams(filters).toString();
        const res = await fetchWithAuth(`${API_BASE_URL}/objects?${query}`);
        if (!res.ok) throw new Error('Error al cargar objetos');
        const data = await res.json();
        set((state) => {
          state.objects = data;
          state.isLoading = false;
        });
      } catch (error: any) {
        set((state) => {
          state.error = error.message;
          state.isLoading = false;
        });
      }
    },

    fetchObjectById: async (id) => {
      set((state) => {
        state.isLoading = true;
        state.error = null;
      });
      try {
        const res = await fetchWithAuth(`${API_BASE_URL}/objects/${id}`);
        if (!res.ok) throw new Error('Error al cargar el objeto');
        const data = await res.json();
        set((state) => {
          state.selectedObject = data;
          state.isLoading = false;
        });
      } catch (error: any) {
        set((state) => {
          state.error = error.message;
          state.isLoading = false;
        });
      }
    },

    createObject: async (data) => {
      set((state) => {
        state.isLoading = true;
        state.error = null;
      });
      try {
        const res = await fetchWithAuth(`${API_BASE_URL}/objects`, {
          method: 'POST',
          body: JSON.stringify(data),
        });
        if (!res.ok) throw new Error('Error al crear objeto');
        const newObj = await res.json();
        set((state) => {
          state.objects.push(newObj);
          state.isLoading = false;
        });
      } catch (error: any) {
        set((state) => {
          state.error = error.message;
          state.isLoading = false;
        });
      }
    },

    updateObject: async (id, updates) => {
      set((state) => {
        state.isLoading = true;
        state.error = null;
      });
      try {
        const res = await fetchWithAuth(`${API_BASE_URL}/objects/${id}`, {
          method: 'PUT',
          body: JSON.stringify(updates),
        });
        if (!res.ok) throw new Error('Error al actualizar objeto');
        const updated = await res.json();
        set((state) => {
          const index = state.objects.findIndex((o) => o.id === id);
          if (index !== -1) state.objects[index] = updated;
          if (state.selectedObject?.id === id) state.selectedObject = updated;
          state.isLoading = false;
        });
      } catch (error: any) {
        set((state) => {
          state.error = error.message;
          state.isLoading = false;
        });
      }
    },

    deleteObject: async (id) => {
      set((state) => {
        state.isLoading = true;
        state.error = null;
      });
      try {
        const res = await fetchWithAuth(`${API_BASE_URL}/objects/${id}`, {
          method: 'DELETE',
        });
        if (!res.ok) throw new Error('Error al eliminar objeto');
        set((state) => {
          state.objects = state.objects.filter((o) => o.id !== id);
          if (state.selectedObject?.id === id) state.selectedObject = null;
          state.isLoading = false;
        });
      } catch (error: any) {
        set((state) => {
          state.error = error.message;
          state.isLoading = false;
        });
      }
    },

    setSelectedObject: (object) => {
      set((state) => {
        state.selectedObject = object;
      });
    },

    addToWatchlist: async (id) => {
      try {
        await fetchWithAuth(`${API_BASE_URL}/objects/${id}/watchlist`, {
          method: 'POST',
        });
        set((state) => {
          if (!state.watchlist.includes(id)) {
            state.watchlist.push(id);
          }
          const obj = state.objects.find((o) => o.id === id);
          if (obj) {
            obj.status = 'watchlisted';
          }
        });
      } catch (error) {
        console.error('Error al añadir a watchlist', error);
      }
    },

    removeFromWatchlist: async (id) => {
      try {
        await fetchWithAuth(`${API_BASE_URL}/objects/${id}/watchlist`, {
          method: 'DELETE',
        });
        set((state) => {
          state.watchlist = state.watchlist.filter((w) => w !== id);
          const obj = state.objects.find((o) => o.id === id);
          if (obj) {
            obj.status = 'active';
          }
        });
      } catch (error) {
        console.error('Error al remover de watchlist', error);
      }
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
  setEvents(mockEvents: Event[]): unknown;
  events: Event[];
  selectedEvent: Event | null;
  unreadCount: number;
  isLoading: boolean;
  error: string | null;
  fetchEvents: (filters?: Record<string, any>) => Promise<void>;
  fetchEventById: (id: string) => Promise<void>;
  createEvent: (data: Partial<Event>) => Promise<void>;
  updateEvent: (id: string, updates: Partial<Event>) => Promise<void>;
  deleteEvent: (id: string) => Promise<void>;
  setSelectedEvent: (event: Event | null) => void;
  markAsRead: (id: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  getEventsByObject: (objectId: string) => Event[];
  getEventsByMission: (missionId: string) => Event[];
}

export const useEventStore = create<EventStore>()(
  immer((set, get) => ({
    events: [],
    selectedEvent: null,
    unreadCount: 0,
    isLoading: false,
    error: null,

    fetchEvents: async (filters = {}) => {
      set((state) => {
        state.isLoading = true;
        state.error = null;
      });
      try {
        const query = new URLSearchParams(filters).toString();
        const res = await fetchWithAuth(`${API_BASE_URL}/events?${query}`);
        if (!res.ok) throw new Error('Error al cargar eventos');
        const data = await res.json();
        set((state) => {
          state.events = data;
          state.unreadCount = data.filter((e: Event) => !e.verified).length;
          state.isLoading = false;
        });
      } catch (error: any) {
        set((state) => {
          state.error = error.message;
          state.isLoading = false;
        });
      }
    },

    fetchEventById: async (id) => {
      set((state) => {
        state.isLoading = true;
        state.error = null;
      });
      try {
        const res = await fetchWithAuth(`${API_BASE_URL}/events/${id}`);
        if (!res.ok) throw new Error('Error al cargar el evento');
        const data = await res.json();
        set((state) => {
          state.selectedEvent = data;
          state.isLoading = false;
        });
      } catch (error: any) {
        set((state) => {
          state.error = error.message;
          state.isLoading = false;
        });
      }
    },

    createEvent: async (data) => {
      set((state) => {
        state.isLoading = true;
        state.error = null;
      });
      try {
        const res = await fetchWithAuth(`${API_BASE_URL}/events`, {
          method: 'POST',
          body: JSON.stringify(data),
        });
        if (!res.ok) throw new Error('Error al crear evento');
        const newEvent = await res.json();
        set((state) => {
          state.events.unshift(newEvent);
          if (!newEvent.verified) state.unreadCount++;
          state.isLoading = false;
        });
      } catch (error: any) {
        set((state) => {
          state.error = error.message;
          state.isLoading = false;
        });
      }
    },

    updateEvent: async (id, updates) => {
      set((state) => {
        state.isLoading = true;
        state.error = null;
      });
      try {
        const res = await fetchWithAuth(`${API_BASE_URL}/events/${id}`, {
          method: 'PUT',
          body: JSON.stringify(updates),
        });
        if (!res.ok) throw new Error('Error al actualizar evento');
        const updated = await res.json();
        set((state) => {
          const index = state.events.findIndex((e) => e.id === id);
          if (index !== -1) {
            const wasUnread = !state.events[index].verified;
            const isUnread = !updated.verified;
            if (wasUnread && !isUnread) state.unreadCount--;
            else if (!wasUnread && isUnread) state.unreadCount++;
            state.events[index] = updated;
          }
          if (state.selectedEvent?.id === id) state.selectedEvent = updated;
          state.isLoading = false;
        });
      } catch (error: any) {
        set((state) => {
          state.error = error.message;
          state.isLoading = false;
        });
      }
    },

    deleteEvent: async (id) => {
      set((state) => {
        state.isLoading = true;
        state.error = null;
      });
      try {
        const res = await fetchWithAuth(`${API_BASE_URL}/events/${id}`, {
          method: 'DELETE',
        });
        if (!res.ok) throw new Error('Error al eliminar evento');
        set((state) => {
          const event = state.events.find((e) => e.id === id);
          if (event && !event.verified) {
            state.unreadCount = Math.max(0, state.unreadCount - 1);
          }
          state.events = state.events.filter((e) => e.id !== id);
          if (state.selectedEvent?.id === id) state.selectedEvent = null;
          state.isLoading = false;
        });
      } catch (error: any) {
        set((state) => {
          state.error = error.message;
          state.isLoading = false;
        });
      }
    },

    setSelectedEvent: (event) => {
      set((state) => {
        state.selectedEvent = event;
      });
    },

    markAsRead: async (id) => {
      try {
        await fetchWithAuth(`${API_BASE_URL}/events/${id}/read`, {
          method: 'PATCH',
        });
        set((state) => {
          const evt = state.events.find((e) => e.id === id);
          if (evt && !evt.verified) {
            evt.verified = true;
            state.unreadCount = Math.max(0, state.unreadCount - 1);
          }
        });
      } catch (error) {
        console.error('Error marcando como leído', error);
      }
    },

    markAllAsRead: async () => {
      try {
        await fetchWithAuth(`${API_BASE_URL}/events/read-all`, {
          method: 'POST',
        });
        set((state) => {
          state.events.forEach((e) => {
            e.verified = true;
          });
          state.unreadCount = 0;
        });
      } catch (error) {
        console.error('Error marcando todos como leídos', error);
      }
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
  isLoading: boolean;
  error: string | null;
  setViewport: (viewport: Partial<MapViewport>) => void;
  setMapStyle: (style: string) => void;
  addLayer: (layer: MapLayer) => void;
  removeLayer: (id: string) => void;
  toggleLayer: (id: string) => void;
  fetchTrackingPoints: (objectId?: string, timeRange?: { start: Date; end: Date }) => Promise<void>;
  addTrackingPoint: (point: TrackingPoint) => void;
  fetchZones: (missionId?: string) => Promise<void>;
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
    isLoading: false,
    error: null,

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

    fetchTrackingPoints: async (objectId, timeRange) => {
      set((state) => {
        state.isLoading = true;
        state.error = null;
      });
      try {
        let url = `${API_BASE_URL}/tracking`;
        const params = new URLSearchParams();
        if (objectId) params.append('objectId', objectId);
        if (timeRange?.start) params.append('start', timeRange.start.toISOString());
        if (timeRange?.end) params.append('end', timeRange.end.toISOString());
        if (params.toString()) url += `?${params.toString()}`;
        const res = await fetchWithAuth(url);
        if (!res.ok) throw new Error('Error al cargar puntos de seguimiento');
        const data = await res.json();
        set((state) => {
          state.trackingPoints = data;
          state.isLoading = false;
        });
      } catch (error: any) {
        set((state) => {
          state.error = error.message;
          state.isLoading = false;
        });
      }
    },

    addTrackingPoint: (point) => {
      set((state) => {
        state.trackingPoints.push(point);
      });
    },

    fetchZones: async (missionId) => {
      set((state) => {
        state.isLoading = true;
        state.error = null;
      });
      try {
        let url = `${API_BASE_URL}/zones`;
        if (missionId) url += `?missionId=${missionId}`;
        const res = await fetchWithAuth(url);
        if (!res.ok) throw new Error('Error al cargar zonas');
        const data = await res.json();
        set((state) => {
          state.zones = data;
          state.isLoading = false;
        });
      } catch (error: any) {
        set((state) => {
          state.error = error.message;
          state.isLoading = false;
        });
      }
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
  isLoading: boolean;
  error: string | null;
  fetchGraphData: (filters?: Record<string, any>) => Promise<void>;
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
    isLoading: false,
    error: null,

    fetchGraphData: async (filters = {}) => {
      set((state) => {
        state.isLoading = true;
        state.error = null;
      });
      try {
        const query = new URLSearchParams(filters).toString();
        const res = await fetchWithAuth(`${API_BASE_URL}/graph?${query}`);
        if (!res.ok) throw new Error('Error al cargar datos del grafo');
        const data = await res.json();
        set((state) => {
          state.graphData = data;
          state.isLoading = false;
        });
      } catch (error: any) {
        set((state) => {
          state.error = error.message;
          state.isLoading = false;
        });
      }
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
      console.log('Expand node', id);
    },

    collapseNode: (id) => {
      set((state) => {
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
  immer((set, get) => ({
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
      if (!query || query.trim().length < 2) {
        set((state) => {
          state.results = [];
          state.isSearching = false;
        });
        return;
      }
      set((state) => {
        state.isSearching = true;
        state.query = query;
      });

      try {
        const params = new URLSearchParams({ q: query });
        const { filters } = get();
        if (filters.types?.length) params.append('types', filters.types.join(','));
        if (filters.dateRange?.start) params.append('start', filters.dateRange.start.toISOString());
        if (filters.dateRange?.end) params.append('end', filters.dateRange.end.toISOString());
        if (filters.missions?.length) params.append('missions', filters.missions.join(','));
        if (filters.tags?.length) params.append('tags', filters.tags.join(','));
        if (filters.confidence) params.append('confidence', filters.confidence.toString());

        const res = await fetchWithAuth(`${API_BASE_URL}/search?${params.toString()}`);
        if (!res.ok) throw new Error('Error en la búsqueda');
        const data = await res.json();

        set((state) => {
          state.isSearching = false;
          state.results = data;
          state.recentSearches.unshift(query);
          state.recentSearches = state.recentSearches.slice(0, 10);
        });
      } catch (error) {
        console.error('Search error:', error);
        set((state) => {
          state.isSearching = false;
          state.results = [];
        });
      }
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
  setNotifications(mockNotifications: Notification[]): unknown;
  notifications: Notification[];
  unreadCount: number;
  showPanel: boolean;
  isLoading: boolean;
  error: string | null;
  fetchNotifications: () => Promise<void>;
  addNotification: (notification: Notification) => void;
  removeNotification: (id: string) => Promise<void>;
  markAsRead: (id: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  clearAll: () => Promise<void>;
  togglePanel: () => void;
  setShowPanel: (show: boolean) => void;
}

export const useNotificationStore = create<NotificationStore>()(
  immer((set) => ({
    notifications: [],
    unreadCount: 0,
    showPanel: false,
    isLoading: false,
    error: null,

    fetchNotifications: async () => {
      set((state) => {
        state.isLoading = true;
        state.error = null;
      });
      try {
        const res = await fetchWithAuth(`${API_BASE_URL}/notifications`);
        if (!res.ok) throw new Error('Error al cargar notificaciones');
        const data = await res.json();
        set((state) => {
          state.notifications = data.notifications || [];
          state.unreadCount = data.unreadCount || 0;
          state.isLoading = false;
        });
      } catch (error: any) {
        set((state) => {
          state.error = error.message;
          state.isLoading = false;
        });
      }
    },

    addNotification: (notification) => {
      set((state) => {
        state.notifications.unshift(notification);
        if (!notification.read) {
          state.unreadCount++;
        }
      });
    },

    removeNotification: async (id) => {
      try {
        await fetchWithAuth(`${API_BASE_URL}/notifications/${id}`, {
          method: 'DELETE',
        });
        set((state) => {
          const idx = state.notifications.findIndex((n) => n.id === id);
          if (idx > -1) {
            if (!state.notifications[idx].read) {
              state.unreadCount = Math.max(0, state.unreadCount - 1);
            }
            state.notifications.splice(idx, 1);
          }
        });
      } catch (error) {
        console.error('Error removing notification', error);
      }
    },

    markAsRead: async (id) => {
      try {
        await fetchWithAuth(`${API_BASE_URL}/notifications/${id}/read`, {
          method: 'PATCH',
        });
        set((state) => {
          const notif = state.notifications.find((n) => n.id === id);
          if (notif && !notif.read) {
            notif.read = true;
            state.unreadCount = Math.max(0, state.unreadCount - 1);
          }
        });
      } catch (error) {
        console.error('Error marking as read', error);
      }
    },

    markAllAsRead: async () => {
      try {
        await fetchWithAuth(`${API_BASE_URL}/notifications/read-all`, {
          method: 'POST',
        });
        set((state) => {
          state.notifications.forEach((n) => {
            n.read = true;
          });
          state.unreadCount = 0;
        });
      } catch (error) {
        console.error('Error marking all as read', error);
      }
    },

    clearAll: async () => {
      try {
        await fetchWithAuth(`${API_BASE_URL}/notifications`, {
          method: 'DELETE',
        });
        set((state) => {
          state.notifications = [];
          state.unreadCount = 0;
        });
      } catch (error) {
        console.error('Error clearing all notifications', error);
      }
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
// WEBSOCKET STORE (placeholder)
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