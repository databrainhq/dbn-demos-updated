import {
  ChangeDetectionStrategy,
  Component,
  inject,
  OnDestroy,
  OnInit,
} from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { DashboardService } from '@core/dashboard.service';
import { MetricCardsComponent } from '@features/overview/metric-cards.component';
import { RevenueChartComponent } from '@features/overview/revenue-chart.component';
import { PermissionDirective } from '@core/permission.directive';

/**
 * Lazy-loaded route (see app.routes.ts) — Step 7 of the tutorial.
 *
 * The Revenue chart is wrapped in @defer (on viewport) so Chart.js and the
 * chart component bundle only download when the chart scrolls into view.
 * Mirrors React.lazy() + Suspense from the React starter.
 */
@Component({
  selector: 'app-analytics',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    MatCardModule,
    MatProgressSpinnerModule,
    MetricCardsComponent,
    RevenueChartComponent,
    PermissionDirective,
  ],
  template: `
    <section class="page">
      <app-metric-cards />

      @defer (on viewport) {
        <app-revenue-chart />
      } @placeholder {
        <mat-card appearance="outlined" class="placeholder-card">
          <mat-card-content>Chart loads when in view…</mat-card-content>
        </mat-card>
      } @loading (minimum 200ms) {
        <mat-card appearance="outlined" class="placeholder-card">
          <mat-spinner diameter="24" />
        </mat-card>
      }

      <ng-template #denied>
        <p class="denied">You don't have access to this section.</p>
      </ng-template>
      <ng-container *appPermission="['admin']; appPermissionElse: denied">
        <mat-card appearance="outlined" class="admin-card">
          <mat-card-content>
            Admin-only content (gated via PermissionDirective — Step 6).
          </mat-card-content>
        </mat-card>
      </ng-container>
    </section>
  `,
  styles: [
    `
      .page {
        display: flex;
        flex-direction: column;
        gap: 24px;
      }

      .placeholder-card,
      .admin-card {
        border-radius: var(--app-radius);
        box-shadow: var(--app-card-shadow);
        min-height: 80px;
      }

      .denied {
        color: var(--app-muted);
        font-size: 14px;
      }
    `,
  ],
})
export class AnalyticsPage implements OnInit, OnDestroy {
  private readonly service = inject(DashboardService);

  ngOnInit(): void {
    this.service.startPolling();
  }

  ngOnDestroy(): void {
    this.service.stopPolling();
  }
}
