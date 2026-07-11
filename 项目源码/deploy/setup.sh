#!/bin/bash
# BookVoyage ECS 部署脚本
# 在 ECS 上以 root 身份执行: bash deploy/setup.sh

set -e

PROJECT_DIR="/opt/bookvoyage"
REPO_URL="https://gitee.com/ssecjyq/book.git"

echo "=== BookVoyage 部署脚本 ==="
echo ""

# 1. 安装 Node.js (如果未安装)
if ! command -v node &>/dev/null; then
  echo "[1/6] 安装 Node.js 20.x..."
  curl -fsSL https://rpm.nodesource.com/setup_20.x | bash -
  yum install -y nodejs
else
  echo "[1/6] Node.js 已安装: $(node -v)"
fi

# 2. 安装 PM2
if ! command -v pm2 &>/dev/null; then
  echo "[2/6] 安装 PM2..."
  npm install -g pm2
else
  echo "[2/6] PM2 已安装: $(pm2 -v)"
fi

# 3. 克隆项目
if [ ! -d "$PROJECT_DIR" ]; then
  echo "[3/6] 克隆项目..."
  git clone "$REPO_URL" "$PROJECT_DIR"
else
  echo "[3/6] 项目已存在, 执行 git pull..."
  cd "$PROJECT_DIR"
  git pull origin master
fi
cd "$PROJECT_DIR"

# 4. 进入源码目录并安装依赖
echo "[4/6] 安装依赖..."
if [ ! -d "项目源码" ]; then
  echo "错误: 未找到 项目源码/ 目录"
  exit 1
fi
cd 项目源码
npm install --production

# 5. 创建 .env
echo "[5/6] 配置环境变量..."
if [ ! -f .env ]; then
  cat > .env << 'ENVEOF'
# Gemini AI
GEMINI_API_KEY=MY_GEMINI_API_KEY

# JWT
JWT_SECRET=$(openssl rand -hex 32)

# MySQL (请修改为你的实际配置)
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=你的MySQL密码
DB_NAME=bookvoyage

# OSS (请修改为你的实际配置)
OSS_REGION=oss-cn-chengdu
OSS_BUCKET=reading-app-books
OSS_ACCESS_KEY_ID=你的AccessKey
OSS_ACCESS_KEY_SECRET=你的AccessKeySecret
OSS_ENDPOINT=https://oss-cn-chengdu.aliyuncs.com

# 文件大小限制
MAX_FILE_SIZE_MB=50
PORT=3000
ENVEOF
  echo "  已创建 .env 模板, 请用 vim .env 修改实际配置!"
else
  echo "  .env 已存在, 跳过"
fi

# 6. 确保目录存在
mkdir -p data/books data/tmp logs

# 7. 构建
echo "[6/6] 构建项目..."
npm run build

echo ""
echo "=== 部署完成! ==="
echo ""
echo "接下来手动操作:"
echo "1. 编辑 .env:  vim .env  (修改 MySQL密码、OSS密钥等)"
echo "2. 初始化数据库:  mysql -u root -p < ../数据库表/schema.sql"
echo "3. 导入种子数据:  npm run seed"
echo "4. 启动服务:       pm2 start deploy/ecosystem.config.cjs"
echo "5. 保存 PM2:       pm2 save && pm2 startup"
echo "6. 配置 Nginx:     参考 deploy/nginx.conf"
echo "7. 开放防火墙端口:  firewall-cmd --add-port=80/tcp --permanent && firewall-cmd --reload"
echo "8. 配置 Webhook:   pm2 start deploy/webhook.cjs --name webhook  (可选)"
echo ""
echo "阿里云安全组也需开放 80 端口!"
