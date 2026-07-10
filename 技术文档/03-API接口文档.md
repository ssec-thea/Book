# BookVoyage API 接口文档

## 基础信息

- **Base URL**: `http://localhost:3000/api`
- **认证方式**: JWT Bearer Token (登录/注册除外)
- **请求头**: `Authorization: Bearer <token>`
- **Content-Type**: `application/json` (文件上传使用 `multipart/form-data`)
- **响应格式**: `{ code: number, data?: any, message?: string }`

---

## 1. 用户认证接口

### 1.1 注册
```
POST /api/auth/register
Content-Type: application/json

请求体:
{
  "username": "string (必填, 2-50字符)",
  "email": "string (必填, 有效邮箱)",
  "password": "string (必填, 至少6字符)",
  "avatar": "string (可选, URL)",
  "bio": "string (可选, 个人简介)"
}

成功响应 (201):
{
  "code": 201,
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": 1,
    "username": "newuser",
    "email": "new@example.com",
    "avatar": "https://...",
    "bio": "...",
    "created_at": "2026-07-10T..."
  }
}

错误响应:
- 400: "Username already exists" / "Email already registered"
- 400: "Password must be at least 6 characters"
```

### 1.2 登录
```
POST /api/auth/login
Content-Type: application/json

请求体:
{
  "email": "string (必填)",
  "password": "string (必填)"
}

成功响应 (200):
{
  "code": 200,
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": 1,
    "username": "voyager",
    "email": "voyager@bookvoyage.com",
    "avatar": "https://...",
    "bio": "..."
  }
}

错误响应:
- 401: "Invalid email or password"
```

### 1.3 获取当前用户
```
GET /api/auth/me
Authorization: Bearer <token>

成功响应 (200):
{
  "code": 200,
  "user": {
    "id": 1,
    "username": "voyager",
    "email": "voyager@bookvoyage.com",
    "avatar": "https://...",
    "bio": "..."
  }
}

错误响应:
- 401: "No token provided" / "Invalid or expired token"
```

---

## 2. 图书管理接口

### 2.1 获取图书列表
```
GET /api/books?page=1&size=20&keyword=&category=
Authorization: Bearer <token>

查询参数:
- page: 页码 (默认1)
- size: 每页数量 (默认20)
- keyword: 搜索关键词 (匹配书名/作者)
- category: 分类筛选

成功响应 (200):
{
  "code": 200,
  "data": {
    "list": [Book, ...],
    "total": 14,
    "page": 1,
    "size": 20
  }
}
```

### 2.2 上传/导入图书
```
POST /api/books
Authorization: Bearer <token>
Content-Type: multipart/form-data

表单字段:
- file: File (可选, 图书文件)
- title: string (必填)
- author: string (必填)
- country: string (可选, 默认"Unknown")
- category: string (可选, 默认"Literature")
- visibility: number (可选, 0=私有 1=公开, 默认1)
- summary: string (可选)
- cover: string (可选, URL或base64)
- content: string (可选, 文本内容用于阅读)

成功响应 (201):
{
  "code": 201,
  "data": { Book对象 }
}
```

### 2.3 获取图书详情
```
GET /api/books/:id
Authorization: Bearer <token>

成功响应 (200):
{
  "code": 200,
  "data": { Book对象 (含chapters) }
}

错误响应:
- 404: "Book not found"
```

### 2.4 更新图书信息
```
PUT /api/books/:id
Authorization: Bearer <token>

请求体 (全部可选):
{
  "title": "string",
  "author": "string",
  "country": "string",
  "category": "string",
  "visibility": 0 | 1,
  "current_page": number,
  "progress": number,
  "read_time": number,
  "summary": "string",
  "cover": "string"
}

成功响应 (200):
{ "code": 200, "message": "Book updated" }
```

### 2.5 删除图书
```
DELETE /api/books/:id
Authorization: Bearer <token>

成功响应 (200):
{ "code": 200, "message": "Book deleted" }
```

---

## 3. 阅读记录接口

### 3.1 获取阅读记录
```
GET /api/reading/:bookId
Authorization: Bearer <token>

成功响应 (200):
{
  "code": 200,
  "data": {
    "id": 1,
    "progress": "...",
    "read_time": 3600,
    "last_read_time": "2026-07-10T..."
  }
}
```

### 3.2 保存阅读进度
```
POST /api/reading
Authorization: Bearer <token>

请求体:
{
  "book_id": number (必填),
  "current_page": number,
  "progress": number (0-100),
  "duration": number (本次阅读秒数)
}

成功响应 (200):
{ "code": 200, "message": "Reading progress saved" }
```

---

## 4. 书签接口

