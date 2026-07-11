# BookVoyage / 书旅（Marginalia）

> 用地图连接书与人的阅读应用。通过地图展示作者创作足迹与读者阅读轨迹，让每一本书都有了地理位置，每一次阅读都成为探索世界的旅程。

## 功能说明

| 模块 | 功能 |
|------|------|
| 用户系统 | 注册/登录（JWT认证 + bcrypt密码哈希）、个人资料编辑、游客模式 |
| 图书管理 | 上传EPUB/PDF/TXT、AI元数据提取、分类管理、拖拽排序、公开/私有可见性 |
| 在线阅读 | EPUB翻页阅读、PDF渲染、TXT章节阅读、书签添加与管理 |
| 世界地图 | D3.js交互式地图、作者国籍分布、读者足迹模式、国家点击详情 |
| 社区广场 | 公开图书浏览、分类筛选、书评feed流、公开书评地图 |
| 3D书架 | CSS 3D效果、按分类排列、拖拽移动和删除 |
| AI辅助 | Gemini AI元数据提取、书评生成、情节位置识别 |

## 技术栈

| 层次 | 技术 |
|------|------|
| 前端框架 | React 19 + TypeScript |
| 构建工具 | Vite 6 |
| UI方案 | Tailwind CSS v4 + Framer Motion + Lucide Icons |
| 地图可视化 | D3.js v7 + TopoJSON |
| EPUB阅读 | epub.js |
| PDF阅读 | pdf.js (pdfjs-dist) |
| 后端服务 | Express 4 + TypeScript |
| 数据库 | MySQL 8.0 (mysql2) |
| 认证 | JWT (jsonwebtoken) + bcryptjs |
| 文件存储 | 阿里云 OSS（服务端代理上传 + 签名URL下载） |
| AI服务 | Google Gemini 3.5 Flash |
| 进程管理 | PM2 |
| 反向代理 | Nginx |

## 项目目录结构

```
book/
├── README.md                   # 本文件
├── .gitignore
├── 需求文档/
│   └── BookVoyage_需求文档.md    # 需求规格说明书
├── 技术文档/
│   ├── 01-系统架构概述.md        # 架构图 + 技术栈对照 + 数据流
│   ├── 02-组件文档.md            # 8个核心组件 Props/State/方法
│   ├── 03-API接口文档.md         # 25+ RESTful API 端点
│   ├── 04-数据库设计文档.md       # 6张表 ER 图 + 索引策略
│   └── 05-开发与部署指南.md       # 环境配置 + PM2 + Nginx
├── 数据库表/
│   ├── schema.sql               # 建库建表SQL
│   ├── ER-diagram.md            # 实体关系图
│   └── seed-books.sql           # 种子数据
└── 项目源码/
    ├── package.json
    ├── server.ts                # Express 服务入口
    ├── vite.config.ts
    ├── tsconfig.json
    ├── .env.example
    ├── index.html
    ├── routes/                  # API 路由模块（6个）
    │   ├── auth.ts              # 认证（注册/登录/个人信息）
    │   ├── books.ts             # 图书 CRUD
    │   ├── reading.ts           # 阅读记录
    │   ├── bookmarks.ts         # 书签管理
    │   ├── reviews.ts           # 书评管理
    │   ├── map.ts               # 地图数据聚合
    │   └── oss.ts               # OSS 上传 + 代理下载
    ├── middleware/
    │   └── auth.ts              # JWT 认证中间件
    ├── services/
    │   └── ossService.ts        # OSS 上传/下载签名
    ├── utils/
    │   ├── password.ts          # bcrypt 密码工具
    │   ├── token.ts             # JWT 令牌工具
    │   └── validators.ts        # 输入校验
    ├── scripts/
    │   └── seed.ts              # 数据库种子脚本
    ├── deploy/
    │   ├── setup.sh             # 一键部署脚本
    │   ├── ecosystem.config.cjs # PM2 配置
    │   ├── nginx.conf           # Nginx 反向代理
    │   └── webhook.cjs          # Gitee Webhook 自动部署
    └── src/
        ├── main.tsx             # React 入口
        ├── App.tsx              # 根组件（状态管理 + 路由 + 认证）
        ├── types.ts             # TypeScript 类型定义
        ├── index.css            # Tailwind + 自定义主题
        ├── services/
        │   └── api.ts           # 前端 API 客户端
        ├── db/
        │   ├── database.ts      # MySQL 连接池
        │   └── repositories/    # 数据访问层（5个）
        │       ├── userRepo.ts
        │       ├── bookRepo.ts
        │       ├── bookmarkRepo.ts
        │       ├── readingRepo.ts
        │       └── reviewRepo.ts
        └── components/          # React 组件（8个）
            ├── WorldMap.tsx          # D3 世界地图
            ├── BookShelf3D.tsx       # 3D书架
            ├── BookReader.tsx        # 阅读器（TXT+EPUB+PDF）
            ├── BookDetailModal.tsx   # 图书详情
            ├── ImportBookForm.tsx    # 图书导入
            ├── ReviewForm.tsx        # 书评编辑
            ├── CommunitySquare.tsx   # 社区广场
            └── UserProfileDashboard.tsx # 个人中心
```

