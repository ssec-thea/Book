import { getPool } from '../database';
import { RowDataPacket, ResultSetHeader } from 'mysql2';

export interface BookRow {
  id: number;
  user_id: number;
  title: string;
  author: string;
  country: string;
  cover: string;
  file_path: string;
  file_type: 'epub' | 'txt' | 'pdf';
  file_size: number;
  category: string;
  visibility: number;
  total_pages: number;
  current_page: number;
  progress: number;
  read_time: number;
  last_read_time: string | null;
  summary: string;
  content: string;
  chapters: any;
  created_at: string;
  updated_at: string;
}

export interface BookFilters {
  userId?: number;
  keyword?: string;
  category?: string;
  visibility?: number;
  page?: number;
  size?: number;
}

export interface PaginatedResult<T> {
  list: T[];
  total: number;
  page: number;
  size: number;
}

function formatBook(row: any): BookRow {
  return {
    ...row,
    id: String(row.id), // 统一为 string 兼容 localStorage
    user_id: String(row.user_id),
    chapters: typeof row.chapters === 'string' ? JSON.parse(row.chapters) : row.chapters,
  };
}

/**
 * 创建图书
 */
export async function createBook(data: {
  userId: number;
  title: string;
  author: string;
  country?: string;
  cover?: string;
  filePath?: string;
  fileUrl?: string;
  fileType?: string;
  fileSize?: number;
  category?: string;
  visibility?: number;
  summary?: string;
  content?: string;
  chapters?: any[];
}): Promise<BookRow> {
  const pool = getPool();
  const chaptersJson = data.chapters ? JSON.stringify(data.chapters) : null;

  const [result] = await pool.query<ResultSetHeader>(
    `INSERT INTO books (user_id, title, author, country, cover, file_path, file_url, file_type, file_size,
      category, visibility, summary, content, chapters, total_pages)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      data.userId,
      data.title,
      data.author,
      data.country || 'Unknown',
      data.cover || '',
      data.filePath || '',
      data.fileUrl || '',
      data.fileType || 'txt',
      data.fileSize || 0,
      data.category || 'Literature',
      data.visibility ?? 1,
      data.summary || '',
      data.content || '',
      chaptersJson,
      data.chapters ? data.chapters.length * 10 : 0,
    ]
  );

  const [rows] = await pool.query<RowDataPacket[]>(
    'SELECT * FROM books WHERE id = ?', [result.insertId]
  );
  return formatBook(rows[0]);
}

/**
 * 查询图书列表（支持筛选和分页）
 */
export async function findBooks(filters: BookFilters): Promise<PaginatedResult<BookRow>> {
  const pool = getPool();
  const conditions: string[] = [];
  const values: any[] = [];

  if (filters.userId !== undefined) {
    conditions.push('b.user_id = ?');
    values.push(filters.userId);
  }
  if (filters.keyword) {
    conditions.push('(b.title LIKE ? OR b.author LIKE ?)');
    const kw = `%${filters.keyword}%`;
    values.push(kw, kw);
  }
  if (filters.category) {
    conditions.push('b.category = ?');
    values.push(filters.category);
  }
  if (filters.visibility !== undefined) {
    conditions.push('b.visibility = ?');
    values.push(filters.visibility);
  }

  const where = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
  const page = filters.page || 1;
  const size = filters.size || 20;
  const offset = (page - 1) * size;

  const [countRows] = await pool.query<RowDataPacket[]>(
    `SELECT COUNT(*) as total FROM books b ${where}`, values
  );
  const total = (countRows[0] as any).total;

  const [rows] = await pool.query<RowDataPacket[]>(
    `SELECT b.*, u.username as owner_name FROM books b
     LEFT JOIN users u ON b.user_id = u.id
     ${where}
     ORDER BY b.created_at DESC
     LIMIT ? OFFSET ?`,
    [...values, size, offset]
  );

  return {
    list: rows.map(formatBook),
    total,
    page,
    size,
  };
}

/**
 * 按 ID 查找图书
 */
export async function findBookById(id: number): Promise<BookRow | null> {
  const pool = getPool();
  const [rows] = await pool.query<RowDataPacket[]>(
    'SELECT * FROM books WHERE id = ? LIMIT 1', [id]
  );
  return rows.length > 0 ? formatBook(rows[0]) : null;
}

/**
 * 获取公开图书（用于地图和社区广场）
 */
export async function findPublicBooks(filters: BookFilters): Promise<PaginatedResult<BookRow>> {
  return findBooks({ ...filters, visibility: 1 });
}

/**
 * 更新图书信息
 */
export async function updateBook(id: number, fields: Record<string, any>): Promise<boolean> {
  const pool = getPool();
  const updates: string[] = [];
  const values: any[] = [];

  const allowedFields = [
    'title', 'author', 'country', 'cover', 'category', 'visibility',
    'file_path', 'file_url',
    'current_page', 'progress', 'read_time', 'last_read_time',
    'summary', 'content', 'chapters', 'total_pages'
  ];

  for (const key of allowedFields) {
    if (fields[key] !== undefined) {
      if (key === 'chapters' && typeof fields[key] === 'object') {
        updates.push('chapters = ?');
        values.push(JSON.stringify(fields[key]));
      } else {
        updates.push(`${key} = ?`);
        values.push(fields[key]);
      }
    }
  }

  if (updates.length === 0) return false;
  values.push(id);

  const [result] = await pool.query<ResultSetHeader>(
    `UPDATE books SET ${updates.join(', ')} WHERE id = ?`, values
  );
  return result.affectedRows > 0;
}

/**
 * 更新阅读进度
 */
export async function updateReadingProgress(
  id: number,
  currentPage: number,
  progress: number,
  readTime: number,
  lastReadTime: string
): Promise<boolean> {
  return updateBook(id, {
    current_page: currentPage,
    progress,
    read_time: readTime,
    last_read_time: lastReadTime,
  });
}

/**
 * 删除图书
 */
export async function deleteBook(id: number): Promise<boolean> {
  const pool = getPool();
  const [result] = await pool.query<ResultSetHeader>(
    'DELETE FROM books WHERE id = ?', [id]
  );
  return result.affectedRows > 0;
}

/**
 * 按国家分组统计图书（用于地图数据）
 */
export async function getBooksByCountry(userId: number): Promise<any[]> {
  const pool = getPool();
  const [rows] = await pool.query<RowDataPacket[]>(
    `SELECT country, COUNT(*) as count,
     JSON_ARRAYAGG(JSON_OBJECT('id', id, 'title', title, 'author', author, 'cover', cover, 'category', category))
     as books_json
     FROM books WHERE user_id = ?
     GROUP BY country ORDER BY count DESC`,
    [userId]
  );
  return rows;
}
