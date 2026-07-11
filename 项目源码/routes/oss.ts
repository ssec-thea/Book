import { Router, Request, Response } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import {
  uploadToOSS,
  getDownloadUrl,
  getStorageInfo,
  isOSSConfigured,
} from '../services/ossService';

const router = Router();

// 临时文件存储目录
const TMP_DIR = path.join(process.cwd(), 'data', 'tmp');
if (!fs.existsSync(TMP_DIR)) {
  fs.mkdirSync(TMP_DIR, { recursive: true });
}

// multer 配置：接收单个文件，存到临时目录
const upload = multer({
  dest: TMP_DIR,
  limits: { fileSize: 50 * 1024 * 1024 }, // 50MB
});

/**
 * POST /api/oss/upload
 * 上传文件到 OSS（服务端代理，无需浏览器直传）
 *
 * 请求: multipart/form-data { file }
 * 返回: { url, key }
 */
router.post('/upload', upload.single('file'), async (req: Request, res: Response) => {
  let tmpPath = '';

  try {
    if (!isOSSConfigured()) {
      return res.status(503).json({
        code: 503,
        message: 'OSS storage is not configured on the server',
      });
    }

    if (!req.file) {
      return res.status(400).json({
        code: 400,
        message: 'No file provided',
      });
    }

    tmpPath = req.file.path;
    const originalName = req.file.originalname;

    console.log('[OSS] Uploading to OSS:', originalName);
    const { url, key } = await uploadToOSS(tmpPath, originalName);
    console.log('[OSS] Upload success:', url);

    res.json({
      code: 200,
      data: { url, key },
    });
  } catch (err: any) {
    console.error('[OSS] Upload error:', err.message);
    res.status(500).json({
      code: 500,
      message: `Upload failed: ${err.message}`,
    });
  } finally {
    // 清理临时文件
    if (tmpPath && fs.existsSync(tmpPath)) {
      fs.unlinkSync(tmpPath);
    }
  }
});

/**
 * GET /api/oss/proxy?url=<encoded-oss-url>
 * 生成 OSS 签名下载 URL 并 302 重定向（私有 Bucket 安全访问）
 */
router.get('/proxy', async (req: Request, res: Response) => {
  try {
    const url = req.query.url as string;
    if (!url) {
      return res.status(400).json({ code: 400, message: 'url param required' });
    }

    // 从完整 OSS URL 提取 key (例如 https://bucket.region.aliyuncs.com/books/xxx.pdf → books/xxx.pdf)
    const urlObj = new URL(url);
    const key = urlObj.pathname.substring(1); // 去掉开头的 /

    console.log('[OSS] Generating signed URL for key:', key);
    const signedUrl = getDownloadUrl(key);
    console.log('[OSS] Redirecting to signed URL');

    res.redirect(302, signedUrl);
  } catch (err: any) {
    console.error('[OSS] Proxy error:', err.message);
    if (!res.headersSent) {
      res.status(500).json({ code: 500, message: err.message });
    }
  }
});

/**
 * GET /api/oss/storage-info
 */
router.get('/storage-info', async (_req: Request, res: Response) => {
  try {
    const info = getStorageInfo();
    res.json({ code: 200, data: info });
  } catch (err: any) {
    res.status(500).json({ code: 500, message: err.message });
  }
});

export default router;
