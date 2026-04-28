import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { DashboardLayoutComponent } from '@layout/dashboard-layout.component';

@Component({
  selector: 'app-root',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterOutlet, DashboardLayoutComponent],
  template: `
    <app-dashboard-layout>
      <router-outlet />
    </app-dashboard-layout>
  `,
})
export class AppComponent {}
