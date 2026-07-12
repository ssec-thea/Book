---
AIGC:
    Label: "1"
    ContentProducer: 001191110102MACQD9K64018705
    ProduceID: 3014195003831319_0-data_volume/7660454773862236422-files/所有对话/主对话/BookVoyage_需求文档.md
    ReservedCode1: ""
    ContentPropagator: 001191110102MACQD9K64028705
    PropagateID: 3014195003831319#1783601692840
    ReservedCode2: ""
---
# BookVoyage 书旅 - 需求规格说明书

## 1. 项目概述

### 1.1 项目名称
**BookVoyage / 书旅**

基于 React 的在线图书管理与阅读分享平台

### 1.2 项目目标
构建一个融合图书管理、在线阅读、社区分享和地理可视化的现代化阅读平台。用户不仅可以管理个人藏书、记录阅读轨迹，还能通过世界地图探索全球读者的阅读足迹，发现同书读者的书评与观点。

### 1.3 目标用户
- 个人阅读爱好者：管理和记录阅读
- 阅读社交用户：分享书评、发现同好
- 地理可视化爱好者：通过地图探索图书与读者的全球分布

### 1.4 系统角色

**普通用户**
- 注册登录
- 上传图书（EPUB/TXT/PDF）
- 在线阅读图书
- 管理书签（添加、跳转、删除）
- 发布书评（含地理位置标记）
- 设置图书/书评的公开/私有状态
- 查看世界地图（我的图书/他人图书模式）
- 查看公开图书广场
- 管理个人中心

**管理员**（可选角色）
- 管理所有公开书评
- 删除违规内容
- 管理用户账号
- 查看系统统计数据

---

## 2. 功能需求

### 2.1 用户认证模块
**优先级：P0**

#### 2.1.1 用户登录
- 支持邮箱/用户名 + 密码登录
- 登录状态持久化（JWT Token）
- 登录失败提示（账号不存在/密码错误）
- 支持"记住我"功能（延长 Token 有效期）

#### 2.1.2 用户注册（可选）
- 邮箱注册
- 用户名唯一性验证
- 密码强度校验
- 邮箱验证（模拟）

#### 2.1.3 用户登出
- 清除本地 Token
- 跳转回登录页

### 2.2 图书管理模块
**优先级：P0**

#### 2.2.1 图书导入
- 支持格式：EPUB、TXT、PDF（可选）
- 文件上传组件（拖拽 + 点击）
- 自动解析图书元数据：
  - 书名（从文件元数据提取）
  - 作者
  - 封面（EPUB 可提取封面图片）
  - 作者国籍（需用户手动填写或从数据库匹配）
- 导入进度显示
- 导入成功/失败提示

#### 2.2.2 图书列表
- 卡片视图 / 列表视图切换
- 搜索功能（按书名、作者）
- 筛选功能（按分类、作者国籍）
- 排序功能（按添加时间、书名、阅读时长）
- 分页或无限滚动

#### 2.2.3 图书详情
- 显示图书元数据（封面、书名、作者、国籍等）
- 显示阅读进度
- 显示阅读时长统计
- 显示书评列表
- 显示书签列表

#### 2.2.4 图书编辑
- 修改图书元数据（书名、作者、国籍、分类）
- 上传/更换封面

#### 2.2.5 图书删除
- 二次确认弹窗
- 删除后从书架移除

### 2.3 阅读管理模块
**优先级：P0**

#### 2.3.1 在线阅读器
- EPUB 阅读器（使用 epub.js 或类似库）
- TXT 阅读器（简单文本展示）
- 阅读进度记录（自动保存到后端）
- 字体大小调节
- 主题切换（白天/夜间）

#### 2.3.2 书签功能
- 添加书签（记录当前阅读位置）
- 书签列表（显示位置、备注）
- 跳转到书签位置
- 删除书签

#### 2.3.3 阅读时间统计
- 自动记录每次阅读时长
- 统计总阅读时长
- 按日/周/月统计
- 可视化图表（柱状图/折线图）

#### 2.3.4 书评功能
- 添加书评（标题 + 内容）
- 评分（1-5 星）
- **地理位置标记**：写书评时可选填写当前位置（自动获取或手动输入城市/国家）
- **可见性设置**：
  - 私有（仅自己可见）
  - 公开（所有人可见，会显示在地图的他人图书模式中）
