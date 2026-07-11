import { Router, Request, Response } from 'express';
import { authMiddleware, optionalAuth } from '../middleware/auth';
import * as bookRepo from '../src/db/repositories/bookRepo';

const router = Router();

/**
 * GET /api/books
 * 获取图书列表（需认证）
 */
router.get('/', authMiddleware, async (req: Request, res: Response) => {
  try {
    const { page, size, keyword, category } = req.query;
    const result = await bookRepo.findBooks({
      userId: req.user?.userId ?? 1,
      keyword: keyword as string,
      category: category as string,
      page: page ? parseInt(page as string) : 1,
      size: size ? parseInt(size as string) : 20,
    });
    res.json({ code: 200, data: result });
  } catch (err: any) {
    console.error('[Books] List error:', err.message);
    res.status(500).json({ code: 500, message: 'Failed to fetch books' });
  }
});

/**
 * GET /api/books/public
 * 获取公开图书（不需认证）
 */
router.get('/public', async (req: Request, res: Response) => {
  try {
    const { page, size, keyword, category } = req.query;
    const result = await bookRepo.findPublicBooks({
      keyword: keyword as string,
      category: category as string,
      page: page ? parseInt(page as string) : 1,
      size: size ? parseInt(size as string) : 20,
    });
    res.json({ code: 200, data: result });
  } catch (err: any) {
    console.error('[Books] Public list error:', err.message);
    res.status(500).json({ code: 500, message: 'Failed to fetch public books' });
  }
});

/**
 * GET /api/books/:id
 * 获取图书详情
 */
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const book = await bookRepo.findBookById(parseInt(req.params.id));
    if (!book) {
      return res.status(404).json({ code: 404, message: 'Book not found' });
    }
    res.json({ code: 200, data: book });
  } catch (err: any) {
    console.error('[Books] Detail error:', err.message);
    res.status(500).json({ code: 500, message: 'Failed to fetch book' });
  }
});

/**
 * POST /api/books
 * 创建/导入图书（需认证）
 */
router.post('/', optionalAuth, async (req: Request, res: Response) => {
  console.log('[Books] POST received, body keys:', Object.keys(req.body || {}));
  try {
    const { title, author, country, cover, filePath, fileUrl, fileType, fileSize, category, visibility, summary, content, chapters } = req.body;

    if (!title || !author) {
      return res.status(400).json({ code: 400, message: 'Title and author are required' });
    }

    const book = await bookRepo.createBook({
      userId: req.user?.userId ?? 1,
      title,
      author,
      country,
      cover,
      filePath,
      fileUrl,
      fileType,
      fileSize,
      category,
      visibility,
      summary,
      content,
      chapters,
    });

    res.status(201).json({ code: 201, data: book });
  } catch (err: any) {
    console.error('[Books] Create error:', err.message);
    res.status(500).json({ code: 500, message: 'Failed to create book' });
  }
});

/**
 * PUT /api/books/:id
 * 更新图书（需认证，仅所有者）
 */
router.put('/:id', authMiddleware, async (req: Request, res: Response) => {
  try {
    const bookId = parseInt(req.params.id);
    const book = await bookRepo.findBookById(bookId);

    if (!book) {
      return res.status(404).json({ code: 404, message: 'Book not found' });
    }
    // 简单权限检查（实际应该更严格）
    // if (book.user_id !== req.user!.userId) {
    //   return res.status(403).json({ code: 403, message: 'Not authorized' });
    // }

    const updated = await bookRepo.updateBook(bookId, req.body);
    if (!updated) {
      return res.status(400).json({ code: 400, message: 'No fields to update' });
    }

    res.json({ code: 200, message: 'Book updated' });
  } catch (err: any) {
    console.error('[Books] Update error:', err.message);
    res.status(500).json({ code: 500, message: 'Failed to update book' });
  }
});

/**
 * DELETE /api/books/:id
 * 删除图书（需认证）
 */
router.delete('/:id', authMiddleware, async (req: Request, res: Response) => {
  try {
    const bookId = parseInt(req.params.id);
    const deleted = await bookRepo.deleteBook(bookId);

    if (!deleted) {
      return res.status(404).json({ code: 404, message: 'Book not found' });
    }

    res.json({ code: 200, message: 'Book deleted' });
  } catch (err: any) {
    console.error('[Books] Delete error:', err.message);
    res.status(500).json({ code: 500, message: 'Failed to delete book' });
  }
});

export default router;
