import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
} from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { DashboardService } from '@core/dashboard.service';

interface MetricView {
  title: string;
  value: number | undefined;
  format: (v: number) => string;
}

@Component({
  selector: 'app-metric-cards',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [MatCardModule, MatProgressSpinnerModule],
  template: `
    @if (error()) {
      <div class="error">Failed to load metrics</div>
    }
    <div class="grid">
      @for (metric of cards(); track metric.title) {
        <mat-card appearance="outlined" class="card">
          <mat-card-header>
            <mat-card-title class="card-title">{{ metric.title }}</mat-card-title>
          </mat-card-header>
          <mat-card-content class="card-content">
            @if (isLoading() && metric.value === undefined) {
              <div class="skeleton"></div>
            } @else if (metric.value !== undefined) {
              <p class="value">{{ metric.format(metric.value) }}</p>
            }
          </mat-card-content>
        </mat-card>
      }
    </div>
  `,
  styles: [
    `
      .grid {
        display: grid;
        gap: 16px;
        grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
      }

      .card {
        border-radius: var(--app-radius);
        box-shadow: var(--app-card-shadow);
      }

      .card-title {
        font-size: 12px;
        font-weight: 500;
        color: var(--app-muted);
        text-transform: uppercase;
        letter-spacing: 0.04em;
      }

      .card-content {
        padding-top: 8px;
      }

      .value {
        margin: 0;
        font-size: 24px;
        font-weight: 700;
        color: #0f172a;
      }

      .skeleton {
        height: 32px;
        width: 80%;
        border-radius: 6px;
        background: linear-gradient(
          90deg,
          rgba(15, 23, 42, 0.06),
          rgba(15, 23, 42, 0.12),
          rgba(15, 23, 42, 0.06)
        );
        background-size: 200% 100%;
        animation: shimmer 1.4s infinite;
      }

      @keyframes shimmer {
        0% { background-position: 200% 0; }
        100% { background-position: -200% 0; }
      }

      .error {
        margin-bottom: 16px;
        padding: 12px;
        border-radius: 8px;
        background: rgba(220, 38, 38, 0.08);
        color: var(--app-negative);
        font-size: 14px;
      }
    `,
  ],
})
export class MetricCardsComponent {
  private readonly service = inject(DashboardService);

  protected readonly isLoading = this.service.isLoading;
  protected readonly error = this.service.error;

  protected readonly cards = computed<MetricView[]>(() => {
    const data = this.service.metrics();
    return [
      {
        title: 'Total Revenue',
        value: data?.totalRevenue,
        format: (v) => `$${v.toLocaleString()}`,
      },
      {
        title: 'Active Users',
        value: data?.activeUsers,
        format: (v) => v.toLocaleString(),
      },
      {
        title: 'Conversion Rate',
        value: data?.conversionRate,
        format: (v) => `${v}%`,
      },
      {
        title: 'Avg Order Value',
        value: data?.avgOrderValue,
        format: (v) => `$${v.toFixed(2)}`,
      },
    ];
  });
}