- **书写时间**：自动记录，公开书评会展示书写时间
- 编辑书评
- 删除书评
- 书评列表（按时间倒序）

### 2.4 可见性控制模块
**优先级：P1**

#### 2.4.1 图书可见性设置
- 私有（仅自己可见）
- 公开（所有人可见）
- 设置入口：
  - 图书导入时选择默认可见性
  - 图书详情页修改可见性
  - 批量修改可见性

#### 2.4.2 公开图书展示
- 公开图书广场（首页）
- 展示其他用户的公开图书
- 按作者国籍筛选
- 按热度/时间排序

### 2.5 可视化展示模块
**优先级：P1**

#### 2.5.1 世界地图视图
- 交互式世界地图（使用 D3.js）
- **两大模式切换**：
  1. **我的图书模式（个人视角）**：
     - 显示自己图书的作者书写位置（Author origin）
     - 按作者国籍分组统计
     - 点击标注弹出该国家的图书列表
  2. **他人图书模式（社区视角）**：
     - **子模式 2.1 - 同书读者**：
       - 查看自己正在阅读的同一本书的他人公开书评的阅读位置
       - 需要在图书详情页进入，或从当前阅读图书列表选择
       - 显示同一本书的所有公开书评的地理位置分布
     - **子模式 2.2 - 全部公开书评**：
       - 查看所有用户公开书评的阅读位置分布
       - 可按图书、作者、评分筛选
       - 显示整体社区的阅读地理分布
- 地图标注：
  - 显示每个国家/地区的数量统计
  - 点击标注弹出对应的图书列表或书评列表
  - 书评弹窗显示：读者昵称、评分、书写时间、内容摘要
- 支持缩放、拖拽
- 地图主题适配（白天/夜间）
- **统计面板**：
  - 我的图书模式：显示已映射图书数量和国家数
  - 他人图书模式：显示公开书评数量和涉及国家数

#### 2.5.2 书架视图
- 3D 书架效果（CSS 3D 变换）
- 按分类排列图书
- 书架可切换（如"我的藏书"、"已读"、"想读"）
- 点击图书进入详情

### 2.6 用户界面模块
**优先级：P0**

#### 2.6.1 主界面布局
- 顶部导航栏：
  - Logo
  - 搜索框
  - 用户头像（下拉菜单：个人中心、设置、登出）
  - 视图切换按钮（地图/书架）
- 侧边栏（可选）：
  - 快速导航（全部图书、已读、未读）
  - 分类筛选
- 主内容区：
  - 根据视图切换显示地图或书架
- 底部（可选）：
  - 版权信息
  - 快捷链接

#### 2.6.2 个人中心
- 用户信息展示（头像、昵称、邮箱）
- 阅读统计总览：
  - 总图书数
  - 已读图书数
  - 总阅读时长
  - 本月阅读时长
- 最近阅读记录
- 快捷操作入口

---

## 3. 业务流程

### 3.1 图书上传流程
```
选择文件
  ↓
前端校验格式（EPUB/TXT/PDF）
  ↓
读取文件（FileReader API）
  ↓
提取元数据（书名、作者、封面）
  ↓
上传服务器（FormData）
  ↓
保存数据库（插入 Book 记录）
  ↓
返回 Book 对象
  ↓
刷新书架（更新 BookStore）
```

### 3.2 阅读流程
```
进入图书详情页
  ↓
点击"开始阅读"
  ↓
打开阅读器（初始化 epub.js）
  ↓
自动恢复阅读位置（查询 ReadingRecord）
  ↓
开始计时（记录 startTime）
  ↓
定时保存进度（每 30 秒）
  ↓
退出时保存进度（visibilitychange / beforeunload）
  ↓
记录阅读时长（更新 ReadingRecord）
  ↓
返回详情页（更新阅读统计）
```

### 3.3 登录流程
```
输入账号密码
  ↓
前端校验（非空、格式）
  ↓
调用登录接口 POST /api/login
  ↓
返回 Token + 用户信息
  ↓
存入 React State（UserStore）
  ↓
存入 localStorage（持久化）
  ↓
跳转首页
```

