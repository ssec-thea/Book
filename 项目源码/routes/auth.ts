import { Router, Request, Response } from 'express';
import { authMiddleware } from '../middleware/auth';
import { hashPassword, verifyPassword } from '../utils/password';
import { generateToken } from '../utils/token';
import { validateEmail, validatePassword, validateUsername } from '../utils/validators';
import * as userRepo from '../src/db/repositories/userRepo';

const router = Router();

/**
 * POST /api/auth/register
 * 用户注册
 */
router.post('/register', async (req: Request, res: Response) => {
  try {
    const { username, email, password, avatar, bio } = req.body;

    // 校验输入
    const usernameError = validateUsername(username);
    if (usernameError) {
      return res.status(400).json({ code: 400, message: usernameError });
    }

    if (!validateEmail(email)) {
      return res.status(400).json({ code: 400, message: 'Invalid email format' });
    }

    const passwordError = validatePassword(password);
    if (passwordError) {
      return res.status(400).json({ code: 400, message: passwordError });
    }

    // 检查唯一性
    const existingEmail = await userRepo.findByEmail(email);
    if (existingEmail) {
      return res.status(400).json({ code: 400, message: 'Email already registered' });
    }

    const existingUsername = await userRepo.findByUsername(username);
    if (existingUsername) {
      return res.status(400).json({ code: 400, message: 'Username already exists' });
    }

    // 哈希密码并创建用户
    const passwordHash = await hashPassword(password);
    const user = await userRepo.createUser(username, email, passwordHash, avatar, bio);

    // 生成 JWT
    const token = generateToken({
      userId: user.id,
      username: user.username,
      email: user.email,
    });

    res.status(201).json({ code: 201, token, user });
  } catch (err: any) {
    console.error('[Auth] Register error:', err.message);
    res.status(500).json({ code: 500, message: 'Registration failed' });
  }
});

/**
 * POST /api/auth/login
 * 用户登录
 */
router.post('/login', async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ code: 400, message: 'Email and password are required' });
    }

    // 查找用户
    const user = await userRepo.findByEmail(email);
    if (!user) {
      return res.status(401).json({ code: 401, message: 'Invalid email or password' });
    }

    // 验证密码
    const isValid = await verifyPassword(password, user.password_hash);
    if (!isValid) {
      return res.status(401).json({ code: 401, message: 'Invalid email or password' });
    }

    // 生成 JWT
    const token = generateToken({
      userId: user.id,
      username: user.username,
      email: user.email,
    });

    res.json({
      code: 200,
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        avatar: user.avatar,
        bio: user.bio,
        created_at: user.created_at,
      },
    });
  } catch (err: any) {
    console.error('[Auth] Login error:', err.message);
    res.status(500).json({ code: 500, message: 'Login failed' });
  }
});

/**
 * GET /api/auth/me
 * 获取当前登录用户信息（需认证）
 */
router.get('/me', authMiddleware, async (req: Request, res: Response) => {
  try {
    const user = await userRepo.findById(req.user!.userId);
    if (!user) {
      return res.status(404).json({ code: 404, message: 'User not found' });
    }
    res.json({ code: 200, user });
  } catch (err: any) {
    console.error('[Auth] Get me error:', err.message);
    res.status(500).json({ code: 500, message: 'Failed to get user info' });
  }
});

/**
 * PUT /api/auth/profile
 * 更新用户资料（需认证）
 */
router.put('/profile', authMiddleware, async (req: Request, res: Response) => {
  try {
    const { username, avatar, bio } = req.body;
    const updated = await userRepo.updateUser(req.user!.userId, {
      username,
      avatar,
      bio,
    });

    if (!updated) {
      return res.status(400).json({ code: 400, message: 'No fields to update' });
    }

    const user = await userRepo.findById(req.user!.userId);
    res.json({ code: 200, message: 'Profile updated', user });
  } catch (err: any) {
    console.error('[Auth] Update profile error:', err.message);
    res.status(500).json({ code: 500, message: 'Failed to update profile' });
  }
});

export default router;
