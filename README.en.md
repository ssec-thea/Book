# BookVoyage / 书旅（Marginalia）

> A reading application that connects books and people through maps. By displaying authors' creative footprints and readers' reading trajectories on a world map, every book gains a geographic location, and every reading session becomes a journey of exploring the world.

## Features

| Module | Description |
|------|------|
| User System | Register/Login (JWT + bcrypt), profile editing, guest mode |
| Book Management | Upload EPUB/PDF/TXT, AI metadata extraction, categorization, drag-and-drop sorting, privacy controls |
| Online Reading | EPUB paginated reading, PDF rendering, TXT chapter reader, bookmarks |
| World Map | D3.js interactive map, author nationality distribution, reader footprint mode, country drill-down |
| Community Square | Public book browsing, category filtering, review feed, public review map |
| 3D Bookshelf | CSS 3D effects, category-organized shelves, drag-to-move and delete |
| AI Assistant | Gemini AI metadata extraction, review generation, plot location identification |

## Tech Stack

| Layer | Technology |
|------|------|
| Frontend Framework | React 19 + TypeScript |
| Build Tool | Vite 6 |
| UI | Tailwind CSS v4 + Framer Motion + Lucide Icons |
| Maps | D3.js v7 + TopoJSON |
| EPUB Reading | epub.js |
| PDF Reading | pdf.js (pdfjs-dist) |
| Backend | Express 4 + TypeScript |
| Database | MySQL 8.0 (mysql2) |
| Auth | JWT (jsonwebtoken) + bcryptjs |
| File Storage | Alibaba Cloud OSS |
| AI | Google Gemini 3.5 Flash |
| Process Manager | PM2 |
| Reverse Proxy | Nginx |

## Project Structure

```
book/
├── README.md / README.en.md
├── 需求文档/           # Requirements specification
├── 技术文档/           # Technical docs (architecture, components, API, database, deployment)
├── 数据库表/           # Database schema & ER diagram
└── 项目源码/           # Source code
    ├── server.ts       # Express entry point
    ├── routes/         # API routes (7 modules, 25+ endpoints)
    ├── middleware/      # JWT auth middleware
    ├── services/       # OSS upload/download service
    ├── utils/          # Password, token, validators
    ├── scripts/        # Seed script
    ├── deploy/         # Deployment configs (PM2, Nginx, Webhook)
    └── src/
        ├── App.tsx     # Root component
        ├── types.ts    # TypeScript types
        ├── db/         # Database layer (connection pool + 5 repositories)
        ├── services/   # Frontend API client
        └── components/ # 8 React components
```

## Quick Start

### Prerequisites

- Node.js ≥ 18
- MySQL ≥ 8.0

```bash
git clone https://gitee.com/ssecjyq/book.git
cd book/项目源码
npm install
cp .env.example .env   # Edit with your MySQL credentials
npm run seed
npm run dev
```

Open `http://localhost:3000`

### Default Account

| Email | Password |
|------|------|
| voyager@bookvoyage.com | guestpass123 |

## API Overview

| Method | Endpoint | Description |
|------|------|------|
| POST | `/api/auth/register` | Register |
| POST | `/api/auth/login` | Login |
| GET | `/api/auth/me` | Current user |
| GET/POST/PUT/DELETE | `/api/books[/:id]` | Books CRUD |
| POST | `/api/reading` | Save reading progress |
| GET/POST/DELETE | `/api/bookmarks[/:id]` | Bookmarks CRUD |
| GET/POST/DELETE | `/api/reviews[/:id]` | Reviews CRUD |
| GET | `/api/map/my-books` | Author origin map data |
| GET | `/api/map/public-reviews` | Public review map data |
| POST | `/api/oss/upload` | File upload |
| GET | `/api/oss/proxy?url=` | File download proxy |
| POST | `/api/gemini/extract` | AI metadata extraction |
| POST | `/api/gemini/review` | AI review generation |

## Database Tables

| Table | Description |
|----|------|
| users | User accounts with bcrypt password hash |
| books | Book metadata with OSS file URLs |
| reading_records | Reading session tracking |
| bookmarks | Reading position markers |
| reviews | Book reviews with geographic coordinates |

## Deployment

Deployed on Alibaba Cloud ECS: `http://47.109.151.211:3000`

See [deployment guide](技术文档/05-开发与部署指南.md) for details.

## License

MIT