### 3.4 书评发布流程
```
点击"写书评"
  ↓
填写标题、内容、评分
  ↓
选择是否公开
  ↓
可选：获取地理位置（Geolocation API）
  ↓
调用 POST /api/reviews
  ↓
保存数据库
  ↓
刷新书评列表
  ↓
如果是公开书评 → 更新地图数据
```

---

## 4. 数据库设计

### 4.1 用户表（user）
| 字段 | 类型 | 说明 |
|------|------|------|
| id | INT | 主键，自增 |
| username | VARCHAR(50) | 用户名，唯一 |
| email | VARCHAR(100) | 邮箱，唯一 |
| password | VARCHAR(255) | 密码（加密存储） |
| avatar | VARCHAR(255) | 头像 URL |
| createTime | DATETIME | 创建时间 |
| updateTime | DATETIME | 更新时间 |

### 4.2 图书表（book）
| 字段 | 类型 | 说明 |
|------|------|------|
| id | INT | 主键，自增 |
| userId | INT | 所属用户 ID |
| title | VARCHAR(200) | 书名 |
| author | VARCHAR(100) | 作者 |
| country | VARCHAR(50) | 作者国籍 |
| cover | VARCHAR(255) | 封面 URL |
| filePath | VARCHAR(255) | 文件存储路径 |
| fileType | VARCHAR(10) | 文件类型（epub/txt/pdf） |
| category | VARCHAR(50) | 分类 |
| visibility | TINYINT | 可见性（0=私有，1=公开） |
| totalCount | INT | 总页数/字数 |
| createTime | DATETIME | 上传时间 |
| updateTime | DATETIME | 更新时间 |

### 4.3 阅读记录表（reading_record）
| 字段 | 类型 | 说明 |
|------|------|------|
| id | INT | 主键，自增 |
| userId | INT | 用户 ID |
| bookId | INT | 图书 ID |
| progress | VARCHAR(100) | 阅读位置（EPUB CFI 或页码） |
| readTime | INT | 累计阅读时长（秒） |
| lastReadTime | DATETIME | 最后阅读时间 |
| createTime | DATETIME | 创建时间 |
| updateTime | DATETIME | 更新时间 |

### 4.4 书签表（bookmark）
| 字段 | 类型 | 说明 |
|------|------|------|
| id | INT | 主键，自增 |
| userId | INT | 用户 ID |
| bookId | INT | 图书 ID |
| position | VARCHAR(100) | 书签位置 |
| note | TEXT | 备注 |
| createTime | DATETIME | 创建时间 |

### 4.5 书评表（review）
| 字段 | 类型 | 说明 |
|------|------|------|
| id | INT | 主键，自增 |
| userId | INT | 用户 ID |
| bookId | INT | 图书 ID |
| title | VARCHAR(200) | 书评标题 |
| content | TEXT | 书评内容 |
| score | TINYINT | 评分（1-5） |
| longitude | DECIMAL(10,6) | 经度（可选） |
| latitude | DECIMAL(10,6) | 纬度（可选） |
| locationName | VARCHAR(100) | 地理位置名称 |
| visibility | TINYINT | 可见性（0=私有，1=公开） |
| createTime | DATETIME | 书写时间 |
| updateTime | DATETIME | 更新时间 |

---

## 5. 接口设计

### 5.1 用户认证接口
**登录**
```
POST /api/login
请求：
{
  "username": "admin",
  "password": "123456"
}
返回：
{
  "code": 200,
  "data": {
    "token": "eyJhbGciOiJIUzI1...",
    "user": {
      "id": 1,
      "username": "admin",
      "email": "admin@example.com",
      "avatar": "https://..."
    }
  }
}
```

**注册**
```
POST /api/register
请求：
{
  "username": "newuser",
  "email": "new@example.com",
  "password": "password123"
}
返回：
{
  "code": 200,
  "message": "注册成功"
}
```

**获取当前用户信息**
```
GET /api/user/info
返回：
{
  "code": 200,
  "data": {
    "id": 1,
    "username": "admin",
    "email": "admin@example.com",
    "avatar": "https://..."
  }
}
```

### 5.2 图书管理接口
**获取图书列表**
```
GET /api/books
参数：page=1&size=20&keyword=&category=
返回：
{
  "code": 200,
  "data": {
    "list": [...],
    "total": 100
  }
}
```

