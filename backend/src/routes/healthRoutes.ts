import { Router, Request, Response } from 'express';
import { getDatabaseStatus } from '../db/index.js';
import { storageService } from '../services/storageService.js';

const router = Router();

router.get('/', (_req: Request, res: Response) => {
  const dbStatus = getDatabaseStatus();
  const storageStatus = storageService.getStatus();
  res.json({
    status: 'ok',
    service: 'nsl-anti-corruption-api',
    uptimeSeconds: Math.floor(process.uptime()),
    database: dbStatus,
    storage: storageStatus,
    timestamp: new Date().toISOString(),
  });
});

export default router;

