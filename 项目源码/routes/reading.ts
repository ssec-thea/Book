import { Router, Request, Response } from 'express';
import { authMiddleware } from '../middleware/auth';
import * as readingRepo from '../src/db/repositories/readingRepo';
import * as bookRepo from '../src/db/repositories/bookRepo';

const router = Router();

/**
 * GET /api/reading/:bookId
 * 获取某本书的阅读记录
 */
router.get('/:bookId', authMiddleware, async (req: Request, res: Response) => {
  try {
    const records = await readingRepo.getRecords(
      req.user!.userId,
      parseInt(req.params.bookId)
    );
    res.json({ code: 200, data: records });
  } catch (err: any) {
    console.error('[Reading] Get error:', err.message);
    res.status(500).json({ code: 500, message: 'Failed to fetch reading records' });
  }
});

/**
 * POST /api/reading
 * 保存阅读进度
 */
router.post('/', authMiddleware, async (req: Request, res: Response) => {
  try {
    const { book_id, current_page, progress, duration } = req.body;

    if (!book_id) {
      return res.status(400).json({ code: 400, message: 'book_id is required' });
    }

    // 保存阅读记录
    await readingRepo.saveProgress(
      req.user!.userId,
      book_id,
      duration || 0,
      current_page || 0,
      progress || '0'
    );

    // 同步更新图书的累计阅读时长和进度
    if (duration || current_page !== undefined) {
      const book = await bookRepo.findBookById(book_id);
      if (book) {
        const newReadTime = (book.read_time || 0) + (duration || 0);
        const newProgress = progress !== undefined ? progress : book.progress;
        const newCurrentPage = current_page !== undefined ? current_page : book.current_page;
        await bookRepo.updateReadingProgress(
          book_id,
          newCurrentPage,
          newProgress,
          newReadTime,
          new Date().toISOString()
        );
      }
    }

    res.json({ code: 200, message: 'Reading progress saved' });
  } catch (err: any) {
    console.error('[Reading] Save error:', err.message);
    res.status(500).json({ code: 500, message: 'Failed to save reading progress' });
  }
});

export default router;
