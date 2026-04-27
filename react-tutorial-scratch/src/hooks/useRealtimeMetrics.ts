import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import type { DashboardMetrics } from './useDashboardData';

/**
 * WebSocket-driven realtime update hook (Step 8 of the tutorial).
 *
 * Usage:
 *   useRealtimeMetrics('wss://your-api.com/ws/metrics');
 *
 * The hook pushes incoming messages straight into the TanStack Query cache,
 * so every component calling useDashboardMetrics() re-renders automatically.
 *
 * Not wired into App.tsx by default — enable it once you have a real WebSocket
 * endpoint. The mock API in this starter serves REST only.
 */
export function useRealtimeMetrics(url: string) {
  const queryClient = useQueryClient();

  useEffect(() => {
    const ws = new WebSocket(url);

    ws.onmessage = (event) => {
      try {
        const update = JSON.parse(event.data) as Partial<DashboardMetrics>;
        queryClient.setQueryData<DashboardMetrics | undefined>(
          ['dashboard', 'metrics'],
          (old) => (old ? { ...old, ...update } : old),
        );
      } catch {
        // ignore malformed frames
      }
    };

    return () => {
      ws.close();
    };
  }, [queryClient, url]);
}
