import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { api } from '@/lib/api';

interface User {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string;
}

interface Org {
  id: string;
  name: string;
  slug: string;
  plan: string;
}

interface AuthState {
  user: User | null;
  orgs: Org[];
  currentOrg: Org | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string, orgName: string) => Promise<void>;
  logout: () => Promise<void>;
  switchOrg: (orgId: string) => void;
  setTokens: (access: string, refresh: string) => void;
  loadProfile: () => Promise<void>;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      orgs: [],
      currentOrg: null,
      accessToken: null,
      refreshToken: null,
      isAuthenticated: false,

      setTokens: (accessToken, refreshToken) => {
        localStorage.setItem('accessToken', accessToken);
        localStorage.setItem('refreshToken', refreshToken);
        set({ accessToken, refreshToken, isAuthenticated: true });
      },

      login: async (email, password) => {
        const { data } = await api.post('/auth/login', { email, password });
        const { accessToken, refreshToken, user, org } = data;
        localStorage.setItem('accessToken', accessToken);
        localStorage.setItem('refreshToken', refreshToken);
        localStorage.setItem('currentOrgId', org.id);
        set({
          accessToken,
          refreshToken,
          user,
          currentOrg: org,
          orgs: [org],
          isAuthenticated: true,
        });
      },

      register: async (name, email, password, orgName) => {
        const { data } = await api.post('/auth/register', { name, email, password, orgName });
        const { accessToken, refreshToken, user, org } = data;
        localStorage.setItem('accessToken', accessToken);
        localStorage.setItem('refreshToken', refreshToken);
        localStorage.setItem('currentOrgId', org.id);
        set({
          accessToken,
          refreshToken,
          user,
          currentOrg: org,
          orgs: [org],
          isAuthenticated: true,
        });
      },

      logout: async () => {
        try {
          await api.post('/auth/logout', { refreshToken: get().refreshToken });
        } catch {}
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('currentOrgId');
        set({ user: null, orgs: [], currentOrg: null, accessToken: null, refreshToken: null, isAuthenticated: false });
      },

      switchOrg: (orgId) => {
        const org = get().orgs.find((o) => o.id === orgId);
        if (org) {
          localStorage.setItem('currentOrgId', orgId);
          set({ currentOrg: org });
        }
      },

      loadProfile: async () => {
        const { data } = await api.get('/users/me');
        const orgs = data.memberships?.map((m: any) => m.org) || [];
        const currentOrgId = localStorage.getItem('currentOrgId');
        const currentOrg = orgs.find((o: Org) => o.id === currentOrgId) || orgs[0];
        if (currentOrg) localStorage.setItem('currentOrgId', currentOrg.id);
        set({ user: data, orgs, currentOrg });
      },
    }),
    { name: 'auth-store', partialize: (s) => ({ accessToken: s.accessToken, refreshToken: s.refreshToken }) },
  ),
);
