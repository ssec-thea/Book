# BookVoyage 数据库 ER 图与表关系说明

## 实体关系图 (Entity-Relationship Diagram)

```
┌──────────────────────────────────────────────────────────────────────────┐
│                           BookVoyage 数据库模型                            │
└──────────────────────────────────────────────────────────────────────────┘

     ┌──────────────┐
     │    users     │ 用户表
     ├──────────────┤
     │ PK id        │◄──────────────────────────────────────────┐
     │    username  │                                           │
     │    email     │                                           │
     │    password  │                                           │
     │    avatar    │                                           │
     │    bio       │                                           │
     │    created_at│                                           │
     │    updated_at│                                           │
     └──────┬───────┘                                           │
            │                                                   │
            │ 1:N (一个用户拥有多本书)                             │
            ▼                                                   │
     ┌──────────────┐      ┌──────────────────┐                 │
     │    books     │ 图书 │  reading_records │ 阅读记录         │
     ├──────────────┤      ├──────────────────┤                 │
     │ PK id        │◄─────│ PK id            │                 │
     │ FK user_id ──┼──┐   │ FK user_id ──────┼─────────────────┤
     │    title     │  │   │ FK book_id ──────┼──┐              │
     │    author    │  │   │    start_time    │  │              │
     │    country   │  │   │    end_time      │  │              │
     │    cover     │  │   │    duration      │  │              │
     │    file_path │  │   │    start_page    │  │              │
     │    file_type │  │   │    end_page      │  │              │
     │    category  │  │   │    created_at    │  │              │
     │    visibility│  │   └──────────────────┘  │              │
     │    progress  │  │                          │              │
     │    chapters  │  │   ┌──────────────┐       │              │
     │    content   │  │   │  bookmarks   │ 书签  │              │
     │    created_at│  │   ├──────────────┤       │              │
     └──────────────┘  │   │ PK id        │       │              │
            │          │   │ FK book_id ──┼───────┘              │
            │          │   │ FK user_id ──┼──────────────────────┤
            │ 1:N      │   │    position  │                      │
            ▼          │   │ chapter_title│                     │
     ┌──────────────┐  │   │    note      │                      │
     │   reviews    │  │   │ text_snippet │                      │
     ├──────────────┤  │   │    created_at│                      │
     │ PK id        │  │   └──────────────┘                      │
     │ FK user_id ──┼──┘                                         │
     │ FK book_id ──┼──┘                                         │
     │    title     │                                             │
     │    content   │                                             │
     │    score     │                                             │
     │    longitude │                                             │
     │    latitude  │                                             │
     │ location_name│                                            │
     │    visibility│                                             │
     │    created_at│                                             │
     └──────────────┘                                             │
                                                                  │
     ┌──────────────────┐                                         │
     │  user_sessions   │ 会话(可选)                               │
     ├──────────────────┤                                         │
     │ PK id            │                                         │
     │ FK user_id ──────┼─────────────────────────────────────────┘
     │    token_hash    │
     │    expires_at    │
     └──────────────────┘
```

## 表关系说明

| 关系 | 类型 | 说明 |
|------|------|------|
| users → books | **1:N** | 一个用户拥有多本图书。删除用户时级联删除其所有图书 |
| users → reviews | **1:N** | 一个用户可以写多篇书评。删除用户时级联删除其所有书评 |
| users → bookmarks | **1:N** | 一个用户可以创建多个书签。删除用户时级联删除其所有书签 |
| users → reading_records | **1:N** | 一个用户有多条阅读记录。删除用户时级联删除其所有记录 |
| books → reviews | **1:N** | 一本图书可以有多篇书评。删除图书时级联删除关联书评 |
| books → bookmarks | **1:N** | 一本图书可以有多个书签。删除图书时级联删除关联书签 |
| books → reading_records | **1:N** | 一本图书有多条阅读记录。删除图书时级联删除关联记录 |
| users → user_sessions | **1:N** | 一个用户可以有多个活跃会话（可选表） |

## 外键约束

所有外键均设置 `ON DELETE CASCADE`，确保删除用户或图书时自动清理关联数据。

## 索引策略

| 表 | 索引 | 用途 |
|----|------|------|
| users | email, username | 登录查询、唯一性检查 |
| books | user_id, visibility, category, country, (title, author) | 用户书架、公开浏览、分类筛选、地图聚合 |
| reading_records | (user_id, book_id), book_id, start_time | 阅读进度查询、时间统计 |
| bookmarks | book_id, user_id, (user_id, book_id) | 按图书查询书签、按用户查询 |
| reviews | book_id, user_id, visibility, score, (longitude, latitude) | 书评列表、地图查询、评分筛选 |
| user_sessions | token_hash, expires_at | Token 验证、过期清理 |

## 字段类型选择说明

- **JSON 类型** (books.chapters): MySQL 5.7+ 原生 JSON，支持 JSON_EXTRACT 查询，灵活存储不定长章节列表
- **LONGTEXT** (books.content): 支持存储完整图书文本（最大 4GB）
- **DECIMAL(10,6)** (经纬度): 精度足够表示到厘米级别（±0.000001度 ≈ 0.11m）
- **TINYINT(1)** (布尔字段): MySQL 中与 BOOLEAN 同义，节省空间
