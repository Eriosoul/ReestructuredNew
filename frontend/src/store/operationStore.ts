import { create } from 'zustand';
import { type Operation } from '@/types/mission';
import { useAuthStore } from './index'; // Importación correcta

interface OperationStore {
  operations: Operation[];
  loading: boolean;
  error: string | null;
  fetchOperations: () => Promise<void>;
  addOperation: (op: Operation) => Promise<void>;
  updateOperation: (op: Operation) => Promise<void>;
  deleteOperation: (id: string) => Promise<void>;
}

const API_BASE = import.meta.env.VITE_FLASK_API_URL || 'http://localhost:5000';

export const useOperationStore = create<OperationStore>((set, get) => ({
  operations: [],
  loading: false,
  error: null,

  fetchOperations: async () => {
    set({ loading: true, error: null });
    try {
      const authState = useAuthStore.getState();
      console.log('🔍 Auth state en fetchOperations:', authState);
      const token = authState.token;
      if (!token) throw new Error('No hay token de autenticación. Por favor, inicia sesión.');
      console.log('🔑 GET token:', token);
      const res = await fetch(`${API_BASE}/api/operations/`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) {
        const errorText = await res.text();
        console.error('❌ Error GET operations:', res.status, errorText);
        throw new Error(`Error ${res.status}: ${errorText}`);
      }
      const data = await res.json();
      // Convertir snake_case → camelCase
      const ops = data.map((op: any) => ({
        _id: op._id,
        name: op.name,
        description: op.description,
        status: op.status,
        priority: op.priority,
        startDate: op.start_date ? new Date(op.start_date) : new Date(),
        endDate: op.end_date ? new Date(op.end_date) : undefined,
        createdBy: op.created_by || 'unknown',
        assignedUsers: op.assigned_users || [],
        tags: op.tags || [],
        color: op.color,
        missions: op.missions || [],
        createdAt: op.created_at ? new Date(op.created_at) : new Date(),
        updatedAt: op.updated_at ? new Date(op.updated_at) : new Date(),
      }));
      set({ operations: ops });
    } catch (err) {
      console.error('Error fetching operations:', err);
      set({ error: err instanceof Error ? err.message : 'Unknown error' });
    } finally {
      set({ loading: false });
    }
  },

  addOperation: async (op) => {
    try {
      const authState = useAuthStore.getState();
      console.log('🔍 Auth state en addOperation:', authState);
      const token = authState.token;
      if (!token) throw new Error('No hay token de autenticación');
      // Convertir camelCase → snake_case para el backend
      const payload = {
        name: op.name,
        description: op.description,
        status: op.status,
        priority: op.priority,
        start_date: op.startDate?.toISOString(),
        end_date: op.endDate?.toISOString(),
        tags: op.tags,
        color: op.color,
      };
      console.log('📤 POST payload:', payload);
      const res = await fetch(`${API_BASE}/api/operations/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });
      if (!res.ok) {
        const errorText = await res.text();
        console.error('❌ Error POST operation:', res.status, errorText);
        throw new Error(`Error ${res.status}: ${errorText}`);
      }
      const newOp = await res.json();
      console.log('✅ Operation created:', newOp);
      await get().fetchOperations(); // refrescar lista
    } catch (err) {
      console.error('Error en addOperation:', err);
      set({ error: err instanceof Error ? err.message : 'Unknown error' });
      throw err;
    }
  },

  updateOperation: async (op) => {
    try {
      const token = useAuthStore.getState().token;
      if (!token) throw new Error('No hay token de autenticación');
      const payload = {
        name: op.name,
        description: op.description,
        status: op.status,
        priority: op.priority,
        start_date: op.startDate?.toISOString(),
        end_date: op.endDate?.toISOString(),
        tags: op.tags,
        color: op.color,
      };
      console.log('📤 PUT payload:', payload);
      const res = await fetch(`${API_BASE}/api/operations/${op._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });
      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(`Failed to update operation: ${res.status} - ${errorText}`);
      }
      await get().fetchOperations();
    } catch (err) {
      console.error('Error en updateOperation:', err);
      set({ error: err instanceof Error ? err.message : 'Unknown error' });
      throw err;
    }
  },

  deleteOperation: async (id) => {
    try {
      const token = useAuthStore.getState().token;
      if (!token) throw new Error('No hay token de autenticación');
      const res = await fetch(`${API_BASE}/api/operations/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) throw new Error('Failed to delete operation');
      set(state => ({ operations: state.operations.filter(op => op._id !== id) }));
    } catch (err) {
      console.error('Error en deleteOperation:', err);
      set({ error: err instanceof Error ? err.message : 'Unknown error' });
      throw err;
    }
  }
}));