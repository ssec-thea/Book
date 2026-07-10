import { Request, Response, NextFunction } from 'express';
import { verifyToken, TokenPayload } from '../utils/token';

// 扩展 Express Request 类型
declare global {
  namespace Express {
    interface Request {
      user?: TokenPayload;
    }
  }
}

/**
 * JWT 认证中间件
 * 从 Authorization header 提取 Bearer token 并验证
 * 验证成功后将用户信息挂载到 req.user
 */
export function authMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({ code: 401, message: 'No token provided' });
    return;
  }

  const token = authHeader.split(' ')[1];

  try {
    const payload = verifyToken(token);
    req.user = payload;
    next();
  } catch (error) {
    res.status(401).json({ code: 401, message: 'Invalid or expired token' });
  }
}

/**
 * 可选认证中间件
 * 如果提供了 token 则验证，否则继续但不挂载 user
 */
export function optionalAuth(
  req: Request,
  _res: Response,
  next: NextFunction
): void {
  const authHeader = req.headers.authorization;

  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.split(' ')[1];
    try {
      const payload = verifyToken(token);
      req.user = payload;
    } catch {
      // Token 无效，忽略，继续无认证访问
    }
  }

  next();
}
