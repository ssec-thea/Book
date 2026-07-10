import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'bookvoyage-dev-secret-change-in-production';
const TOKEN_EXPIRY = '7d';

export interface TokenPayload {
  userId: number;
  username: string;
  email: string;
}

/**
 * 生成 JWT Token
 */
export function generateToken(payload: TokenPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: TOKEN_EXPIRY });
}

/**
 * 验证并解析 JWT Token
 */
export function verifyToken(token: string): TokenPayload {
  return jwt.verify(token, JWT_SECRET) as TokenPayload;
}
