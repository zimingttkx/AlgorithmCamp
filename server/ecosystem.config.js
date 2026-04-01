/**
 * PM2 Ecosystem Configuration
 * AlgorithmCamp Backend API
 *
 * Usage:
 *   pm2 start ecosystem.config.js
 *   pm2 save
 *   pm2 startup  # Generate init script for auto-restart on reboot
 */

module.exports = {
  apps: [
    {
      name: 'algorithmcamp-api',
      script: 'index.js',
      cwd: '/var/www/algorithmcamp/server',
      instances: 1,
      exec_mode: 'fork',  // Fixed: use fork mode with instances=1
      autorestart: true,
      watch: false,
      max_memory_restart: '500M',

      env: {
        NODE_ENV: 'production',
        PORT: 3000,
        FRONTEND_URL: 'https://yourdomain.com',
        // JWT_SECRET should be set via environment variable in production
        JWT_SECRET: process.env.JWT_SECRET || 'CHANGE_THIS_IN_PRODUCTION',
        // PostgreSQL connection
        PGHOST: process.env.PGHOST || 'localhost',
        PGPORT: process.env.PGPORT || 5432,
        PGDATABASE: process.env.PGDATABASE || 'algorithmcamp',
        PGUSER: process.env.PGUSER || 'postgres',
        PGPASSWORD: process.env.PGPASSWORD || '',
        // GitHub OAuth
        GITHUB_CLIENT_ID: process.env.GITHUB_CLIENT_ID || '',
        GITHUB_CLIENT_SECRET: process.env.GITHUB_CLIENT_SECRET || '',
        API_URL: process.env.API_URL || 'https://api.yourdomain.com',
        // GitHub Stats
        GITHUB_TOKEN: process.env.GITHUB_TOKEN || '',
        CRON_ENABLED: process.env.CRON_ENABLED || 'false'
      },

      // Logging
      error_file: '/var/www/algorithmcamp/server/logs/error.log',
      out_file: '/var/www/algorithmcamp/server/logs/out.log',
      log_file: '/var/www/algorithmcamp/server/logs/combined.log',
      time: true,

      // Graceful shutdown
      kill_timeout: 5000,
      shutdown_with_message: true
    }
  ]
}
