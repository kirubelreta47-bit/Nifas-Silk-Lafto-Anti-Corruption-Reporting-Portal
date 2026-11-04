import { Request, Response } from 'express';
import multer from 'multer';
import path from 'path';
import { storageService } from '../services/storageService.js';

// Use memory storage for clean buffer streaming to Cloudflare R2
const storage = multer.memoryStorage();

// Prohibited dangerous executable extensions
const prohibitedExtensions = /\.(exe|bat|cmd|sh|vbs|msi|scr|com|pif)$/i;

export const uploadMiddleware = multer({
  storage,
  limits: {
    fileSize: 25 * 1024 * 1024, // 25MB limit per file
  },
  fileFilter: (_req, file, cb) => {
    // Reject dangerous executable formats
    if (file.originalname.match(prohibitedExtensions)) {
      return cb(new Error(`Security rejection: Executable and script files (.exe, .bat, .sh) are not permitted.`));
    }
    // Allow all other file types (PDF, Word, Excel, Images, Videos, Audio, Archives, and generic documents)
    cb(null, true);
  },
});

export const uploadController = {
  // POST /api/upload
  uploadFile: async (req: Request, res: Response) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: 'No file provided' });
      }

      const file = req.file;
      const reportId = req.body.reportId as string | undefined;

      // Upload to Cloudflare R2 (or persistent local disk in dev)
      const stored = await storageService.upload(
        file.buffer,
        file.originalname,
        file.mimetype || 'application/octet-stream',
        reportId
      );

      return res.status(201).json({
        success: true,
        item: {
          id: stored.id,
          name: stored.name,
          type: stored.type,
          size: stored.size,
          storageKey: stored.storageKey,
          dataUrl: stored.url, // URL reference for preview/download
        },
      });
    } catch (err: any) {
      console.error('File upload error:', err);
      return res.status(500).json({ error: err.message || 'File upload failed' });
    }
  },

  // GET /api/upload/file/*
  getFile: async (req: Request, res: Response) => {
    try {
      // Decode wildcard key parameter
      const rawKey = req.params[0] || (req.params as any).key;
      if (!rawKey) {
        return res.status(400).json({ error: 'Storage key required' });
      }

      const storageKey = decodeURIComponent(rawKey);
      const fileData = await storageService.getFileStream(storageKey);

      const isDownload = req.query.download === '1' || req.query.download === 'true';
      const disposition = isDownload ? 'attachment' : 'inline';

      res.setHeader('Content-Type', fileData.contentType);
      res.setHeader('Content-Length', fileData.contentLength);
      res.setHeader(
        'Content-Disposition',
        `${disposition}; filename="${encodeURIComponent(fileData.filename)}"`
      );
      res.setHeader('Cache-Control', 'public, max-age=86400'); // Cache for 24h

      fileData.stream.pipe(res);
    } catch (err: any) {
      console.error('File retrieval error:', err);
      return res.status(404).json({ error: 'File not found or storage error' });
    }
  },
};
