/**
 * 阿里云 OSS 服务（服务端代理上传）
 *
 * 流程:
 * 1. 浏览器上传文件到 Express → POST /api/oss/upload (multipart)
 * 2. Express 通过 ali-oss SDK 上传到 OSS
 * 3. 返回 OSS 文件 URL
 */
import OSS from 'ali-oss';
import crypto from 'crypto';
import path from 'path';
import fs from 'fs';

const config = {
  region: process.env.OSS_REGION || 'oss-cn-chengdu',
  bucket: process.env.OSS_BUCKET || 'reading-app-books',
  accessKeyId: process.env.OSS_ACCESS_KEY_ID || '',
  accessKeySecret: process.env.OSS_ACCESS_KEY_SECRET || '',
  maxFileSizeMB: parseInt(process.env.MAX_FILE_SIZE_MB || '50'),
};

/**
 * 判断 OSS 是否已配置
 */
export function isOSSConfigured(): boolean {
  return !!(config.accessKeyId && config.accessKeySecret && config.bucket);
}

/**
 * 获取 OSS 客户端实例
 */
function getOSSClient(): OSS {
  return new OSS({
    region: config.region,
    accessKeyId: config.accessKeyId,
    accessKeySecret: config.accessKeySecret,
    bucket: config.bucket,
  });
}

/**
 * 服务端上传文件到 OSS
 * @param filePath 本地临时文件路径
 * @param originalName 原始文件名
 * @returns OSS 文件 URL
 */
export async function uploadToOSS(
  filePath: string,
  originalName: string
): Promise<{ url: string; key: string }> {
  const ext = path.extname(originalName).toLowerCase() || '.txt';
  const uuid = crypto.randomUUID();
  const timestamp = Date.now();
  const key = `books/${timestamp}-${uuid}${ext}`;

  // Content-Type 映射
  const mimeTypes: Record<string, string> = {
    '.epub': 'application/epub+zip',
    '.pdf': 'application/pdf',
    '.txt': 'text/plain',
  };
  const contentType = mimeTypes[ext] || 'application/octet-stream';

  const client = getOSSClient();

  // 读取文件并上传
  const fileContent = fs.readFileSync(filePath);
  await client.put(key, fileContent, {
    headers: { 'Content-Type': contentType },
  });

  // 生成文件访问 URL
  const url = `https://${config.bucket}.${config.region}.aliyuncs.com/${key}`;

  return { url, key };
}

/**
 * 生成 OSS 签名下载 URL（私有 Bucket 安全访问，有效期 1 小时）
 * @param key OSS 文件 key，如 books/xxx.pdf
 */
export function getDownloadUrl(key: string): string {
  const client = getOSSClient();
  return client.signatureUrl(key, { expires: 3600 });
}

/**
 * 获取存储配置摘要
 */
export function getStorageInfo() {
  return {
    type: isOSSConfigured() ? 'oss' : 'local',
    bucket: config.bucket,
    region: config.region,
    maxFileSizeMB: config.maxFileSizeMB,
  };
}
