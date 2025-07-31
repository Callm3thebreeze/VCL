// Configuración PM2 para Vocali Backend
module.exports = {
  apps: [
    {
      name: 'vocali-backend',
      script: './src/app.js',
      cwd: '/opt/vocali',
      instances: 1,
      exec_mode: 'cluster',
      env: {
        NODE_ENV: 'development',
        PORT: 3000,
      },
      env_production: {
        NODE_ENV: 'production',
        PORT: 3000,
      },
      log_file: '/opt/vocali/logs/combined.log',
      out_file: '/opt/vocali/logs/out.log',
      error_file: '/opt/vocali/logs/error.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      merge_logs: true,
      max_memory_restart: '1G',
      restart_delay: 1000,
      max_restarts: 10,
      min_uptime: '10s',
    },
  ],
};
