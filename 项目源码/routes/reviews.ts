import { Router, Request, Response } from 'express';
import { authMiddleware, optionalAuth } from '../middleware/auth';
import * as reviewRepo from '../src/db/repositories/reviewRepo';

const router = Router();

/**
 * GET /api/reviews
 * 获取书评列表（公开书评不需要认证）
 */
router.get('/', optionalAuth, async (req: Request, res: Response) => {
  try {
    const { bookId, userId, visibility, page, size } = req.query;
    const result = await reviewRepo.findReviews({
      bookId: bookId ? parseInt(bookId as string) : undefined,
      userId: userId ? parseInt(userId as string) : undefined,
      visibility: visibility ? parseInt(visibility as string) : undefined,
      page: page ? parseInt(page as string) : 1,
      size: size ? parseInt(size as string) : 20,
    });
    res.json({ code: 200, data: result });
  } catch (err: any) {
    console.error('[Reviews] List error:', err.message);
    res.status(500).json({ code: 500, message: 'Failed to fetch reviews' });
  }
});

/**
 * POST /api/reviews
 * 发布书评（需认证）
 */
router.post('/', authMiddleware, async (req: Request, res: Response) => {
  try {
    const { book_id, title, content, score, longitude, latitude, location_name, visibility } = req.body;

    if (!book_id || !title || !content || !score) {
      return res.status(400).json({ code: 400, message: 'book_id, title, content, and score are required' });
    }

    if (score < 1 || score > 5) {
      return res.status(400).json({ code: 400, message: 'Score must be between 1 and 5' });
    }

    const review = await reviewRepo.createReview({
      userId: req.user!.userId,
      bookId: book_id,
      title,
      content,
      score,
      longitude,
      latitude,
      locationName: location_name,
      visibility,
    });

    res.status(201).json({ code: 201, data: review });
  } catch (err: any) {
    console.error('[Reviews] Create error:', err.message);
    res.status(500).json({ code: 500, message: 'Failed to create review' });
  }
});

/**
 * PUT /api/reviews/:id
 * 更新书评（需认证）
 */
router.put('/:id', authMiddleware, async (req: Request, res: Response) => {
  try {
    const updated = await reviewRepo.updateReview(parseInt(req.params.id), req.body);
    if (!updated) {
      return res.status(404).json({ code: 404, message: 'Review not found' });
    }
    res.json({ code: 200, message: 'Review updated' });
  } catch (err: any) {
    console.error('[Reviews] Update error:', err.message);
    res.status(500).json({ code: 500, message: 'Failed to update review' });
  }
});

/**
 * DELETE /api/reviews/:id
 * 删除书评（需认证）
 */
router.delete('/:id', authMiddleware, async (req: Request, res: Response) => {
  try {
    const deleted = await reviewRepo.deleteReview(parseInt(req.params.id));
    if (!deleted) {
      return res.status(404).json({ code: 404, message: 'Review not found' });
    }
    res.json({ code: 200, message: 'Review deleted' });
  } catch (err: any) {
    console.error('[Reviews] Delete error:', err.message);
    res.status(500).json({ code: 500, message: 'Failed to delete review' });
  }
});

export default router;
