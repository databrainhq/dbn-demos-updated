import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
} from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { BaseChartDirective } from 'ng2-charts';
import type { ChartConfiguration, ChartData } from 'chart.js';
import { DashboardService } from '@core/dashboard.service';

@Component({
  selector: 'app-revenue-chart',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [MatCardModule, BaseChartDirective],
  template: `
    <mat-card appearance="outlined" class="card">
      <mat-card-header>
        <mat-card-title class="card-title">Revenue Over Time</mat-card-title>
      </mat-card-header>
      <mat-card-content>
        @if (isLoading() && !chartData().datasets[0].data.length) {
          <div class="placeholder"></div>
        } @else {
          <div class="chart-host">
            <canvas
              baseChart
              [data]="chartData()"
              [options]="options"
              type="line"
            ></canvas>
          </div>
        }
      </mat-card-content>
    </mat-card>
  `,
  styles: [
    `
      .card {
        border-radius: var(--app-radius);
        box-shadow: var(--app-card-shadow);
      }

      .card-title {
        font-size: 14px;
        font-weight: 600;
      }

      .chart-host {
        height: 300px;
        position: relative;
      }

      .placeholder {
        height: 300px;
        border-radius: 8px;
        background: rgba(15, 23, 42, 0.04);
        animation: pulse 1.4s ease-in-out infinite;
      }

      @keyframes pulse {
        0%, 100% { opacity: 1; }
        50% { opacity: 0.5; }
      }
    `,
  ],
})
export class RevenueChartComponent {
  private readonly service = inject(DashboardService);

  protected readonly isLoading = this.service.isLoading;

  protected readonly chartData = computed<ChartData<'line'>>(() => {
    const series = this.service.metrics()?.revenueByMonth ?? [];
    return {
      labels: series.map((p) => p.month),
      datasets: [
        {
          data: series.map((p) => p.revenue),
          label: 'Revenue',
          borderColor: '#0f172a',
          backgroundColor: 'rgba(15, 23, 42, 0.08)',
          tension: 0.3,
          borderWidth: 2,
          pointRadius: 3,
          fill: true,
        },
      ],
    };
  });

  protected readonly options: ChartConfiguration<'line'>['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: { mode: 'index', intersect: false },
    plugins: {
      legend: { display: false },
      tooltip: {
        callbacks: {
          label: (ctx) => `$${Number(ctx.parsed.y).toLocaleString()}`,
        },
      },
    },
    scales: {
      x: { grid: { display: false } },
      y: {
        beginAtZero: false,
        ticks: {
          callback: (v) => `$${Number(v).toLocaleString()}`,
        },
      },
    },
  };
}
