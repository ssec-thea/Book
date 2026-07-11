import mysql from 'mysql2/promise';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

dotenv.config();

// ESM 兼容: 获取当前文件目录
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// MySQL 连接池配置
const poolConfig: mysql.PoolOptions = {
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '3306'),
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '071231',
  database: process.env.DB_NAME || 'bookvoyage',
  charset: 'utf8mb4',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  enableKeepAlive: true,
  keepAliveInitialDelay: 0,
};

let pool: mysql.Pool | null = null;

/**
 * 获取 MySQL 连接池实例
 */
export function getPool(): mysql.Pool {
  if (!pool) {
    pool = mysql.createPool(poolConfig);
  }
  return pool;
}

/**
 * 初始化数据库：创建数据库（如不存在）和所有表
 * 应在服务启动时调用一次
 */
export async function initializeDatabase(): Promise<void> {
  // 先创建数据库（如果不存在）
  const initPool = mysql.createPool({
    host: poolConfig.host,
    port: poolConfig.port,
    user: poolConfig.user,
    password: poolConfig.password,
    charset: 'utf8mb4',
  });

  try {
    await initPool.execute(
      `CREATE DATABASE IF NOT EXISTS \`${poolConfig.database}\`
       DEFAULT CHARACTER SET utf8mb4 DEFAULT COLLATE utf8mb4_unicode_ci`
    );
    console.log(`[DB] Database "${poolConfig.database}" ensured.`);

    // 切换到目标数据库，创建表
    const dbPool = getPool();
    const schema = getInlineSchema();

    // 按分号分割执行每条 SQL 语句
    const statements = schema
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0 && !s.startsWith('--') && !s.startsWith('/*'));

    for (const stmt of statements) {
      // 跳过 USE 语句（已通过 pool 指定数据库）
      if (stmt.toUpperCase().startsWith('USE ')) continue;
      // 跳过 CREATE DATABASE（已手动创建）
      if (stmt.toUpperCase().startsWith('CREATE DATABASE')) continue;

      try {
        await dbPool.execute(stmt);
      } catch (err: any) {
        // 忽略表已存在错误
        if (!err.message?.includes('already exists')) {
          console.warn(`[DB] SQL warning: ${err.message?.substring(0, 100)}`);
        }
      }
    }

    console.log('[DB] Schema initialized successfully.');
  } finally {
    await initPool.end();
  }
}

/**
 * 内联建表 SQL（兜底，当文件不可用时使用）
 */
function getInlineSchema(): string {
  return `
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    email VARCHAR(100) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    avatar VARCHAR(500) DEFAULT '',
    bio TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_users_email (email),
    INDEX idx_users_username (username)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS books (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    title VARCHAR(200) NOT NULL,
    author VARCHAR(100) NOT NULL,
    country VARCHAR(50) NOT NULL DEFAULT 'Unknown',
    cover TEXT DEFAULT '',
    file_path VARCHAR(500) DEFAULT '',
    file_url VARCHAR(500) DEFAULT '' COMMENT 'OSS 文件访问 URL',
    file_type VARCHAR(10) NOT NULL DEFAULT 'txt',
    file_size INT DEFAULT 0,
    category VARCHAR(50) DEFAULT 'Literature',
    visibility TINYINT(1) DEFAULT 1,
    total_pages INT DEFAULT 0,
    current_page INT DEFAULT 0,
    progress INT DEFAULT 0,
    read_time INT DEFAULT 0,
    last_read_time DATETIME NULL,
    summary TEXT,
    content LONGTEXT,
    chapters JSON NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_books_user (user_id),
    INDEX idx_books_visibility (visibility),
    INDEX idx_books_category (category),
    INDEX idx_books_country (country),
    INDEX idx_books_title_author (title, author)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS reading_records (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    book_id INT NOT NULL,
    start_time DATETIME NOT NULL,
    end_time DATETIME NULL,
    duration INT DEFAULT 0,
    start_page INT DEFAULT 0,
    end_page INT DEFAULT 0,
    progress VARCHAR(100) DEFAULT '',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (book_id) REFERENCES books(id) ON DELETE CASCADE,
    INDEX idx_reading_user_book (user_id, book_id),
    INDEX idx_reading_book (book_id),
    INDEX idx_reading_time (start_time)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS bookmarks (
    id INT AUTO_INCREMENT PRIMARY KEY,
    book_id INT NOT NULL,
    user_id INT NOT NULL,
    position INT NOT NULL,
    chapter_title VARCHAR(200) DEFAULT '',
    note TEXT,
    text_snippet TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (book_id) REFERENCES books(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_bookmark_book (book_id),
    INDEX idx_bookmark_user (user_id),
    INDEX idx_bookmark_user_book (user_id, book_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS reviews (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    book_id INT NOT NULL,
    title VARCHAR(200) NOT NULL,
    content TEXT NOT NULL,
    score TINYINT NOT NULL DEFAULT 5,
    longitude DECIMAL(10,6) NULL,
    latitude DECIMAL(10,6) NULL,
    location_name VARCHAR(200) DEFAULT '',
    visibility TINYINT(1) DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (book_id) REFERENCES books(id) ON DELETE CASCADE,
    INDEX idx_review_book (book_id),
    INDEX idx_review_user (user_id),
    INDEX idx_review_visibility (visibility),
    INDEX idx_review_score (score),
    INDEX idx_review_location (longitude, latitude)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;`;
}

/**
 * 测试数据库连接
 */
export async function testConnection(): Promise<boolean> {
  try {
    const dbPool = getPool();
    const [rows] = await dbPool.execute('SELECT 1 as test');
    console.log('[DB] MySQL connection test passed.');
    return true;
  } catch (err: any) {
    console.error('[DB] MySQL connection failed:', err.message);
    return false;
  }
}
