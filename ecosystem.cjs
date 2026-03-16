/**
 * PM2 Ecosystem — schools.emmanuelsiziba.co.zw
 *
 * Manages:
 *  1. Angular SSR server  (Node.js,  port 4300)
 *  2. Laravel API server  (PHP,      port 4301)
 *  3. Laravel Queue Worker (PHP)
 *
 * Usage:
 *   pm2 start ecosystem.cjs
 *   pm2 save
 *   pm2 startup   ← run the generated command as root
 *
 * Before starting, build the frontend:
 *   cd /var/www/schools.emmanuelsiziba.co.zw/frontend && npm run build
 */

const ROOT = '/var/www/schools.emmanuelsiziba.co.zw';

module.exports = {
    apps: [
        // ─────────────────────────────────────────────
        // 1. Angular SSR (Node.js Express server)
        // ─────────────────────────────────────────────
        {
            name: 'schools-frontend',
            script: `${ROOT}/frontend/dist/apppp/server/server.mjs`,
            interpreter: 'node',
            instances: 1,           // increase to 'max' for cluster mode if desired
            exec_mode: 'fork',
            watch: false,
            env: {
                NODE_ENV: 'production',
                PORT: 4300,
            },
            error_file: `${ROOT}/logs/frontend-error.log`,
            out_file: `${ROOT}/logs/frontend-out.log`,
            log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
            restart_delay: 4300,
            max_restarts: 10,
        },

        // ─────────────────────────────────────────────
        // 2. Laravel API Server (php artisan serve)
        // ─────────────────────────────────────────────
        {
            name: 'schools-api',
            script: 'artisan',
            interpreter: 'php',
            args: 'serve --host=127.0.0.1 --port=4301',
            cwd: ROOT,
            watch: false,
            env: {
                APP_ENV: 'production',
            },
            error_file: `${ROOT}/logs/api-error.log`,
            out_file: `${ROOT}/logs/api-out.log`,
            log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
            restart_delay: 3000,
            max_restarts: 10,
        },

        // ─────────────────────────────────────────────
        // 3. Laravel Queue Worker
        // ─────────────────────────────────────────────
        {
            name: 'schools-queue',
            script: 'artisan',
            interpreter: 'php',
            args: 'queue:work --sleep=3 --tries=3 --max-time=3600',
            cwd: ROOT,
            watch: false,
            env: {
                APP_ENV: 'production',
            },
            error_file: `${ROOT}/logs/queue-error.log`,
            out_file: `${ROOT}/logs/queue-out.log`,
            log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
            restart_delay: 5000,
            max_restarts: 10,
        },
    ],
};
