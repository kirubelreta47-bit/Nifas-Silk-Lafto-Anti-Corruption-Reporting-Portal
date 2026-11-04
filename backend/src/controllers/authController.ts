import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { db } from '../db/index.js';
import { config } from '../config/index.js';

export const authController = {
  // POST /api/auth/login
  login: async (req: Request, res: Response) => {
    try {
      const { email, password } = req.body;
      if (!email || !password) {
        return res.status(400).json({ error: 'Email and password are required' });
      }

      const cleanEmail = String(email).trim().toLowerCase();

      // Look up admin in database
      const adminUser = await db.getAdminByEmail(cleanEmail);
      if (!adminUser) {
        return res.status(401).json({ error: 'invalidCredentials' });
      }

      // Verify bcrypt password hash
      const isPasswordValid = await bcrypt.compare(String(password), adminUser.passwordHash);
      if (!isPasswordValid) {
        return res.status(401).json({ error: 'invalidCredentials' });
      }

      // Generate signed JWT token
      const token = jwt.sign(
        {
          userId: adminUser.id,
          email: adminUser.email,
          role: adminUser.role,
        },
        config.jwtSecret,
        { expiresIn: '7d' }
      );

      return res.json({
        success: true,
        user: {
          id: adminUser.id,
          email: adminUser.email,
          name: adminUser.name,
          role: adminUser.role,
        },
        token,
      });
    } catch (err: any) {
      console.error('Authentication error:', err);
      return res.status(500).json({ error: err.message || 'Authentication error' });
    }
  },

  // GET /api/auth/me
  getMe: async (req: Request, res: Response) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    try {
      const token = authHeader.split(' ')[1];
      const decoded = jwt.verify(token, config.jwtSecret) as any;
      const user = await db.getAdminByEmail(decoded.email);
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      return res.json({
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
        },
      });
    } catch (err) {
      return res.status(401).json({ error: 'Invalid or expired session token' });
    }
  },
};
