import { create } from 'zustand';
import { User } from '@supabase/supabase-js';

interface AuthState {
  user: User | null;
  setUser: (user: User | null) => void;
}

interface CompareState {
  agents: string[];
  addAgent: (id: string) => void;
  removeAgent: (id: string) => void;
  clearAgents: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  setUser: (user) => set({ user }),
}));

export const useCompareStore = create<CompareState>((set) => ({
  agents: [],
  addAgent: (id) =>
    set((state) => ({
      agents: state.agents.length < 3 && !state.agents.includes(id)
        ? [...state.agents, id]
        : state.agents,
    })),
  removeAgent: (id) =>
    set((state) => ({
      agents: state.agents.filter((agentId) => agentId !== id),
    })),
  clearAgents: () => set({ agents: [] }),
}));