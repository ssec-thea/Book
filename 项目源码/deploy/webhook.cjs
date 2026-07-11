/**
 * Gitee Webhook 自动部署服务
 *
 * 在宝塔面板添加 Node 项目:
 *   启动文件: deploy/webhook.cjs
 *   端口: 9001
 *
 * Gitee 仓库设置 → Webhooks → 添加:
 *   URL: http://你的ECS公网IP:9001/gitee
 *   密码: (留空或自定义, 然后设 WEBHOOK_SECRET)
 *   事件: Push
 */
const http = require('http');
const crypto = require('crypto');
const { execSync } = require('child_process');

const PORT = 9001;
const SECRET = process.env.WEBHOOK_SECRET || '';
const PROJECT_DIR = process.cwd(); // 项目源码目录

const server = http.createServer((req, res) => {
  if (req.method === 'POST' && req.url === '/gitee') {
    let body = '';

    req.on('data', (chunk) => {
      body += chunk.toString();
    });

    req.on('end', () => {
      // 可选: 验证签名
      if (SECRET) {
        const signature = req.headers['x-gitee-token'] || '';
        if (signature !== SECRET) {
          res.writeHead(403);
          return res.end('Forbidden');
        }
      }

      console.log(`[${new Date().toISOString()}] Webhook triggered, deploying...`);

      try {
        execSync(`cd "${PROJECT_DIR}" && git pull origin master`, { encoding: 'utf8', timeout: 30000 });
        console.log('  git pull: OK');
      } catch (e) {
        console.error('  git pull failed:', e.message);
        res.writeHead(500);
        return res.end('Git pull failed');
      }

      try {
        execSync(`cd "${PROJECT_DIR}" && npm install --production`, { encoding: 'utf8', timeout: 120000 });
        console.log('  npm install: OK');
      } catch (e) {
        console.error('  npm install failed:', e.message);
      }

      try {
        execSync(`cd "${PROJECT_DIR}" && npm run build`, { encoding: 'utf8', timeout: 120000 });
        console.log('  build: OK');
      } catch (e) {
        console.error('  build failed:', e.message);
        res.writeHead(500);
        return res.end('Build failed');
      }

      try {
        execSync(`cd "${PROJECT_DIR}" && pm2 reload deploy/ecosystem.config.cjs`, { encoding: 'utf8', timeout: 10000 });
        console.log('  pm2 reload: OK');
      } catch (e) {
        console.error('  pm2 reload failed:', e.message);
      }

      console.log('  Deploy complete!');
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ status: 'ok' }));
    });
  } else {
    res.writeHead(200);
    res.end('BookVoyage Webhook Server');
  }
});

server.listen(PORT, () => {
  console.log(`Webhook server listening on port ${PORT}`);
  console.log(`Project dir: ${PROJECT_DIR}`);
});