**上传图书**
```
POST /api/books
请求：FormData（file + metadata）
返回：
{
  "code": 200,
  "data": {
    "id": 1,
    "title": "书名",
    "author": "作者",
    ...
  }
}
```

**获取图书详情**
```
GET /api/books/{id}
返回：
{
  "code": 200,
  "data": {
    "id": 1,
    "title": "书名",
    "author": "作者",
    ...
  }
}
```

**更新图书信息**
```
PUT /api/books/{id}
请求：
{
  "title": "新书名",
  "author": "新作者",
  "country": "中国",
  "category": "文学"
}
返回：
{
  "code": 200,
  "message": "更新成功"
}
```

**删除图书**
```
DELETE /api/books/{id}
返回：
{
  "code": 200,
  "message": "删除成功"
}
```

### 5.3 阅读记录接口
**获取阅读记录**
```
GET /api/reading/{bookId}
返回：
{
  "code": 200,
  "data": {
    "progress": "epubcfi(/6/4...)",
    "readTime": 3600,
    "lastReadTime": "2026-07-09T19:00:00"
  }
}
```

**保存阅读进度**
```
POST /api/reading
请求：
{
  "bookId": 1,
  "progress": "epubcfi(/6/4...)",
  "readTime": 1800
}
返回：
{
  "code": 200,
  "message": "保存成功"
}
```

### 5.4 书签接口
**获取书签列表**
```
GET /api/bookmarks?bookId=1
返回：
{
  "code": 200,
  "data": [
    {
      "id": 1,
      "position": "epubcfi(/6/4...)",
      "note": "重要章节",
      "createTime": "2026-07-09T19:00:00"
    }
  ]
}
```

**添加书签**
```
POST /api/bookmarks
请求：
{
  "bookId": 1,
  "position": "epubcfi(/6/4...)",
  "note": "重要章节"
}
返回：
{
  "code": 200,
  "data": { "id": 1 }
}
```

**删除书签**
```
DELETE /api/bookmarks/{id}
返回：
{
  "code": 200,
  "message": "删除成功"
}
```

### 5.5 书评接口
**获取书评列表**
```
GET /api/reviews?bookId=1&visibility=1
返回：
{
  "code": 200,
  "data": [
    {
      "id": 1,
      "userId": 1,
      "username": "用户A",
      "title": "精彩绝伦",
      "content": "...",
      "score": 5,
      "longitude": 116.4,
      "latitude": 39.9,
      "locationName": "北京",
      "createTime": "2026-07-09T19:00:00"
    }
  ]
}
```

**发布书评**
```
POST /api/reviews
请求：
{
  "bookId": 1,
  "title": "精彩绝伦",
  "content": "这本书非常...",
  "score": 5,
  "longitude": 116.4,
  "latitude": 39.9,
  "locationName": "北京",
  "visibility": 1
}
返回：
{
  "code": 200,
  "data": { "id": 1 }
}
```

**更新书评**
```
PUT /api/reviews/{id}
请求：
{
  "title": "新标题",
  "content": "新内容"
}
返回：
{
  "code": 200,
  "message": "更新成功"
}
```

**删除书评**
```
DELETE /api/reviews/{id}
返回：
{
  "code": 200,
  "message": "删除成功"
}
```

### 5.6 地图数据接口
**获取我的图书地图数据（按作者国籍）**
```
GET /api/map/my-books
返回：
{
  "code": 200,
  "data": [
    {
      "country": "中国",
      "count": 15,
      "books": [...]
    },
    {
      "country": "美国",
      "count": 8,
      "books": [...]
    }
  ]
}
```

**获取同书读者地图数据**
```
GET /api/map/same-book/{bookId}
返回：
{
  "code": 200,
  "data": [
    {
      "locationName": "北京",
      "longitude": 116.4,
      "latitude": 39.9,
      "reviews": [
        {
          "username": "用户A",
          "score": 5,
          "content": "...",
          "createTime": "2026-07-09T19:00:00"
        }
      ]
    }
  ]
}
```

**获取全部公开书评地图数据**
```
GET /api/map/public-reviews
参数：bookId=&author=&score=
返回：
{
  "code": 200,
  "data": [
    {
      "locationName": "北京",
      "longitude": 116.4,
      "latitude": 39.9,
      "count": 25,
      "reviews": [...]
    }
  ]
}
```

