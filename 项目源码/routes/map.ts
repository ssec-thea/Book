import { Router, Request, Response } from 'express';
import { authMiddleware } from '../middleware/auth';
import * as bookRepo from '../src/db/repositories/bookRepo';
import * as reviewRepo from '../src/db/repositories/reviewRepo';
import { getPool } from '../src/db/database';

const router = Router();

// 国家坐标映射 (来自 mockData.ts 的 COUNTRIES_GEO_MAP)
const COUNTRY_COORDS: Record<string, { lat: number; lng: number; code: string }> = {
  'China': { lat: 35.8617, lng: 104.1954, code: 'CN' },
  'Colombia': { lat: 4.5709, lng: -74.2973, code: 'CO' },
  'United States': { lat: 37.0902, lng: -95.7129, code: 'US' },
  'Japan': { lat: 36.2048, lng: 138.2529, code: 'JP' },
  'France': { lat: 46.2276, lng: 2.2137, code: 'FR' },
  'United Kingdom': { lat: 55.3781, lng: -3.4360, code: 'GB' },
  'Germany': { lat: 51.1657, lng: 10.4515, code: 'DE' },
  'Brazil': { lat: -14.2350, lng: -51.9253, code: 'BR' },
  'Russia': { lat: 61.5240, lng: 105.3188, code: 'RU' },
  'India': { lat: 20.5937, lng: 78.9629, code: 'IN' },
  'South Africa': { lat: -30.5595, lng: 22.9375, code: 'ZA' },
  'Australia': { lat: -25.2744, lng: 133.7751, code: 'AU' },
  'Italy': { lat: 41.8719, lng: 12.5674, code: 'IT' },
  'Canada': { lat: 56.1304, lng: -106.3468, code: 'CA' },
  'Spain': { lat: 40.4637, lng: -3.7492, code: 'ES' },
  'Egypt': { lat: 26.8206, lng: 30.8025, code: 'EG' },
  'Mexico': { lat: 23.6345, lng: -102.5528, code: 'MX' },
  'Argentina': { lat: -38.4161, lng: -63.6167, code: 'AR' },
  'South Korea': { lat: 35.9078, lng: 127.7669, code: 'KR' },
  'Greece': { lat: 39.0742, lng: 21.8243, code: 'GR' },
  'Sweden': { lat: 60.1282, lng: 18.6435, code: 'SE' },
  'Turkey': { lat: 38.9637, lng: 35.2433, code: 'TR' },
  'Singapore': { lat: 1.3521, lng: 103.8198, code: 'SG' },
};

/**
 * GET /api/map/my-books
 * 我的图书地图数据（按作者国籍聚合）
 */
router.get('/my-books', authMiddleware, async (req: Request, res: Response) => {
  try {
    const pool = getPool();
    const [rows] = await pool.execute<any[]>(
      `SELECT country, COUNT(*) as count,
       JSON_ARRAYAGG(JSON_OBJECT('id', id, 'title', title, 'author', author, 'cover', cover, 'category', category))
       as books_json
       FROM books WHERE user_id = ?
       GROUP BY country ORDER BY count DESC`,
      [req.user!.userId]
    );

    const data = rows.map(row => ({
      country: row.country,
      countryCode: COUNTRY_COORDS[row.country]?.code || 'UN',
      count: row.count,
      books: typeof row.books_json === 'string' ? JSON.parse(row.books_json) : row.books_json,
      coordinates: COUNTRY_COORDS[row.country] || null,
    }));

    res.json({ code: 200, data });
  } catch (err: any) {
    console.error('[Map] My books error:', err.message);
    res.status(500).json({ code: 500, message: 'Failed to fetch map data' });
  }
});

/**
 * GET /api/map/public-reviews
 * 全部公开书评地图数据
 */
router.get('/public-reviews', async (req: Request, res: Response) => {
  try {
    const reviews = await reviewRepo.findPublicReviews();

    // 按位置聚合
    const locationMap = new Map<string, any>();
    for (const r of reviews) {
      const key = r.location_name || 'Unknown';
      if (!locationMap.has(key)) {
        locationMap.set(key, {
          location_name: key,
          longitude: r.longitude,
          latitude: r.latitude,
          count: 0,
          reviews: [],
        });
      }
      const loc = locationMap.get(key)!;
      loc.count++;
      loc.reviews.push({
        username: r.username,
        score: r.score,
        title: r.title,
        content: r.content?.substring(0, 200),
        created_at: r.created_at,
      });
    }

    res.json({ code: 200, data: Array.from(locationMap.values()) });
  } catch (err: any) {
    console.error('[Map] Public reviews error:', err.message);
    res.status(500).json({ code: 500, message: 'Failed to fetch map data' });
  }
});

/**
 * GET /api/map/same-book/:bookId
 * 同书读者地图数据
 */
router.get('/same-book/:bookId', authMiddleware, async (req: Request, res: Response) => {
  try {
    const reviews = await reviewRepo.findReviews({
      bookId: parseInt(req.params.bookId),
      visibility: 1,
    });

    const locationMap = new Map<string, any>();
    for (const r of reviews.list) {
      const key = r.location_name || 'Unknown';
      if (!locationMap.has(key)) {
        locationMap.set(key, {
          location_name: key,
          longitude: r.longitude,
          latitude: r.latitude,
          reviews: [],
        });
      }
      locationMap.get(key)!.reviews.push({
        username: r.username,
        score: r.score,
        content: r.content?.substring(0, 200),
        created_at: r.created_at,
      });
    }

    res.json({ code: 200, data: Array.from(locationMap.values()) });
  } catch (err: any) {
    console.error('[Map] Same book error:', err.message);
    res.status(500).json({ code: 500, message: 'Failed to fetch map data' });
  }
});

export default router;
