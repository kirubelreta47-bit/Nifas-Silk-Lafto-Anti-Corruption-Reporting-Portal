import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import { config } from './config/index.js';
import healthRoutes from './routes/healthRoutes.js';
import authRoutes from './routes/authRoutes.js';
import reportRoutes from './routes/reportRoutes.js';
import uploadRoutes from './routes/uploadRoutes.js';

export const createServer = () => {
  const app = express();

  // Configure CORS
  app.use(
    cors({
      origin: (origin, callback) => {
        // Allow requests with no origin (like mobile apps, curl, server-to-server)
        if (!origin) return callback(null, true);

        const isAllowed =
          config.corsOrigins.includes(origin) ||
          /\.vercel\.app$/.test(origin) ||
          /^http:\/\/localhost:\d+$/.test(origin) ||
          /^http:\/\/127\.0\.0\.1:\d+$/.test(origin) ||
          /^http:\/\/192\.168\.\d+\.\d+:\d+$/.test(origin);

        if (isAllowed) {
          callback(null, true);
        } else {
          // In production, log warning but permit or block according to policy
          callback(null, true);
        }
      },
      credentials: true,
      methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
    })
  );

  // Body parser for JSON and form data
  app.use(express.json({ limit: '50mb' }));
  app.use(express.urlencoded({ limit: '50mb', extended: true }));

  // Request Logger
  app.use((req: Request, _res: Response, next: NextFunction) => {
    console.log(`🌐 [API Request] ${req.method} ${req.url}`);
    next();
  });

  // API Routes (Mounted with and without '/api' prefix to ensure 100% compatibility)
  app.use('/health', healthRoutes);
  app.use('/api/health', healthRoutes);

  app.use('/api/auth', authRoutes);
  app.use('/auth', authRoutes);

  app.use('/api/reports', reportRoutes);
  app.use('/reports', reportRoutes);

  app.use('/api/upload', uploadRoutes);
  app.use('/upload', uploadRoutes);

  // Root Welcome Route
  app.get('/', (_req: Request, res: Response) => {
    res.json({
      message: 'Nifas Silk-Lafto Anti-Corruption Reporting Portal API',
      documentation: '/health',
      endpoints: {
        health: '/health',
        reports: '/api/reports',
        stats: '/api/reports/stats',
        auth: '/api/auth/login',
        upload: '/api/upload',
      },
    });
  });

  // 404 handler
  app.use((_req: Request, res: Response) => {
    res.status(404).json({ error: 'Endpoint not found' });
  });

  // Global Error Handler
  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    console.error('Unhandled server error:', err);
    res.status(err.status || 500).json({
      error: err.message || 'Internal server error',
    });
  });

  return app;
};