---

## 6. 页面结构

### 6.1 页面导航图
```
登录页 /login
  ↓
首页 /home
  ├── 书架视图 /home/shelf
  │     └── 图书详情 /book/:id
  │           ├── 阅读器 /book/:id/read
  │           │     ├── 书签管理
  │           │     └── 写书评
  │           ├── 书评列表
  │           └── 同书读者地图 /book/:id/map
  │
  ├── 地图视图 /home/map
  │     ├── 我的图书模式
  │     └── 他人图书模式
  │           ├── 同书读者
  │           └── 全部公开书评
  │
  ├── 公开图书广场 /public
  │
  └── 个人中心 /profile
        ├── 阅读统计
        ├── 设置
        └── 我的书评
```

### 6.2 页面说明
- **登录页**：用户登录/注册入口
- **首页**：主界面，包含书架和地图两大视图
- **图书详情页**：展示图书信息、书评、书签
- **阅读器页**：全屏阅读界面
- **地图页**：世界地图可视化，支持模式切换
- **公开图书广场**：展示所有用户的公开图书
- **个人中心**：用户信息、阅读统计、设置

---

## 7. 技术栈

> 注：需求文档初稿规划采用 Vue 3 技术栈。实际开发阶段基于 Google AI Studio 快速原型环境起步，平台默认生成 React 模板，后续所有功能均在此基础上迭代扩展。技术栈选型不影响核心功能实现。

### 7.1 前端
| 类别 | 技术 | 说明 |
|------|------|------|
| 框架 | **React 19** | 组件化 UI 开发 |
| 构建工具 | **Vite 6** | 极速热更新和构建 |
| 语言 | **TypeScript 5.8** | 严格模式，类型安全 |
| 样式 | **Tailwind CSS v4** | 原子化 CSS + 自定义主题变量 |
| 动画 | **Framer Motion** | 组件过渡动画 |
| 图标 | **Lucide React** | 轻量 SVG 图标库 |
| 地图 | **D3.js v7** | 交互式 SVG 世界地图 |
| EPUB 阅读 | **epub.js** | 浏览器端 EPUB 解析渲染 |
| PDF 阅读 | **pdf.js** | Mozilla PDF 渲染引擎 |

### 7.2 后端
| 类别 | 技术 | 说明 |
|------|------|------|
| 运行时 | **Node.js 20** | JavaScript 服务端环境 |
| 框架 | **Express 4** | HTTP 服务和 RESTful API |
| 语言 | **TypeScript 5.8** | 与前端统一技术栈 |
| 数据库 | **MySQL 8.0** | 关系型数据存储 |
| 认证 | **JWT + bcryptjs** | JSON Web Token + 密码哈希 |
| 文件存储 | **阿里云 OSS** | 对象存储，服务端代理上传 |
| AI 服务 | **Google Gemini 3.5 Flash** | 元数据提取、书评生成 |

### 7.3 部署运维
| 类别 | 技术 | 说明 |
|------|------|------|
| 云服务器 | **阿里云 ECS** | Alibaba Cloud Linux |
| 进程管理 | **PM2** | 进程守护和自动重启 |
| 反向代理 | **Nginx** | 静态文件服务和 API 转发 |
| 面板管理 | **宝塔面板** | 可视化管理数据库和网站 |

---

## 8. 项目结构

