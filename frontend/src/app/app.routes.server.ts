import { RenderMode, ServerRoute } from '@angular/ssr';

export const serverRoutes: ServerRoute[] = [
    {
        // Parameterized routes cannot be prerendered without explicit params
        path: 'super-admin/schools/:id',
        renderMode: RenderMode.Server,
    },
    {
        path: 'super-admin/schools/:id/edit',
        renderMode: RenderMode.Server,
    },
    {
        // Auth routes are client-side only
        path: 'auth/**',
        renderMode: RenderMode.Client,
    },
    {
        // Tenant routes require auth — render on server per-request
        path: 'tenant/**',
        renderMode: RenderMode.Server,
    },
    {
        // Everything else can be prerendered
        path: '**',
        renderMode: RenderMode.Prerender,
    },
];
