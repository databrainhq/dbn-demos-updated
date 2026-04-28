import {
  ChangeDetectionStrategy,
  Component,
  inject,
  OnDestroy,
  OnInit,
} from '@angular/core';
import { DashboardService } from '@core/dashboard.service';
import { MetricCardsComponent } from './metric-cards.component';
import { RevenueChartComponent } from './revenue-chart.component';

@Component({
  selector: 'app-overview',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [MetricCardsComponent, RevenueChartComponent],
  template: `
    <section class="page">
      <app-metric-cards />
      <div class="grid">
        <app-revenue-chart />
        <!-- Add more charts here. The Analytics route demonstrates @defer. -->
      </div>
    </section>
  `,
  styles: [
    `
      .page {
        display: flex;
        flex-direction: column;
        gap: 24px;
      }

      .grid {
        display: grid;
        gap: 24px;
        grid-template-columns: 1fr;
      }

      @media (min-width: 1024px) {
        .grid {
          grid-template-columns: repeat(2, 1fr);
        }
      }
    `,
  ],
})
export class OverviewPage implements OnInit, OnDestroy {
  private readonly service = inject(DashboardService);

  ngOnInit(): void {
    this.service.startPolling();
  }

  ngOnDestroy(): void {
    this.service.stopPolling();
  }
}