```
book/
├── README.md / README.en.md
├── .gitignore
├── 需求文档/                # 需求规格说明书（本文件）
├── 技术文档/                # 5 份技术文档
│   ├── 01-系统架构概述.md
│   ├── 02-组件文档.md
│   ├── 03-API接口文档.md
│   ├── 04-数据库设计文档.md
│   └── 05-开发与部署指南.md
├── 数据库表/                # SQL 建表 + ER 图
│   ├── schema.sql
│   ├── ER-diagram.md
│   └── seed-books.sql
└── 项目源码/
    ├── server.ts           # Express 入口
    ├── package.json
    ├── vite.config.ts
    ├── tsconfig.json
    ├── .env.example
    ├── routes/             # 7 个 API 路由模块
    ├── middleware/         # JWT 认证中间件
    ├── services/          # OSS 服务
    ├── utils/             # 密码/Token/校验工具
    ├── scripts/           # 数据库种子
    ├── deploy/            # PM2/Nginx/Webhook 配置
    └── src/
        ├── main.tsx       # React 入口
        ├── App.tsx        # 根组件（状态中心）
        ├── types.ts       # TypeScript 类型
        ├── index.css      # Tailwind + 主题
        ├── services/api.ts # 前端 API 客户端
        ├── db/            # 数据库连接 + 5 个 Repository
        └── components/    # 10 个核心组件
            ├── WorldMap.tsx
            ├── BookShelf3D.tsx
            ├── BookReader.tsx
            ├── BookDetailModal.tsx
            ├── ImportBookForm.tsx
            ├── ReviewForm.tsx
            ├── CommunitySquare.tsx
            └── UserProfileDashboard.tsx
```
│   │   ├── reading.ts
│   │   └── reviews.ts
│   ├── router/            # 路由配置
│   │   └── index.ts
│   ├── services/          # API 服务
│   │   ├── auth.ts
│   │   ├── books.ts
│   │   ├── reading.ts
│   │   ├── reviews.ts
│   │   └── map.ts
│   ├── db/               # 数据库访问层
│   │   ├── database.ts
│   │   └── repositories/
│   ├── services/          # API 客户端
│   │   └── api.ts
│   └── main.tsx           # React 入口
├── package.json
├── tsconfig.json
├── vite.config.ts
└── .env.example
```

**实际完成情况：**
- 组件数量：10 个独立组件 + 认证面板
- 代码规模：6000+ 行有效 TypeScript/TSX 代码
- 文件组织：清晰的三层架构（路由/服务/组件）

---

## 9. 核心模块说明

### 9.1 模块加载顺序
```
main.tsx（入口）
  ↓
App.tsx（根组件，状态管理中心）
  ↓
useState（React 状态管理）
  ↓
services/api.ts（API 调用）
  ↓
Express 后端接口
  ↓
db/repositories（数据库访问）
  ↓
MySQL 数据库
```

### 9.2 核心模块职责
- **main.tsx**：React 入口，挂载根组件到 DOM
- **App.tsx**：根组件，Tab 导航、认证流程、数据状态、弹窗编排
- **components/**：8 个可复用 UI 组件，各司其职
- **services/api.ts**：前端 API 客户端，自动携带 JWT Token
- **routes/**：Express 路由模块，7 组 RESTful 接口
- **db/repositories/**：数据访问层，5 个 Entity Repository

---

## 10. 组件关系图

```
App.tsx
├── 认证面板（登录/注册/游客）
├── 导航栏（Shelf | Global Map | Library Square | Reading Desk）
│
├── BookShelf3D.tsx（3D 书架）
│   └── 拖拽移动 / 垃圾桶删除
│
├── WorldMap.tsx（D3 世界地图）
│   ├── 作者起源模式
│   └── 读者足迹模式
│
├── CommunitySquare.tsx（社区广场）
│   └── 公开图书 + 书评 feed
│
├── UserProfileDashboard.tsx（个人中心）
│   └── 阅读统计图表
│
├── BookDetailModal.tsx（图书详情弹窗）
├── BookReader.tsx（阅读器：TXT + EPUB + PDF）
├── ImportBookForm.tsx（图书导入：拖拽 + AI 提取）
└── ReviewForm.tsx（书评编辑：评分 + 地理标记 + AI 生成）
```

---

## 11. 技术难点

### 11.1 EPUB 加载与渲染
**技术选型**：epub.js
**解决方案**：OSS 私有 Bucket 无法通过 URL 直传（302 重定向导致 epub.js 内部请求相对路径资源失败），改用 `fetch → ArrayBuffer → ePub(buffer)` 方式加载，所有资源从内存读取，不再依赖 URL 重定向。

**实现要点**：
- 解析 EPUB 文件结构（OPF、NCX、XHTML）
- 提取目录结构
- 提取章节内容
- 提取封面图片
- 实现翻页、跳转、进度记录
- 支持 CFI（Canonical Fragment Identifier）定位

**关键代码**：
```typescript
import ePub from 'epubjs';

