import { getPool } from '../database';
import { RowDataPacket, ResultSetHeader } from 'mysql2';

export interface ReviewRow {
  id: number;
  user_id: number;
  book_id: number;
  title: string;
  content: string;
  score: number;
  longitude: number | null;
  latitude: number | null;
  location_name: string;
  visibility: number;
  created_at: string;
  updated_at: string;
  username?: string;
  user_avatar?: string;
}

export interface ReviewFilters {
  bookId?: number;
  userId?: number;
  visibility?: number;
  page?: number;
  size?: number;
}

/**
 * 创建书评
 */
export async function createReview(data: {
  userId: number;
  bookId: number;
  title: string;
  content: string;
  score: number;
  longitude?: number;
  latitude?: number;
  locationName?: string;
  visibility?: number;
}): Promise<ReviewRow> {
  const pool = getPool();
  const [result] = await pool.query<ResultSetHeader>(
    `INSERT INTO reviews (user_id, book_id, title, content, score, longitude, latitude, location_name, visibility)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      data.userId, data.bookId, data.title, data.content, data.score,
      data.longitude || null, data.latitude || null,
      data.locationName || '', data.visibility ?? 1,
    ]
  );

  const [rows] = await pool.query<RowDataPacket[]>(
    'SELECT * FROM reviews WHERE id = ?', [result.insertId]
  );
  return rows[0] as ReviewRow;
}

/**
 * 查询书评列表
 */
export async function findReviews(filters: ReviewFilters): Promise<{
  list: ReviewRow[];
  total: number;
  page: number;
  size: number;
}> {
  const pool = getPool();
  const conditions: string[] = [];
  const values: any[] = [];

  if (filters.bookId !== undefined) {
    conditions.push('r.book_id = ?');
    values.push(filters.bookId);
  }
  if (filters.userId !== undefined) {
    conditions.push('r.user_id = ?');
    values.push(filters.userId);
  }
  if (filters.visibility !== undefined) {
    conditions.push('r.visibility = ?');
    values.push(filters.visibility);
  }

  const where = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
  const page = filters.page || 1;
  const size = filters.size || 20;
  const offset = (page - 1) * size;

  const [countRows] = await pool.query<RowDataPacket[]>(
    `SELECT COUNT(*) as total FROM reviews r ${where}`, values
  );
  const total = (countRows[0] as any).total;

  const [rows] = await pool.query<RowDataPacket[]>(
    `SELECT r.*, u.username, u.avatar as user_avatar
     FROM reviews r
     LEFT JOIN users u ON r.user_id = u.id
     ${where}
     ORDER BY r.created_at DESC
     LIMIT ? OFFSET ?`,
    [...values, size, offset]
  );

  const formatted = (rows as any[]).map((r: any) => ({
    ...r, id: String(r?.id || ''), user_id: String(r?.user_id || ''), book_id: String(r?.book_id || ''),
  }));
  return { list: formatted as ReviewRow[], total, page, size };
}

/**
 * 获取公开书评（用于地图聚合）
 */
export async function findPublicReviews(): Promise<ReviewRow[]> {
  const pool = getPool();
  const [rows] = await pool.query<RowDataPacket[]>(
    `SELECT r.*, u.username, u.avatar as user_avatar
     FROM reviews r
     LEFT JOIN users u ON r.user_id = u.id
     WHERE r.visibility = 1
     ORDER BY r.created_at DESC`
  );
  return rows as ReviewRow[];
}

/**
 * 更新书评
 */
export async function updateReview(
  id: number,
  fields: { title?: string; content?: string; score?: number; visibility?: number }
): Promise<boolean> {
  const pool = getPool();
  const updates: string[] = [];
  const values: any[] = [];

  if (fields.title !== undefined) { updates.push('title = ?'); values.push(fields.title); }
  if (fields.content !== undefined) { updates.push('content = ?'); values.push(fields.content); }
  if (fields.score !== undefined) { updates.push('score = ?'); values.push(fields.score); }
  if (fields.visibility !== undefined) { updates.push('visibility = ?'); values.push(fields.visibility); }

  if (updates.length === 0) return false;
  values.push(id);

  const [result] = await pool.query<ResultSetHeader>(
    `UPDATE reviews SET ${updates.join(', ')} WHERE id = ?`, values
  );
  return result.affectedRows > 0;
}

/**
 * 删除书评
 */
export async function deleteReview(id: number): Promise<boolean> {
  const pool = getPool();
  const [result] = await pool.query<ResultSetHeader>(
    'DELETE FROM reviews WHERE id = ?', [id]
  );
  return result.affectedRows > 0;
}
