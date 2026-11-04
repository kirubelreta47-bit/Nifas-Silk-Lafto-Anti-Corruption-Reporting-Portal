import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { config } from '../config/index.js';

export interface AuthenticatedRequest extends Request {
  user?: {
    userId: string | number;
    email: string;
    role: string;
  };
}

export const requireAdmin = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Authentication required. Missing or invalid Bearer token.' });
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, config.jwtSecret) as {
      userId: string | number;
      email: string;
      role: string;
    };

    if (decoded.role !== 'admin') {
      return res.status(403).json({ error: 'Forbidden: Admin privilege required.' });
    }

    req.user = decoded;
    next();
  } catch (err: any) {
    return res.status(401).json({ error: 'Session expired or invalid token. Please log in again.' });
  }
};

