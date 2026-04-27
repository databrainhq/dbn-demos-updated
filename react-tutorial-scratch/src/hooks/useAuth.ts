import { create } from 'zustand';

export interface User {
  id: string;
  email: string;
  role: 'admin' | 'manager' | 'viewer';
}

interface AuthState {
  user: User | null;
  token: string | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

export const useAuth = create<AuthState>((set) => ({
  user: null,
  token: null,
  login: async (email, password) => {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    if (!res.ok) throw new Error('Login failed');
    const data = await res.json();
    set({ user: data.user, token: data.token });
  },
  logout: () => set({ user: null, token: null }),
}));
