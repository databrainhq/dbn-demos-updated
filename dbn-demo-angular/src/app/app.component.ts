import { Component, AfterViewInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import '@databrainhq/plugin/web';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
export class AppComponent implements AfterViewInit {
  public token: string = '';
  public dashboardId: string = '';
  public dashboardOptions = {
    showDashboardActions: false
  };
  public dbnDashboard!: HTMLElement & {
    onClickCreateMetric?: () => void;
    onClickManageMetrics?: () => void;
    onClickScheduleReports?: () => void;
    onClickCustomizeLayout?: () => void;
  };

  ngAfterViewInit() {
    const dbnDashboardElement = document.querySelector('dbn-dashboard');
    if (dbnDashboardElement) {
      this.dbnDashboard = dbnDashboardElement.shadowRoot?.querySelector('.dbn-dashboard') as HTMLElement & {
        onClickCreateMetric?: () => void;
        onClickManageMetrics?: () => void;
        onClickScheduleReports?: () => void;
        onClickCustomizeLayout?: () => void;
      };
    } else {
      console.error('dbn-dashboard component not found.');
    }
  }

  createMetric() {
    if (this.dbnDashboard?.onClickCreateMetric) {
      this.dbnDashboard.onClickCreateMetric();
    } else {
      console.error('Create Metric function not available.');
    }
  }

  constructor() {
    const urlParams = new URLSearchParams(location.search);
    this.token = urlParams.get('token') || '';
    this.dashboardId = urlParams.get('dashboardId') || '';
  }
}
