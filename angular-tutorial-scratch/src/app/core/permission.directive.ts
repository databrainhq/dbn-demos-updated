import {
  Directive,
  inject,
  Input,
  TemplateRef,
  ViewContainerRef,
  effect,
} from '@angular/core';
import { AuthStore, Role } from './auth.store';

/**
 * Structural directive sibling of React's <PermissionGate>:
 *   <ng-container *appPermission="['admin','manager']; else: denied">
 *     <button mat-flat-button color="warn">Delete account</button>
 *   </ng-container>
 *   <ng-template #denied>You don't have access.</ng-template>
 */
@Directive({
  selector: '[appPermission]',
  standalone: true,
})
export class PermissionDirective {
  private readonly templateRef = inject(TemplateRef<unknown>);
  private readonly viewContainer = inject(ViewContainerRef);
  private readonly store = inject(AuthStore);

  private allowed: Role[] = [];
  private elseTemplate: TemplateRef<unknown> | null = null;

  @Input({ required: true }) set appPermission(roles: Role[]) {
    this.allowed = roles;
    this.render();
  }

  @Input() set appPermissionElse(template: TemplateRef<unknown> | null) {
    this.elseTemplate = template;
    this.render();
  }

  constructor() {
    effect(() => {
      this.store.user();
      this.render();
    });
  }

  private render(): void {
    this.viewContainer.clear();
    if (this.store.hasRole(this.allowed)) {
      this.viewContainer.createEmbeddedView(this.templateRef);
    } else if (this.elseTemplate) {
      this.viewContainer.createEmbeddedView(this.elseTemplate);
    }
  }
}
