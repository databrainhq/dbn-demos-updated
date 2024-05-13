import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import '@databrainhq/plugin/web';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
export class AppComponent {
  public token: string = '';
  public dashboardId: string = '';

  constructor() {
    const urlParams = new URLSearchParams(location.search);
    this.token = urlParams.get('token') || '';
    this.dashboardId = urlParams.get('dashboardId') || '';
  }
}
