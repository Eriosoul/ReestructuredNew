// store/missionStore.ts
import { create } from 'zustand';
import type { export Mission } from '@/types/mission';

interface MissionStore {
  missions: Mission[];
  activeMission: Mission | null;
  addMission: (mission: Mission) => void;
  updateMission: (id: string, updates: Partial<Mission>) => void;
  deleteMission: (id: string) => void;
  setActiveMission: (mission: Mission | null) => void;
}

export const useMissionStore = create<MissionStore>((set) => ({
  missions: [],
  activeMission: null,
  addMission: (mission) => set((state) => ({ missions: [...state.missions, mission] })),
  updateMission: (id, updates) => set((state) => ({
    missions: state.missions.map(m => m.id === id ? { ...m, ...updates } : m)
  })),
  deleteMission: (id) => set((state) => ({
    missions: state.missions.filter(m => m.id !== id)
  })),
  setActiveMission: (mission) => set({ activeMission: mission }),
}));