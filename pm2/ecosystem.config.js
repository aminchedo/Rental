/**
 * PM2 Ecosystem Configuration for Persian Chat Application
 * 
 * Usage:
 *   pm2 start ecosystem.config.js
 *   pm2 save
 *   pm2 startup
 */

module.exports = {
  apps: [
    // Backend API Server (TypeScript compiled to dist/)
    {
      name: 'persian-chat-api',
      script: './dist/server.js',  // TypeScript compiled output
      cwd: './backend',  // TypeScript backend directory
      instances: 2,  // Number of instances (for load balancing)
      exec_mode: 'cluster',
      watch: false,  // Set to true for development
      max_memory_restart: '1G',
      env: {
        NODE_ENV: 'production',
        PORT: 3001,
        MODEL_PATH: '../models/persian-chat',
        LOG_LEVEL: 'info'
      },
      env_development: {
        NODE_ENV: 'development',
        PORT: 3001,
        MODEL_PATH: '../models/persian-chat',
        LOG_LEVEL: 'debug',
        watch: true
      },
      error_file: '../logs/pm2-api-error.log',
      out_file: '../logs/pm2-api-out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      merge_logs: true,
      autorestart: true,
      max_restarts: 10,
      min_uptime: '10s',
      listen_timeout: 3000,
      kill_timeout: 5000
    },
    
    // Frontend Server (if using Next.js or similar)
    {
      name: 'persian-chat-frontend',
      script: 'npm',
      args: 'start',
      cwd: './frontend',  // Adjust to your frontend directory (could be './client')
      instances: 1,
      exec_mode: 'fork',
      watch: false,
      max_memory_restart: '500M',
      env: {
        NODE_ENV: 'production',
        PORT: 3000
      },
      env_development: {
        NODE_ENV: 'development',
        PORT: 3000
      },
      error_file: '../logs/pm2-frontend-error.log',
      out_file: '../logs/pm2-frontend-out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      merge_logs: true,
      autorestart: true,
      max_restarts: 5,
      min_uptime: '10s'
    }
  ],

  // Deployment configuration (optional)
  deploy: {
    production: {
      user: 'deploy',
      host: ['your-server-ip'],  // Replace with your VPS IP
      ref: 'origin/main',
      repo: 'git@github.com:your-username/persian-chat.git',  // Replace with your repo
      path: '/var/www/persian-chat',
      'pre-deploy-local': '',
      'post-deploy': 'npm install && npm run build && pm2 reload ecosystem.config.js --env production',
      'pre-setup': '',
      ssh_options: 'StrictHostKeyChecking=no'
    },
    development: {
      user: 'deploy',
      host: ['your-dev-server-ip'],
      ref: 'origin/develop',
      repo: 'git@github.com:your-username/persian-chat.git',
      path: '/var/www/persian-chat-dev',
      'post-deploy': 'npm install && pm2 reload ecosystem.config.js --env development',
      env: {
        NODE_ENV: 'development'
      }
    }
  }
};