const book = ePub(arrayBuffer);
await book.ready;
const navigation = book.navigation.toc;
const metadata = book.package.metadata;
```

### 11.2 地图可视化
**技术选型**：D3.js

**实现要点**：
- 加载世界地图 GeoJSON
- 数据映射：国家/地区 → 数量统计
- 生成 series 配置
- 绑定点击事件
- 弹窗展示详情
- 支持模式切换（我的图书/他人图书）

**关键代码（D3.js）**：
```typescript
import * as d3 from 'd3';
const projection = d3.geoMercator().scale(150).translate([450, 225]);
const path = d3.geoPath().projection(projection);
svg.selectAll('path').data(geoJson.features)
  .attr('d', path).attr('fill', d => getCountryColor(d));
```

### 11.3 阅读时长统计
**实现要点**：
- 监听页面可见性变化（visibilitychange）
- 监听页面卸载（beforeunload）
- 记录开始时间和结束时间
- 计算有效阅读时长
- 定时保存进度（每 30 秒）

**关键代码**：
```typescript
let startTime = Date.now();

document.addEventListener('visibilitychange', () => {
  if (document.hidden) {
    saveReadingTime();
  } else {
    startTime = Date.now();
  }
});

window.addEventListener('beforeunload', saveReadingTime);
```

### 11.4 React State 状态同步
**实现要点**：
- BookStore：管理图书列表、当前图书
- UserStore：管理用户信息、登录状态
- ReadingStore：管理阅读进度、阅读时长
- ReviewStore：管理书评列表

**Store 间通信**：
```typescript
// ReadingStore 中更新阅读时长后，通知 BookStore 更新统计
const readingStore = useReadingStore();
const bookStore = useBookStore();

