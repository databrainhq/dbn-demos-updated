import {
  ChangeDetectionStrategy,
  Component,
  computed,
  signal,
} from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';

interface NavItem {
  label: string;
  icon: string;
  route: string;
}

@Component({
  selector: 'app-dashboard-layout',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    RouterLink,
    RouterLinkActive,
    MatToolbarModule,
    MatSidenavModule,
    MatListModule,
    MatIconModule,
    MatButtonModule,
  ],
  template: `
    <mat-sidenav-container class="layout">
      <mat-sidenav
        mode="side"
        [opened]="true"
        [class.collapsed]="!sidebarOpen()"
      >
        <div class="brand">
          <button mat-icon-button (click)="toggleSidebar()">
            <mat-icon>{{ sidebarOpen() ? 'menu_open' : 'menu' }}</mat-icon>
          </button>
          @if (sidebarOpen()) {
            <span class="brand-text">Dashboard</span>
          }
        </div>
        <mat-nav-list>
          @for (item of navItems; track item.route) {
            <a
              mat-list-item
              [routerLink]="item.route"
              routerLinkActive="active"
              [attr.aria-label]="item.label"
            >
              <mat-icon matListItemIcon>{{ item.icon }}</mat-icon>
              @if (sidebarOpen()) {
                <span matListItemTitle>{{ item.label }}</span>
              }
            </a>
          }
        </mat-nav-list>
      </mat-sidenav>

      <mat-sidenav-content>
        <mat-toolbar color="primary" class="header">
          <span class="header-title">{{ headerTitle() }}</span>
        </mat-toolbar>
        <main class="content">
          <ng-content />
        </main>
      </mat-sidenav-content>
    </mat-sidenav-container>
  `,
  styles: [
    `
      .layout {
        height: 100vh;
      }

      mat-sidenav {
        width: 240px;
        border-right: 1px solid var(--app-border);
        background: #ffffff;
        transition: width 0.2s ease;
      }

      mat-sidenav.collapsed {
        width: 64px;
      }

      .brand {
        display: flex;
        align-items: center;
        gap: 8px;
        height: 56px;
        padding: 0 12px;
        border-bottom: 1px solid var(--app-border);
      }

      .brand-text {
        font-weight: 600;
        font-size: 15px;
      }

      .header {
        position: sticky;
        top: 0;
        z-index: 10;
        height: 56px;
      }

      .header-title {
        font-size: 16px;
        font-weight: 600;
        text-transform: capitalize;
      }

      .content {
        padding: 24px;
        min-height: calc(100vh - 56px);
      }

      a.active {
        background: rgba(15, 23, 42, 0.06);
      }
    `,
  ],
})
export class DashboardLayoutComponent {
  protected readonly sidebarOpen = signal(true);

  protected readonly navItems: NavItem[] = [
    { label: 'Overview', icon: 'dashboard', route: '/overview' },
    { label: 'Analytics', icon: 'analytics', route: '/analytics' },
  ];

  protected readonly headerTitle = computed(() =>
    this.sidebarOpen() ? 'Overview' : 'Dashboard',
  );

  protected toggleSidebar(): void {
    this.sidebarOpen.update((open) => !open);
  }
}
