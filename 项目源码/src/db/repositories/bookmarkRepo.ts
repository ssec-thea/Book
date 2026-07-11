import { getPool } from '../database';
import { RowDataPacket, ResultSetHeader } from 'mysql2';

export interface BookmarkRow {
  id: number;
  book_id: number;
  user_id: number;
  position: number;
  chapter_title: string;
  note: string;
  text_snippet: string;
  created_at: string;
}

/**
 * 创建书签
 */
export async function createBookmark(data: {
  bookId: number;
  userId: number;
  position: number;
  chapterTitle?: string;
  note?: string;
  textSnippet?: string;
}): Promise<BookmarkRow> {
  const pool = getPool();
  const [result] = await pool.query<ResultSetHeader>(
    `INSERT INTO bookmarks (book_id, user_id, position, chapter_title, note, text_snippet)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [data.bookId, data.userId, data.position, data.chapterTitle || '', data.note || '', data.textSnippet || '']
  );

  const [rows] = await pool.query<RowDataPacket[]>(
    'SELECT * FROM bookmarks WHERE id = ?', [result.insertId]
  );
  return rows[0] as BookmarkRow;
}

/**
 * 按图书ID查询书签列表
 */
export async function findByBookId(bookId: number): Promise<BookmarkRow[]> {
  const pool = getPool();
  const [rows] = await pool.query<RowDataPacket[]>(
    'SELECT * FROM bookmarks WHERE book_id = ? ORDER BY position ASC',
    [bookId]
  );
  return rows as BookmarkRow[];
}

/**
 * 按用户和图书查询书签
 */
export async function findByUserAndBook(
  userId: number,
  bookId: number
): Promise<BookmarkRow[]> {
  const pool = getPool();
  const [rows] = await pool.query<RowDataPacket[]>(
    'SELECT * FROM bookmarks WHERE user_id = ? AND book_id = ? ORDER BY position ASC',
    [userId, bookId]
  );
  return rows as BookmarkRow[];
}

/**
 * 删除书签
 */
export async function deleteBookmark(id: number): Promise<boolean> {
  const pool = getPool();
  const [result] = await pool.query<ResultSetHeader>(
    'DELETE FROM bookmarks WHERE id = ?', [id]
  );
  return result.affectedRows > 0;
}
