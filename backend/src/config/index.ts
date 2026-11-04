import path from 'path';
import dotenv from 'dotenv';
dotenv.config();

export const config = {
  port: parseInt(process.env.PORT || '5000', 10),
  nodeEnv: process.env.NODE_ENV || 'development',
  databaseUrl: process.env.DATABASE_URL || '',
  frontendUrl: process.env.FRONTEND_URL || 'http://localhost:3000',
  jwtSecret: process.env.JWT_SECRET || 'nsl-anti-corruption-secure-admin-secret-key-2026',
  
  // Storage Configuration ('local' for presentation deployment or 'r2' for persistent Cloudflare object storage)
  storageMode: (process.env.STORAGE_MODE || 'local').toLowerCase() as 'local' | 'r2',
  uploadDir: process.env.UPLOAD_DIR || path.resolve(process.cwd(), 'uploads'),

  // Cloudflare R2 Object Storage (Only required when STORAGE_MODE=r2)
  r2: {
    accountId: process.env.R2_ACCOUNT_ID || '',
    accessKeyId: process.env.R2_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY || '',
    bucketName: process.env.R2_BUCKET_NAME || '',
    publicUrl: process.env.R2_PUBLIC_URL || '',
  },

  // Secure Initial Administrator Credentials
  admin: {
    initialEmail: process.env.INITIAL_ADMIN_EMAIL || 'admin@nsl.gov.et',
    initialPassword: process.env.INITIAL_ADMIN_PASSWORD || 'change-me-in-production-123!',
  },

  // Seed data controls
  seedDemoData: process.env.SEED_DEMO_DATA === 'true' || (process.env.NODE_ENV !== 'production' && process.env.SEED_DEMO_DATA !== 'false'),

  corsOrigins: [
    'http://localhost:3000',
    'http://localhost:5173',
    'http://127.0.0.1:3000',
    'http://127.0.0.1:5173',
    'http://192.168.8.2:3000',
    process.env.FRONTEND_URL,
  ].filter(Boolean) as string[],
};
