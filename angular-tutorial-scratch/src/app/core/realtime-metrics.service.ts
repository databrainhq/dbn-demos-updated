import { DestroyRef, inject, Injectable } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Observable, retry, timer } from 'rxjs';
import { DashboardService, DashboardMetrics } from './dashboard.service';

/**
 * WebSocket-driven realtime update service (Step 8 of the tutorial).
 *
 * Usage (e.g. in app.component.ts):
 *   constructor(realtime: RealtimeMetricsService) {
 *     realtime.connect('wss://your-api.com/ws/metrics');
 *   }
 *
 * The service streams incoming messages straight into DashboardService's
 * Signal-backed cache, so every component that reads `metrics()` re-renders
 * automatically — same shape as `queryClient.setQueryData()` in the React
 * starter.
 *
 * Not wired into AppComponent by default — the mock API in this starter
 * serves REST only. Enable it once you have a real WebSocket endpoint.
 */
@Injectable({ providedIn: 'root' })
export class RealtimeMetricsService {
  private readonly dashboard = inject(DashboardService);
  private readonly destroyRef = inject(DestroyRef);
  private socket: WebSocket | null = null;

  connect(url: string): void {
    this.disconnect();

    this.socketStream(url)
      .pipe(
        retry({ delay: () => timer(2_000) }),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe((update) => {
        this.dashboard.patch(update);
      });
  }

  disconnect(): void {
    if (this.socket) {
      this.socket.close();
      this.socket = null;
    }
  }

  private socketStream(url: string): Observable<Partial<DashboardMetrics>> {
    return new Observable<Partial<DashboardMetrics>>((subscriber) => {
      const ws = new WebSocket(url);
      this.socket = ws;

      ws.onmessage = (event) => {
        try {
          const update = JSON.parse(event.data) as Partial<DashboardMetrics>;
          subscriber.next(update);
        } catch {
          // ignore malformed frames
        }
      };
      ws.onerror = (err) => subscriber.error(err);
      ws.onclose = () => subscriber.complete();

      return () => {
        if (ws.readyState === WebSocket.OPEN) {
          ws.close();
        }
      };
    });
  }
}