### 4.1 获取书签列表
```
GET /api/bookmarks?bookId=1
Authorization: Bearer <token>

成功响应 (200):
{
  "code": 200,
  "data": [
    { "id": 1, "position": 500, "chapter_title": "...", "note": "...", "text_snippet": "...", "created_at": "..." }
  ]
}
```

### 4.2 添加书签
```
POST /api/bookmarks
Authorization: Bearer <token>

请求体:
{
  "book_id": number (必填),
  "position": number (必填),
  "chapter_title": "string",
  "note": "string",
  "text_snippet": "string"
}

成功响应 (201):
{ "code": 201, "data": { "id": 1 } }
```

### 4.3 删除书签
```
DELETE /api/bookmarks/:id
Authorization: Bearer <token>

成功响应 (200):
{ "code": 200, "message": "Bookmark deleted" }
```

---

## 5. 书评接口

### 5.1 获取书评列表
```
GET /api/reviews?bookId=1&visibility=1&page=1&size=20
(visibility=1 获取公开书评不需要认证)

成功响应 (200):
{
  "code": 200,
  "data": {
    "list": [Review, ...],
    "total": 5
  }
}
```

### 5.2 发布书评
```
POST /api/reviews
Authorization: Bearer <token>

请求体:
{
  "book_id": number (必填),
  "title": "string (必填)",
  "content": "string (必填)",
  "score": number (必填, 1-5),
  "longitude": number (可选),
  "latitude": number (可选),
  "location_name": "string (可选)",
  "visibility": 0 | 1 (可选, 默认1)
}

成功响应 (201):
{ "code": 201, "data": { "id": 1 } }
```

### 5.3 更新书评
```
PUT /api/reviews/:id
Authorization: Bearer <token>

请求体 (全部可选):
{
  "title": "string",
  "content": "string",
  "score": number,
  "visibility": 0 | 1
}

成功响应 (200):
{ "code": 200, "message": "Review updated" }
```

### 5.4 删除书评
```
DELETE /api/reviews/:id
Authorization: Bearer <token>

成功响应 (200):
{ "code": 200, "message": "Review deleted" }
```

---

## 6. 地图数据接口

### 6.1 我的图书地图（作者国籍）
```
GET /api/map/my-books
Authorization: Bearer <token>

成功响应 (200):
{
  "code": 200,
  "data": [
    { "country": "China", "countryCode": "CN", "count": 3, "books": [...] },
    { "country": "Colombia", "countryCode": "CO", "count": 4, "books": [...] }
  ]
}
```

### 6.2 同书读者地图
```
GET /api/map/same-book/:bookId
Authorization: Bearer <token>

成功响应 (200):
{
  "code": 200,
  "data": [
    { "location_name": "Beijing", "longitude": 116.4, "latitude": 39.9, "reviews": [...] }
  ]
}
```

### 6.3 全部公开书评地图
```
GET /api/map/public-reviews?bookId=&author=&score=

成功响应 (200):
{
  "code": 200,
  "data": [
    { "location_name": "Paris", "longitude": 2.35, "latitude": 48.86, "count": 5, "reviews": [...] }
  ]
}
```

---

## 7. Gemini AI 接口

### 7.1 健康检查
```
GET /api/health

成功响应 (200):
{ "status": "ok", "hasApiKey": true }
```

### 7.2 AI 元数据提取
```
POST /api/gemini/extract

请求体:
{ "textSnippet": "string (图书文本前8000字符)" }

成功响应 (200):
{
  "title": "书名",
  "author": "作者",
  "country": "作者国籍",
  "category": "分类",
  "summary": "2句话摘要",
  "chapters": [{ "title": "...", "content": "..." }]
}
```

### 7.3 AI 书评生成
```
POST /api/gemini/review

请求体:
{
  "title": "书名",
  "author": "作者",
  "userThoughts": "用户感想",
  "score": 5
}

成功响应 (200):
{
  "title": "书评标题",
  "content": "优美书评正文(150-200词)",
  "locationName": "Paris, France",
  "latitude": 48.8566,
  "longitude": 2.3522
}
```

### 7.4 AI 情节位置提取
```
POST /api/gemini/content-locations

请求体:
{ "title": "书名", "author": "作者" }

成功响应 (200):
{
  "locations": [
    { "name": "Macondo, Colombia", "lat": 10.59, "lng": -74.19 }
  ]
}
```

---

## 8. 错误码说明

| HTTP 状态码 | 含义 |
|------------|------|
| 200 | 请求成功 |
| 201 | 创建成功 |
| 400 | 请求参数错误 |
| 401 | 未认证或 Token 过期 |
| 404 | 资源不存在 |
| 500 | 服务器内部错误 |

所有错误响应格式:
```json
{
  "code": 401,
  "message": "错误描述信息"
}
```