watch(() => readingStore.currentBookId, (newId) => {
  bookStore.updateBookStats(newId);
});
```

### 11.5 地理位置获取
**技术选型**：Geolocation API + 反向地理编码

**实现要点**：
- 获取用户经纬度
- 调用地图 API 反向地理编码（经纬度 → 地名）
- 手动输入地名时的模糊匹配
- 地理位置缓存

---

## 12. 性能优化

### 12.1 图片优化
- 封面图片懒加载（Intersection Observer）
- 图片压缩（WebP 格式）
- 使用 CDN 加速

### 12.2 组件优化
- 组件按需加载（动态 import）
- 路由懒加载
- keep-alive 缓存常用页面
- 虚拟滚动（图书列表超过 100 条时）

### 12.3 搜索优化
- 防抖处理（输入停止 300ms 后触发）
- 搜索结果缓存

### 12.4 数据缓存
- Token 缓存（localStorage）
- 阅读进度缓存（localStorage + 后端同步）
- 图书列表缓存（React State）

### 12.5 打包优化
- 代码分割（splitChunks）
- 第三方库 CDN 引入
- Gzip 压缩
- Tree Shaking

---

## 13. 异常处理

### 13.1 文件上传异常
- 格式错误：提示"仅支持 EPUB/TXT/PDF 格式"
- 文件过大：提示"文件大小不能超过 100MB"
- 上传失败：提供"重新上传"按钮
- 网络错误：提示"网络异常，请稍后重试"

### 13.2 认证异常
- Token 过期：自动退出登录，跳转登录页
- Token 无效：清除本地 Token，提示重新登录
- 401 错误：统一拦截，跳转登录页

### 13.3 服务器异常
- 500 错误：统一提示"服务器异常，请稍后重试"
- 网络断开：提示"网络连接失败"
- 超时：提示"请求超时，请稍后重试"

### 13.4 数据异常
- 图书不存在：提示"图书不存在或已被删除"
- 书评不存在：提示"书评不存在或已被删除"
- 权限不足：提示"您没有权限执行此操作"

### 13.5 全局异常处理
```typescript
// API 客户端统一错误处理
const res = await fetch(`${BASE_URL}${path}`, { ...options, headers });
if (res.status === 401) {
  localStorage.removeItem('bv_token');
  window.dispatchEvent(new CustomEvent('auth:expired'));
  throw new Error('Unauthorized');
}
if (!res.ok) {
  const err = await res.json().catch(() => ({ message: 'Request failed' }));
  throw new Error(err.message || `HTTP ${res.status}`);
}
```

---

## 14. 非功能需求

### 14.1 性能要求
- 页面首次加载 ≤ 3 秒
- 图书搜索响应 ≤ 500 ms
- 支持同时管理 1000 本图书
- 阅读进度自动保存间隔 30 秒
- 地图渲染 1000 个标注点时不卡顿

### 14.2 安全要求
- Token 身份认证（JWT）
- 路由权限控制（登录守卫）
- 输入内容校验（XSS 防护）
- 密码加密存储（bcrypt）
- 文件上传校验（类型、大小）

### 14.3 可维护性
- TypeScript 强类型
- ESLint + Prettier 代码规范
- 组件化开发
- 模块化目录结构
- 代码注释完整

### 14.4 兼容性
- 支持主流浏览器（Chrome、Firefox、Safari、Edge）
- 响应式设计（移动端适配）
- 支持 PWA（可选）

---

## 15. 工程化要求

### 15.1 开发工作流
- `npm run dev`：启动开发服务器
- `npm run build`：生产环境打包
- `npm run preview`：预览生产构建
- `npm run lint`：代码检查
- `npm run format`：代码格式化

### 15.2 构建配置
- Vite 优化配置：
  - 代码分割
  - 资源压缩
  - CDN 配置（可选）
- 环境变量配置：
  - `.env.development`
  - `.env.production`

### 15.3 代码质量
- TypeScript 严格模式
- ESLint 规则配置
- Prettier 格式化
- 组件 Props 类型定义
- 函数返回值类型标注

---

## 16. 扩展功能（可选）

- [ ] 社交功能：关注、点赞、评论
- [ ] 阅读排行榜：按阅读时长排名
- [ ] 图书推荐：基于阅读历史
- [ ] 导出功能：导出书评为 PDF
- [ ] 多语言支持：i18n
- [ ] PWA 支持：离线阅读
- [ ] 深色模式：全局主题切换

---

## 17. 验收标准

- [ ] 用户可以成功登录/登出
- [ ] 可以导入 EPUB/TXT 文件
- [ ] 可以设置书签、书评
- [ ] 书评支持地理位置标记、可见性设置（私有/公开）和书写时间记录
- [ ] 可以记录阅读时间
- [ ] 可以设置图书可见性
- [ ] 世界地图 UI 支持两大模式切换（我的图书 / 他人图书）
- [ ] 我的图书模式可显示作者书写位置分布
- [ ] 他人图书模式可查看同书读者的公开书评位置分布
- [ ] 他人图书模式可查看全部公开书评的位置分布
- [ ] 公开书评展示书写时间
- [ ] 书架 UI 正常显示
- [ ] 代码规模 ≥ 3000 行
- [ ] 组件数量 ≥ 20 个
- [ ] 可以通过终端打包构建
- [ ] TypeScript 类型完整
- [ ] 代码符合 ESLint 规范

---

## 18. 开发计划

**第一阶段：项目搭建（1-2 天）**
- 初始化 Vite + React + TypeScript 项目
- 配置 Tailwind CSS
- 集成 UI 组件库
- 配置 ESLint + Prettier
- 搭建基础目录结构

**第二阶段：核心功能（3-4 天）**
- 用户认证模块
- 图书导入与管理
- 阅读器集成
- 书签与书评功能

**第三阶段：高级功能（2-3 天）**
- 阅读时间统计
- 可见性控制
- 世界地图可视化
- 书架 3D 效果

**第四阶段：优化与测试（1-2 天）**
- 性能优化
- 响应式适配
- 代码重构
- 文档完善

**总计：约 7-11 天**

---

## 19. 参考资源

- React 官方文档：https://react.dev/
- Vite 官方文档：https://vitejs.dev/
- Tailwind CSS：https://tailwindcss.com/
- D3.js：https://d3js.org/
- Express：https://expressjs.com/
- MySQL：https://dev.mysql.com/doc/
- epub.js：https://github.com/futurepress/epub.js/
- Tailwind CSS：https://tailwindcss.com/
- React State：https://pinia.tsxjs.org/

---

**文档版本：** v2.0  
**创建日期：** 2026-07-09  
**最后更新：** 2026-07-09

---

> 本内容由 Coze AI 生成，请遵循相关法律法规及《人工智能生成合成内容标识办法》使用与传播。
