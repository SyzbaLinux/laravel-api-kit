

const ROOT = '/var/www/schools.emmanuelsiziba.co.zw';

module.exports = {
    apps: [


        // ─────────────────────────────────────────────
        // 1. Laravel API Server (php artisan serve)
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
        // 2. Laravel Queue Worker
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
