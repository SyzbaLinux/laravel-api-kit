import { Directive, effect, inject, input, TemplateRef, ViewContainerRef } from '@angular/core';
import { AuthService } from '../../core/services/auth.service';

/**
 * Structural directive that shows/hides an element based on the user's role.
 *
 * Usage:
 *   <div *hasRole="['school_admin', 'hod']">Only for admins and HODs</div>
 */
@Directive({
    selector: '[hasRole]',
})
export class HasRoleDirective {
    private readonly authService = inject(AuthService);
    private readonly templateRef = inject(TemplateRef<unknown>);
    private readonly viewContainer = inject(ViewContainerRef);

    readonly hasRole = input<string[]>([]);

    private hasView = false;

    constructor() {
        effect(() => {
            const allowedRoles = this.hasRole();
            const userRole = this.authService.currentUser()?.role?.name ?? '';
            const shouldShow = allowedRoles.length === 0 || allowedRoles.includes(userRole);

            if (shouldShow && !this.hasView) {
                this.viewContainer.createEmbeddedView(this.templateRef);
                this.hasView = true;
            } else if (!shouldShow && this.hasView) {
                this.viewContainer.clear();
                this.hasView = false;
            }
        });
    }
}
