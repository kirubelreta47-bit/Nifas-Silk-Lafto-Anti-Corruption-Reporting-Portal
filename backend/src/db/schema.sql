-- Nifas Silk-Lafto Anti-Corruption Portal Database Schema for Neon PostgreSQL

-- 1. Admin Users Table
CREATE TABLE IF NOT EXISTS admin_users (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  name VARCHAR(255) NOT NULL,
  role VARCHAR(50) DEFAULT 'admin',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Corruption Reports Table
CREATE TABLE IF NOT EXISTS reports (
  id VARCHAR(50) PRIMARY KEY, -- e.g. 'NSL-2026-0012'
  type VARCHAR(50) NOT NULL,
  office VARCHAR(255) NOT NULL,
  person_involved VARCHAR(255),
  incident_date DATE NOT NULL,
  location TEXT NOT NULL,
  description TEXT NOT NULL,
  is_anonymous BOOLEAN NOT NULL DEFAULT true,
  reporter_name VARCHAR(255),
  reporter_phone VARCHAR(50),
  status VARCHAR(50) NOT NULL DEFAULT 'new',
  admin_notes TEXT DEFAULT '',
  seen BOOLEAN DEFAULT false,
  urgent BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Evidence Items Table (References Cloudflare R2 object storage)
CREATE TABLE IF NOT EXISTS evidence (
  id VARCHAR(100) PRIMARY KEY,
  report_id VARCHAR(50) REFERENCES reports(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  type VARCHAR(100) NOT NULL,
  size INTEGER NOT NULL,
  storage_key VARCHAR(500) NOT NULL,
  storage_provider VARCHAR(50) DEFAULT 'r2',
  url TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Decision and Audit Log Table
CREATE TABLE IF NOT EXISTS decision_logs (
  id VARCHAR(100) PRIMARY KEY,
  report_id VARCHAR(50) REFERENCES reports(id) ON DELETE CASCADE,
  action VARCHAR(50) NOT NULL,
  from_status VARCHAR(50),
  to_status VARCHAR(50),
  note TEXT,
  admin_email VARCHAR(255) NOT NULL,
  timestamp TIMESTAMPTZ DEFAULT NOW()
);

-- Create performance indexes for common admin dashboard queries
CREATE INDEX IF NOT EXISTS idx_reports_status ON reports(status);
CREATE INDEX IF NOT EXISTS idx_reports_type ON reports(type);
CREATE INDEX IF NOT EXISTS idx_reports_created_at ON reports(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_evidence_report_id ON evidence(report_id);
CREATE INDEX IF NOT EXISTS idx_decision_logs_report_id ON decision_logs(report_id);

