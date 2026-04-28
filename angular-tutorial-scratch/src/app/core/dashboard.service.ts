import { computed, inject, Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';

export interface DashboardMetrics {
  totalRevenue: number;
  activeUsers: number;
  conversionRate: number;
  avgOrderValue: number;
  revenueByMonth: { month: string; revenue: number }[];
}

interface MetricsState {
  data: DashboardMetrics | null;
  loading: boolean;
  error: string | null;
  fetchedAt: number | null;
}

const STALE_TIME_MS = 30_000;
const REFETCH_INTERVAL_MS = 60_000;

/**
 * Angular sibling of `useDashboardMetrics` (TanStack Query) in the React
 * starter. Holds a single source of truth in a Signal so every component that
 * reads it re-renders on update — same architectural shape, different idiom.
 */
@Injectable({ providedIn: 'root' })
export class DashboardService {
  private readonly http = inject(HttpClient);
  private readonly state = signal<MetricsState>({
    data: null,
    loading: false,
    error: null,
    fetchedAt: null,
  });
  private intervalId: ReturnType<typeof setInterval> | null = null;

  readonly metrics = computed(() => this.state().data);
  readonly isLoading = computed(() => this.state().loading);
  readonly error = computed(() => this.state().error);

  async fetch(force = false): Promise<void> {
    const current = this.state();
    if (
      !force &&
      current.data &&
      current.fetchedAt &&
      Date.now() - current.fetchedAt < STALE_TIME_MS
    ) {
      return;
    }

    this.state.update((s) => ({ ...s, loading: true, error: null }));
    try {
      const data = await firstValueFrom(
        this.http.get<DashboardMetrics>('/api/dashboard/metrics'),
      );
      this.state.set({
        data,
        loading: false,
        error: null,
        fetchedAt: Date.now(),
      });
    } catch (err) {
      this.state.update((s) => ({
        ...s,
        loading: false,
        error: err instanceof Error ? err.message : 'Failed to load metrics',
      }));
    }
  }

  startPolling(): void {
    if (this.intervalId) return;
    this.fetch();
    this.intervalId = setInterval(
      () => this.fetch(true),
      REFETCH_INTERVAL_MS,
    );
  }

  stopPolling(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }

  /**
   * Used by the WebSocket realtime hook (see realtime-metrics.service.ts) to
   * patch the cache without a full re-fetch — mirrors
   * `queryClient.setQueryData()` in the React starter.
   */
  patch(update: Partial<DashboardMetrics>): void {
    this.state.update((s) =>
      s.data
        ? { ...s, data: { ...s.data, ...update }, fetchedAt: Date.now() }
        : s,
    );
  }
}
