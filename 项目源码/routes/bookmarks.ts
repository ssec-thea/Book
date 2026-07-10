import { Router, Request, Response } from 'express';
import { authMiddleware } from '../middleware/auth';
import * as bookmarkRepo from '../src/db/repositories/bookmarkRepo';

const router = Router();

/**
 * GET /api/bookmarks?bookId=1
 * 获取书签列表
 */
router.get('/', authMiddleware, async (req: Request, res: Response) => {
  try {
    const bookId = req.query.bookId ? parseInt(req.query.bookId as string) : undefined;
    let bookmarks;
    if (bookId) {
      bookmarks = await bookmarkRepo.findByUserAndBook(req.user!.userId, bookId);
    } else {
      // 返回用户所有书签
      bookmarks = await bookmarkRepo.findByUserAndBook(req.user!.userId, 0);
    }
    res.json({ code: 200, data: bookmarks });
  } catch (err: any) {
    console.error('[Bookmarks] List error:', err.message);
    res.status(500).json({ code: 500, message: 'Failed to fetch bookmarks' });
  }
});

/**
 * POST /api/bookmarks
 * 添加书签
 */
router.post('/', authMiddleware, async (req: Request, res: Response) => {
  try {
    const { book_id, position, chapter_title, note, text_snippet } = req.body;

    if (!book_id || position === undefined) {
      return res.status(400).json({ code: 400, message: 'book_id and position are required' });
    }

    const bookmark = await bookmarkRepo.createBookmark({
      bookId: book_id,
      userId: req.user!.userId,
      position,
      chapterTitle: chapter_title,
      note,
      textSnippet: text_snippet,
    });

    res.status(201).json({ code: 201, data: bookmark });
  } catch (err: any) {
    console.error('[Bookmarks] Create error:', err.message);
    res.status(500).json({ code: 500, message: 'Failed to create bookmark' });
  }
});

/**
 * DELETE /api/bookmarks/:id
 * 删除书签
 */
router.delete('/:id', authMiddleware, async (req: Request, res: Response) => {
  try {
    const deleted = await bookmarkRepo.deleteBookmark(parseInt(req.params.id));
    if (!deleted) {
      return res.status(404).json({ code: 404, message: 'Bookmark not found' });
    }
    res.json({ code: 200, message: 'Bookmark deleted' });
  } catch (err: any) {
    console.error('[Bookmarks] Delete error:', err.message);
    res.status(500).json({ code: 500, message: 'Failed to delete bookmark' });
  }
});

export default router;
