import { inject } from '@angular/core';
import { CanActivateFn, Router, UrlTree } from '@angular/router';
import { AuthStore, Role } from './auth.store';

/**
 * Higher-order guard so routes can declare required roles inline:
 *   { path: 'analytics', canActivate: [authGuard(['admin','manager'])], ... }
 *
 * For the tutorial starter, an unauthenticated user is auto-promoted to
 * 'admin' via the mock /api/auth/login endpoint so the guarded route is
 * still reachable in dev. Replace this with a real /login redirect.
 */
export function authGuard(allowed: Role[]): CanActivateFn {
  return async (): Promise<boolean | UrlTree> => {
    const store = inject(AuthStore);
    const router = inject(Router);

    if (!store.isAuthenticated()) {
      try {
        await store.login('demo@example.com', 'demo');
      } catch {
        return router.parseUrl('/overview');
      }
    }

    return store.hasRole(allowed) ? true : router.parseUrl('/overview');
  };
}
