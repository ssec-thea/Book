# BookVoyage / 书旅（Marginalia）

> 用地图连接书与人的阅读应用。通过地图展示作者创作足迹与读者阅读轨迹。

## 本地运行

```bash
npm install
cp .env.example .env   # 编辑填入 MySQL、OSS、JWT 配置
npm run seed            # 初始化数据库
npm run dev             # 启动开发服务器
```

访问 `http://localhost:3000`

## 技术栈

React 19 + TypeScript + Vite 6 + Tailwind CSS v4 + Express 4 + MySQL 8.0 + D3.js + epub.js + pdf.js + 阿里云 OSS + Gemini AI

## 项目结构

```
项目源码/
├── server.ts              # Express 服务入口
├── routes/                # API 路由 (7个模块)
├── middleware/auth.ts     # JWT 认证中间件
├── services/ossService.ts # OSS 上传/下载
├── utils/                 # 工具函数
├── scripts/seed.ts        # 数据库种子
├── deploy/                # 部署配置 (PM2/Nginx/Webhook)
└── src/
    ├── App.tsx            # 根组件
    ├── types.ts           # 类型定义
    ├── db/                # 数据库层 (连接池 + 5个Repository)
    ├── services/api.ts    # 前端API客户端
    └── components/        # 8个核心组件
```

## 完整文档

见项目根目录下的 [需求文档](../需求文档/)、[技术文档](../技术文档/)、[数据库表](../数据库表/) 和 [README.md](../README.md)。
