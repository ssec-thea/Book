import { getPool } from '../database';
import { ResultSetHeader } from 'mysql2';

export interface ReadingRecord {
  id: number;
  user_id: number;
  book_id: number;
  start_time: string;
  end_time: string | null;
  duration: number;
  start_page: number;
  end_page: number;
  progress: string;
  created_at: string;
}

/**
 * 创建阅读会话
 */
export async function startSession(
  userId: number,
  bookId: number,
  startPage: number = 0
): Promise<ReadingRecord> {
  const pool = getPool();
  const [result] = await pool.execute<ResultSetHeader>(
    `INSERT INTO reading_records (user_id, book_id, start_time, start_page)
     VALUES (?, ?, NOW(), ?)`,
    [userId, bookId, startPage]
  );

  const [rows] = await pool.execute<any[]>(
    'SELECT * FROM reading_records WHERE id = ?', [result.insertId]
  );
  return rows[0];
}

/**
 * 结束阅读会话（保存进度）
 */
export async function endSession(
  id: number,
  duration: number,
  endPage: number,
  progress: string
): Promise<boolean> {
  const pool = getPool();
  const [result] = await pool.execute<ResultSetHeader>(
    `UPDATE reading_records SET end_time = NOW(), duration = ?, end_page = ?, progress = ?
     WHERE id = ?`,
    [duration, endPage, progress, id]
  );
  return result.affectedRows > 0;
}

/**
 * 保存阅读进度（upsert 模式）
 */
export async function saveProgress(
  userId: number,
  bookId: number,
  duration: number,
  currentPage: number,
  progress: string
): Promise<void> {
  const pool = getPool();
  // 先尝试更新最近一条未结束的记录
  const [recent] = await pool.execute<any[]>(
    `SELECT id FROM reading_records
     WHERE user_id = ? AND book_id = ? AND end_time IS NULL
     ORDER BY start_time DESC LIMIT 1`,
    [userId, bookId]
  );

  if (recent.length > 0) {
    await endSession(recent[0].id, duration, currentPage, progress);
  } else {
    // 创建新记录
    const [result] = await pool.execute<ResultSetHeader>(
      `INSERT INTO reading_records (user_id, book_id, start_time, end_time, duration, start_page, end_page, progress)
       VALUES (?, ?, NOW(), NOW(), ?, ?, ?, ?)`,
      [userId, bookId, duration, 0, currentPage, progress]
    );
  }
}

/**
 * 获取用户对某本书的阅读记录
 */
export async function getRecords(userId: number, bookId: number): Promise<ReadingRecord[]> {
  const pool = getPool();
  const [rows] = await pool.execute<any[]>(
    `SELECT * FROM reading_records
     WHERE user_id = ? AND book_id = ?
     ORDER BY start_time DESC LIMIT 20`,
    [userId, bookId]
  );
  return rows;
}

/**
 * 获取总阅读时长（秒）
 */
export async function getTotalReadTime(userId: number): Promise<number> {
  const pool = getPool();
  const [rows] = await pool.execute<any[]>(
    'SELECT COALESCE(SUM(duration), 0) as total FROM reading_records WHERE user_id = ?',
    [userId]
  );
  return rows[0].total;
}
