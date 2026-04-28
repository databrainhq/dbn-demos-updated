import { computed, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import {
  patchState,
  signalStore,
  withComputed,
  withMethods,
  withState,
} from '@ngrx/signals';
import { firstValueFrom } from 'rxjs';

export type Role = 'admin' | 'manager' | 'viewer';

export interface User {
  id: string;
  email: string;
  role: Role;
}

interface AuthState {
  user: User | null;
  token: string | null;
  loading: boolean;
  error: string | null;
}

const initial: AuthState = {
  user: null,
  token: null,
  loading: false,
  error: null,
};

/**
 * Angular sibling of `useAuth` (Zustand) in the React starter. @ngrx/signals
 * gives us the same minimal store shape — a few fields, a few methods, no
 * reducers/effects ceremony.
 */
export const AuthStore = signalStore(
  { providedIn: 'root' },
  withState(initial),
  withComputed(({ user }) => ({
    isAuthenticated: computed(() => user() !== null),
    role: computed(() => user()?.role ?? null),
  })),
  withMethods((store) => {
    const http = inject(HttpClient);
    return {
      async login(email: string, password: string): Promise<void> {
        patchState(store, { loading: true, error: null });
        try {
          const res = await firstValueFrom(
            http.post<{ user: User; token: string }>('/api/auth/login', {
              email,
              password,
            }),
          );
          patchState(store, {
            user: res.user,
            token: res.token,
            loading: false,
          });
        } catch (err) {
          patchState(store, {
            loading: false,
            error: err instanceof Error ? err.message : 'Login failed',
          });
          throw err;
        }
      },
      logout(): void {
        patchState(store, { user: null, token: null });
      },
      hasRole(allowed: Role[]): boolean {
        const role = store.user()?.role;
        return role !== undefined && allowed.includes(role);
      },
    };
  }),
);
