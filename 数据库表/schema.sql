-- ======================================================
-- BookVoyage (书旅/Marginalia) 数据库表设计
-- 数据库: MySQL 8.0+
-- 说明: 基于需求文档第4节 + 实际类型定义，6张核心表
-- ======================================================

CREATE DATABASE IF NOT EXISTS bookvoyage
  DEFAULT CHARACTER SET utf8mb4
  DEFAULT COLLATE utf8mb4_unicode_ci;

USE bookvoyage;

-- ----------------------------
-- 1. 用户表 (user)
-- 存储注册用户信息，密码使用 bcrypt 哈希
-- ----------------------------
CREATE TABLE IF NOT EXISTS users (
    id          INT AUTO_INCREMENT PRIMARY KEY,
    username    VARCHAR(50)  NOT NULL UNIQUE,
    email       VARCHAR(100) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL COMMENT 'bcrypt 哈希密码',
    avatar      VARCHAR(500) DEFAULT '' COMMENT '头像URL或base64',
    bio         TEXT         DEFAULT '' COMMENT '个人简介',
    created_at  DATETIME     DEFAULT CURRENT_TIMESTAMP,
    updated_at  DATETIME     DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_users_email (email),
    INDEX idx_users_username (username)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  COMMENT='用户表';

-- ----------------------------
-- 2. 图书表 (book)
-- 存储用户上传/导入的图书元数据和阅读状态
-- ----------------------------
CREATE TABLE IF NOT EXISTS books (
    id            INT AUTO_INCREMENT PRIMARY KEY,
    user_id       INT          NOT NULL,
    title         VARCHAR(200) NOT NULL,
    author        VARCHAR(100) NOT NULL,
    country       VARCHAR(50)  NOT NULL DEFAULT 'Unknown' COMMENT '作者国籍',
    cover         VARCHAR(500) DEFAULT '' COMMENT '封面URL或base64',
    file_path     VARCHAR(500) DEFAULT '' COMMENT '图书文件存储路径',
    file_type     VARCHAR(10)  NOT NULL DEFAULT 'txt' COMMENT 'epub | txt | pdf',
    file_size     INT          DEFAULT 0 COMMENT '文件大小(字节)',
    category      VARCHAR(50)  DEFAULT 'Literature' COMMENT '分类/流派',
    visibility    TINYINT(1)   DEFAULT 1 COMMENT '0=私有 1=公开',
    total_pages   INT          DEFAULT 0 COMMENT '总页数',
    current_page  INT          DEFAULT 0 COMMENT '当前阅读页码',
    progress      INT          DEFAULT 0 COMMENT '阅读进度 0-100',
    read_time     INT          DEFAULT 0 COMMENT '累计阅读时长(秒)',
    last_read_time DATETIME    NULL COMMENT '最后阅读时间',
    summary       TEXT         DEFAULT '' COMMENT '图书摘要/简介',
    content       LONGTEXT     DEFAULT '' COMMENT '图书文本内容(用于在线阅读)',
    chapters      JSON         NULL COMMENT '章节列表JSON [{title, content}]',
    created_at    DATETIME     DEFAULT CURRENT_TIMESTAMP,
    updated_at    DATETIME     DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_books_user (user_id),
    INDEX idx_books_visibility (visibility),
    INDEX idx_books_category (category),
    INDEX idx_books_country (country),
    INDEX idx_books_title_author (title, author)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  COMMENT='图书表';

-- ----------------------------
-- 3. 阅读记录表 (reading_record)
-- 记录每次阅读会话的详细信息
-- ----------------------------
CREATE TABLE IF NOT EXISTS reading_records (
    id            INT AUTO_INCREMENT PRIMARY KEY,
    user_id       INT      NOT NULL,
    book_id       INT      NOT NULL,
    start_time    DATETIME NOT NULL COMMENT '开始阅读时间',
    end_time      DATETIME NULL COMMENT '结束阅读时间',
    duration      INT      DEFAULT 0 COMMENT '本次阅读时长(秒)',
    start_page    INT      DEFAULT 0 COMMENT '开始页码',
    end_page      INT      DEFAULT 0 COMMENT '结束页码',
    progress      VARCHAR(100) DEFAULT '' COMMENT '阅读位置标识',
    created_at    DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (book_id) REFERENCES books(id) ON DELETE CASCADE,
    INDEX idx_reading_user_book (user_id, book_id),
    INDEX idx_reading_book (book_id),
    INDEX idx_reading_time (start_time)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  COMMENT='阅读记录表';

-- ----------------------------
-- 4. 书签表 (bookmark)
-- 存储用户阅读时添加的书签
-- ----------------------------
CREATE TABLE IF NOT EXISTS bookmarks (
    id            INT AUTO_INCREMENT PRIMARY KEY,
    book_id       INT          NOT NULL,
    user_id       INT          NOT NULL,
    position      INT          NOT NULL COMMENT '书签位置(字符索引)',
    chapter_title VARCHAR(200) DEFAULT '' COMMENT '所在章节标题',
    note          TEXT         DEFAULT '' COMMENT '书签备注',
    text_snippet  TEXT         DEFAULT '' COMMENT '书签处文本片段',
    created_at    DATETIME     DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (book_id) REFERENCES books(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_bookmark_book (book_id),
    INDEX idx_bookmark_user (user_id),
    INDEX idx_bookmark_user_book (user_id, book_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  COMMENT='书签表';

-- ----------------------------
-- 5. 书评表 (review)
-- 存储用户书评，包含地理位置标记
-- ----------------------------
CREATE TABLE IF NOT EXISTS reviews (
    id            INT AUTO_INCREMENT PRIMARY KEY,
    user_id       INT          NOT NULL,
    book_id       INT          NOT NULL,
    title         VARCHAR(200) NOT NULL COMMENT '书评标题',
    content       TEXT         NOT NULL COMMENT '书评内容',
    score         TINYINT      NOT NULL DEFAULT 5 COMMENT '评分 1-5',
    longitude     DECIMAL(10,6) NULL COMMENT '经度',
    latitude      DECIMAL(10,6) NULL COMMENT '纬度',
    location_name VARCHAR(200) DEFAULT '' COMMENT '地理位置名称(如"北京,中国")',
    visibility    TINYINT(1)   DEFAULT 1 COMMENT '0=私有 1=公开',
    created_at    DATETIME     DEFAULT CURRENT_TIMESTAMP COMMENT '书写时间',
    updated_at    DATETIME     DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (book_id) REFERENCES books(id) ON DELETE CASCADE,
    INDEX idx_review_book (book_id),
    INDEX idx_review_user (user_id),
    INDEX idx_review_visibility (visibility),
    INDEX idx_review_score (score),
    INDEX idx_review_location (longitude, latitude)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  COMMENT='书评表';

-- ----------------------------
-- 6. 用户会话表 (user_session) - 可选
-- 用于服务端会话管理和 Token 黑名单
-- ----------------------------
CREATE TABLE IF NOT EXISTS user_sessions (
    id            INT AUTO_INCREMENT PRIMARY KEY,
    user_id       INT          NOT NULL,
    token_hash    VARCHAR(64)  NOT NULL COMMENT 'JWT Token SHA256 哈希',
    expires_at    DATETIME     NOT NULL COMMENT 'Token 过期时间',
    created_at    DATETIME     DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_session_token (token_hash),
    INDEX idx_session_expires (expires_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  COMMENT='用户会话表(可选,用于Token管理)';
