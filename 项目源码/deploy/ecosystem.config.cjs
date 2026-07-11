/**
 * PM2 进程管理配置
 * 使用: pm2 start deploy/ecosystem.config.cjs
 */
module.exports = {
  apps: [
    {
      name: 'bookvoyage',
      script: 'dist/server.cjs',
      cwd: process.cwd(),
      instances: 1,
      exec_mode: 'fork',
      env: {
        NODE_ENV: 'production',
        PORT: 3000,
      },
      // 日志
      error_file: './logs/err.log',
      out_file: './logs/out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss',
      // 自动重启
      max_memory_restart: '500M',
      // 监听文件变化（配合 webhook 自动部署）
      watch: false,
    },
  ],
};