## 本地运行

### 环境要求

- Node.js ≥ 18
- MySQL ≥ 8.0
- 阿里云 OSS Bucket（可选，本地开发可用本地存储）

### 安装步骤

```bash
# 1. 克隆
git clone https://gitee.com/ssecjyq/book.git
cd book/项目源码

# 2. 安装依赖
npm install

# 3. 配置 .env
cp .env.example .env
# 编辑 .env 填入 MySQL密码、OSS密钥、JWT密钥

# 4. 初始化数据库
mysql -u root -p < ../数据库表/schema.sql
npm run seed

# 5. 启动
npm run dev
```

访问 `http://localhost:3000`

## 默认账号

| 邮箱 | 密码 |
|------|------|
| voyager@bookvoyage.com | guestpass123 |

## API 接口概览

| 方法 | 路径 | 说明 |
|------|------|------|
| POST | `/api/auth/register` | 注册 |
| POST | `/api/auth/login` | 登录 |
| GET | `/api/auth/me` | 当前用户 |
| GET | `/api/books` | 图书列表 |
| POST | `/api/books` | 导入图书 |
| GET | `/api/books/:id` | 图书详情 |
| PUT | `/api/books/:id` | 更新图书 |
| DELETE | `/api/books/:id` | 删除图书 |
| POST | `/api/reading` | 保存阅读进度 |
| GET | `/api/bookmarks?bookId=` | 书签列表 |
| POST | `/api/bookmarks` | 添加书签 |
| DELETE | `/api/bookmarks/:id` | 删除书签 |
| GET | `/api/reviews` | 书评列表 |
| POST | `/api/reviews` | 发布书评 |
| DELETE | `/api/reviews/:id` | 删除书评 |
| GET | `/api/map/my-books` | 我的图书地图 |
| GET | `/api/map/public-reviews` | 公开书评地图 |
| POST | `/api/oss/upload` | 上传文件 |
| GET | `/api/oss/proxy?url=` | 文件代理下载 |
| POST | `/api/gemini/extract` | AI元数据提取 |
| POST | `/api/gemini/review` | AI书评生成 |

## 数据库表

| 表 | 说明 |
|----|------|
| users | 用户信息，bcrypt密码哈希 |
| books | 图书元数据 + OSS文件URL |
| reading_records | 阅读会话记录 |
| bookmarks | 书签标记 |
| reviews | 书评 + 地理坐标 |

详见 [数据库设计文档](技术文档/04-数据库设计文档.md)

## 部署上线

详见 [开发与部署指南](技术文档/05-开发与部署指南.md)

已部署至阿里云 ECS: `http://47.109.151.211:3000`

## License

MIT
