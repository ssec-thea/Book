import { getPool } from '../database';
import { RowDataPacket, ResultSetHeader } from 'mysql2';

export interface UserRow {
  id: number;
  username: string;
  email: string;
  password_hash: string;
  avatar: string;
  bio: string;
  created_at: string;
  updated_at: string;
}

export interface PublicUser {
  id: number;
  username: string;
  email: string;
  avatar: string;
  bio: string;
  created_at: string;
}

function toPublicUser(row: UserRow): PublicUser {
  return {
    id: row.id,
    username: row.username,
    email: row.email,
    avatar: row.avatar,
    bio: row.bio,
    created_at: row.created_at,
  };
}

/**
 * 创建新用户
 */
export async function createUser(
  username: string,
  email: string,
  passwordHash: string,
  avatar?: string,
  bio?: string
): Promise<PublicUser> {
  const pool = getPool();
  const [result] = await pool.query<ResultSetHeader>(
    `INSERT INTO users (username, email, password_hash, avatar, bio)
     VALUES (?, ?, ?, ?, ?)`,
    [username, email, passwordHash, avatar || '', bio || '']
  );
  return {
    id: result.insertId,
    username,
    email,
    avatar: avatar || '',
    bio: bio || '',
    created_at: new Date().toISOString(),
  };
}

/**
 * 按邮箱查找用户（含密码哈希，用于登录验证）
 */
export async function findByEmail(email: string): Promise<UserRow | null> {
  const pool = getPool();
  const [rows] = await pool.query<RowDataPacket[]>(
    'SELECT * FROM users WHERE email = ? LIMIT 1',
    [email]
  );
  return rows.length > 0 ? (rows[0] as UserRow) : null;
}

/**
 * 按用户名查找用户
 */
export async function findByUsername(username: string): Promise<UserRow | null> {
  const pool = getPool();
  const [rows] = await pool.query<RowDataPacket[]>(
    'SELECT * FROM users WHERE username = ? LIMIT 1',
    [username]
  );
  return rows.length > 0 ? (rows[0] as UserRow) : null;
}

/**
 * 按 ID 查找用户（公开信息）
 */
export async function findById(id: number): Promise<PublicUser | null> {
  const pool = getPool();
  const [rows] = await pool.query<RowDataPacket[]>(
    'SELECT id, username, email, avatar, bio, created_at FROM users WHERE id = ? LIMIT 1',
    [id]
  );
  if (rows.length === 0) return null;
  return toPublicUser(rows[0] as UserRow);
}

/**
 * 更新用户资料
 */
export async function updateUser(
  id: number,
  fields: { username?: string; avatar?: string; bio?: string }
): Promise<boolean> {
  const pool = getPool();
  const updates: string[] = [];
  const values: any[] = [];

  if (fields.username !== undefined) {
    updates.push('username = ?');
    values.push(fields.username);
  }
  if (fields.avatar !== undefined) {
    updates.push('avatar = ?');
    values.push(fields.avatar);
  }
  if (fields.bio !== undefined) {
    updates.push('bio = ?');
    values.push(fields.bio);
  }

  if (updates.length === 0) return false;

  values.push(id);
  const [result] = await pool.query<ResultSetHeader>(
    `UPDATE users SET ${updates.join(', ')} WHERE id = ?`,
    values
  );
  return result.affectedRows > 0;
}
