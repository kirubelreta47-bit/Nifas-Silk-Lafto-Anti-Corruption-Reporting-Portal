import pg from 'pg';
import bcrypt from 'bcryptjs';
import { config } from '../config/index.js';
import {
  Report,
  CreateReportInput,
  FilterOptions,
  ReportStatus,
  ReportStats,
  AdminUser,
  EvidenceItem,
} from '../types/index.js';
import { INITIAL_SEED_REPORTS, DEMO_ADMIN_USER } from './seedData.js';

const { Pool } = pg;

let pool: pg.Pool | null = null;
let isConnectedToPostgres = false;

// Internal type for admin user with hashed password
export interface DbAdminUser extends AdminUser {
  passwordHash: string;
}

// In-memory fallback repository strictly for development/testing
let inMemoryReports: Report[] = [];
let inMemoryAdmin: DbAdminUser | null = null;

export const getPool = (): pg.Pool | null => {
  if (pool) return pool;
  if (!config.databaseUrl) return null;

  try {
    pool = new Pool({
      connectionString: config.databaseUrl,
      ssl: {
        rejectUnauthorized: false, // Required for Neon PostgreSQL
      },
      max: 10,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 5000,
    });

    pool.on('error', (err) => {
      console.error('[Database Pool Error]:', err.message);
    });

    return pool;
  } catch (err: any) {
    console.warn('[Database Pool Warning]:', err.message);
    return null;
  }
};

export const initDatabase = async (): Promise<boolean> => {
  // Production guard: fail fast if DATABASE_URL is missing
  if (!config.databaseUrl) {
    if (config.nodeEnv === 'production') {
      console.error('❌ [Database FATAL] DATABASE_URL is not set in production. Persistent storage is required.');
      isConnectedToPostgres = false;
      return false;
    }

    console.log('ℹ [Database] DATABASE_URL is not set. Running in local development test mode.');
    // Seed in-memory admin for dev using configured initial password
    inMemoryAdmin = {
      ...DEMO_ADMIN_USER,
      email: config.admin.initialEmail,
      passwordHash: bcrypt.hashSync(config.admin.initialPassword || 'change-me-in-production-123!', 10),
    };
    if (inMemoryReports.length === 0) {
      inMemoryReports = JSON.parse(JSON.stringify(INITIAL_SEED_REPORTS));
    }
    isConnectedToPostgres = false;
    return false;
  }

  const p = getPool();
  if (!p) return false;

  try {
    const client = await p.connect();
    try {
      console.log('🔄 [Database] Connecting to Neon PostgreSQL...');

      // 1. Idempotent Schema Creation
      await client.query(`
        CREATE TABLE IF NOT EXISTS admin_users (
          id SERIAL PRIMARY KEY,
          email VARCHAR(255) UNIQUE NOT NULL,
          password_hash VARCHAR(255) NOT NULL,
          name VARCHAR(255) NOT NULL,
          role VARCHAR(50) DEFAULT 'admin',
          created_at TIMESTAMPTZ DEFAULT NOW()
        );

        CREATE TABLE IF NOT EXISTS reports (
          id VARCHAR(50) PRIMARY KEY,
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

        CREATE INDEX IF NOT EXISTS idx_reports_status ON reports(status);
        CREATE INDEX IF NOT EXISTS idx_reports_type ON reports(type);
        CREATE INDEX IF NOT EXISTS idx_reports_created_at ON reports(created_at DESC);
        CREATE INDEX IF NOT EXISTS idx_evidence_report_id ON evidence(report_id);
      `);

      // 2. Safe Initial Admin Bootstrap & Sync
      const initialEmail = config.admin.initialEmail;
      const initialPassword = config.admin.initialPassword;

      if (initialPassword) {
        const hashedPassword = bcrypt.hashSync(initialPassword, 10);
        await client.query(
          `INSERT INTO admin_users (email, password_hash, name, role)
           VALUES ($1, $2, $3, $4)
           ON CONFLICT (email) DO UPDATE SET password_hash = EXCLUDED.password_hash`,
          [initialEmail, hashedPassword, 'Lead Ethics Officer', 'admin']
        );
        console.log(`🔐 [Security] Administrator account synced for ${initialEmail}.`);
      }

      // 3. Demo Data Seeding (Only if explicitly enabled or in development when table is empty)
      const reportsCountRes = await client.query('SELECT COUNT(*) FROM reports');
      const reportsCount = parseInt(reportsCountRes.rows[0].count, 10);

      if (reportsCount === 0 && config.seedDemoData) {
        console.log('🌱 [Database] Seeding initial sub-city demonstration records into Neon PostgreSQL...');
        for (const rep of INITIAL_SEED_REPORTS) {
          await client.query(
            `INSERT INTO reports 
              (id, type, office, person_involved, incident_date, location, description, is_anonymous, reporter_name, reporter_phone, status, admin_notes, seen, urgent, created_at)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)`,
            [
              rep.id,
              rep.type,
              rep.office,
              rep.personInvolved || null,
              rep.incidentDate,
              rep.location,
              rep.description,
              rep.isAnonymous,
              rep.reporterName || null,
              rep.reporterPhone || null,
              rep.status,
              rep.adminNotes || '',
              rep.seen,
              rep.urgent || false,
              rep.createdAt,
            ]
          );

          for (const ev of rep.evidence) {
            await client.query(
              `INSERT INTO evidence (id, report_id, name, type, size, storage_key, storage_provider, url, created_at)
               VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
              [ev.id, rep.id, ev.name, ev.type, ev.size, `seed/${ev.id}`, 'r2', ev.dataUrl, rep.createdAt]
            );
          }

          for (const log of rep.log) {
            await client.query(
              `INSERT INTO decision_logs (id, report_id, action, from_status, to_status, note, admin_email, timestamp)
               VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
              [
                log.id,
                rep.id,
                log.action,
                log.fromStatus || null,
                log.toStatus || null,
                log.note || null,
                log.adminEmail,
                log.timestamp,
              ]
            );
          }
        }
      }

      console.log('✅ [Database] Neon PostgreSQL connected and initialized successfully.');
      isConnectedToPostgres = true;
      return true;
    } finally {
      client.release();
    }
  } catch (err: any) {
    console.error('❌ [Database Connection Failed]:', err.message);
    if (config.nodeEnv === 'production') {
      console.error('❌ [Database Production Abort]: Cannot operate in production without PostgreSQL connection.');
    }
    isConnectedToPostgres = false;
    return false;
  }
};

export const getDatabaseStatus = (): { connected: boolean; engine: string } => {
  return {
    connected: isConnectedToPostgres,
    engine: isConnectedToPostgres ? 'Neon PostgreSQL' : config.nodeEnv === 'production' ? 'Disconnected (Error)' : 'In-Memory Fallback (Dev)',
  };
};

// ==========================================
// REPOSITORY LAYER (Strict Production Guards)
// ==========================================

export const db = {
  _setConnectedForTesting(val: boolean) {
    isConnectedToPostgres = val;
  },
  // Admin Lookup by Email
  async getAdminByEmail(email: string): Promise<DbAdminUser | null> {
    if (isConnectedToPostgres && pool) {
      const res = await pool.query('SELECT * FROM admin_users WHERE email = $1', [email]);
      if (res.rows.length === 0) return null;
      const row = res.rows[0];
      return {
        id: row.id,
        email: row.email,
        name: row.name,
        role: row.role,
        passwordHash: row.password_hash,
      };
    }

    if (config.nodeEnv === 'production') {
      throw new Error('Database unavailable: Persistent database connection required.');
    }

    if (inMemoryAdmin && inMemoryAdmin.email.toLowerCase() === email.toLowerCase()) {
      return inMemoryAdmin;
    }
    return null;
  },

  // 1. Fetch Reports
  async getReports(options: FilterOptions = {}): Promise<Report[]> {
    if (isConnectedToPostgres && pool) {
      let query = `
        SELECT r.*, 
          COALESCE(json_agg(DISTINCT e.*) FILTER (WHERE e.id IS NOT NULL), '[]') as evidence,
          COALESCE(json_agg(DISTINCT l.*) FILTER (WHERE l.id IS NOT NULL), '[]') as log
        FROM reports r
        LEFT JOIN evidence e ON r.id = e.report_id
        LEFT JOIN decision_logs l ON r.id = l.report_id
        WHERE 1=1
      `;
      const params: any[] = [];
      let pIndex = 1;

      if (options.status && options.status !== 'all') {
        query += ` AND r.status = $${pIndex++}`;
        params.push(options.status);
      }
      if (options.type && options.type !== 'all') {
        query += ` AND r.type = $${pIndex++}`;
        params.push(options.type);
      }
      if (options.office && options.office !== 'all') {
        query += ` AND r.office ILIKE $${pIndex++}`;
        params.push(`%${options.office}%`);
      }
      if (options.anonymousOnly) {
        query += ` AND r.is_anonymous = true`;
      }
      if (options.dateFrom) {
        query += ` AND r.incident_date >= $${pIndex++}`;
        params.push(options.dateFrom);
      }
      if (options.dateTo) {
        query += ` AND r.incident_date <= $${pIndex++}`;
        params.push(options.dateTo);
      }
      if (options.search) {
        query += ` AND (
          r.id ILIKE $${pIndex} OR 
          r.location ILIKE $${pIndex} OR 
          r.description ILIKE $${pIndex} OR 
          r.office ILIKE $${pIndex}
        )`;
        params.push(`%${options.search}%`);
        pIndex++;
      }

      query += ` GROUP BY r.id ORDER BY r.created_at DESC`;

      const res = await pool.query(query, params);
      return res.rows.map((row) => ({
        id: row.id,
        type: row.type,
        office: row.office,
        personInvolved: row.person_involved,
        incidentDate: row.incident_date instanceof Date ? row.incident_date.toISOString().split('T')[0] : String(row.incident_date),
        location: row.location,
        description: row.description,
        isAnonymous: row.is_anonymous,
        reporterName: row.reporter_name,
        reporterPhone: row.reporter_phone,
        status: row.status,
        adminNotes: row.admin_notes || '',
        seen: row.seen,
        urgent: row.urgent,
        createdAt: new Date(row.created_at).toISOString(),
        evidence: Array.isArray(row.evidence) ? row.evidence.map((ev: any) => ({
          id: ev.id,
          name: ev.name,
          type: ev.type,
          size: ev.size,
          dataUrl: ev.url || ev.data_url,
        })) : [],
        log: Array.isArray(row.log) ? row.log.map((lg: any) => ({
          id: lg.id,
          action: lg.action,
          fromStatus: lg.from_status,
          toStatus: lg.to_status,
          note: lg.note,
          adminEmail: lg.admin_email,
          timestamp: new Date(lg.timestamp).toISOString(),
        })) : [],
      }));
    }

    // Strict Production Check: NEVER return fake data or silent fallback in production
    if (config.nodeEnv === 'production') {
      throw new Error('Database unavailable: Cannot fetch reports without active Neon PostgreSQL connection.');
    }

    // Local Development/Testing Fallback
    return inMemoryReports.filter((r) => {
      if (options.status && options.status !== 'all' && r.status !== options.status) return false;
      if (options.type && options.type !== 'all' && r.type !== options.type) return false;
      if (options.office && options.office !== 'all' && !r.office.toLowerCase().includes(options.office.toLowerCase())) return false;
      if (options.anonymousOnly && !r.isAnonymous) return false;
      if (options.dateFrom && r.incidentDate < options.dateFrom) return false;
      if (options.dateTo && r.incidentDate > options.dateTo) return false;
      if (options.search) {
        const q = options.search.toLowerCase();
        const match =
          r.id.toLowerCase().includes(q) ||
          r.location.toLowerCase().includes(q) ||
          r.description.toLowerCase().includes(q) ||
          r.office.toLowerCase().includes(q);
        if (!match) return false;
      }
      return true;
    });
  },

  // 2. Fetch Single Report by ID
  async getReportById(id: string): Promise<Report | null> {
    if (isConnectedToPostgres && pool) {
      const query = `
        SELECT r.*, 
          COALESCE(json_agg(DISTINCT e.*) FILTER (WHERE e.id IS NOT NULL), '[]') as evidence,
          COALESCE(json_agg(DISTINCT l.*) FILTER (WHERE l.id IS NOT NULL), '[]') as log
        FROM reports r
        LEFT JOIN evidence e ON r.id = e.report_id
        LEFT JOIN decision_logs l ON r.id = l.report_id
        WHERE r.id = $1
        GROUP BY r.id
      `;
      const res = await pool.query(query, [id]);
      if (res.rows.length === 0) return null;
      const row = res.rows[0];
      return {
        id: row.id,
        type: row.type,
        office: row.office,
        personInvolved: row.person_involved,
        incidentDate: row.incident_date instanceof Date ? row.incident_date.toISOString().split('T')[0] : String(row.incident_date),
        location: row.location,
        description: row.description,
        isAnonymous: row.is_anonymous,
        reporterName: row.reporter_name,
        reporterPhone: row.reporter_phone,
        status: row.status,
        adminNotes: row.admin_notes || '',
        seen: row.seen,
        urgent: row.urgent,
        createdAt: new Date(row.created_at).toISOString(),
        evidence: Array.isArray(row.evidence) ? row.evidence.map((ev: any) => ({
          id: ev.id,
          name: ev.name,
          type: ev.type,
          size: ev.size,
          dataUrl: ev.url || ev.data_url,
        })) : [],
        log: Array.isArray(row.log) ? row.log.map((lg: any) => ({
          id: lg.id,
          action: lg.action,
          fromStatus: lg.from_status,
          toStatus: lg.to_status,
          note: lg.note,
          adminEmail: lg.admin_email,
          timestamp: new Date(lg.timestamp).toISOString(),
        })) : [],
      };
    }

    if (config.nodeEnv === 'production') {
      throw new Error('Database unavailable: Cannot retrieve report without active Neon PostgreSQL connection.');
    }

    return inMemoryReports.find((r) => r.id === id) || null;
  },

  // 3. Create Report (Strictly rejects in production if DB is not connected)
  async createReport(input: CreateReportInput): Promise<Report> {
    const year = new Date().getFullYear();
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const newId = `NSL-${year}-${randomSuffix}`;
    const nowIso = new Date().toISOString();

    const newReport: Report = {
      id: newId,
      type: input.type,
      office: input.office,
      personInvolved: input.personInvolved,
      incidentDate: input.incidentDate,
      location: input.location,
      description: input.description,
      isAnonymous: input.isAnonymous,
      reporterName: input.isAnonymous ? undefined : input.reporterName,
      reporterPhone: input.isAnonymous ? undefined : input.reporterPhone,
      evidence: input.evidence || [],
      status: 'new',
      adminNotes: '',
      seen: false,
      urgent: false,
      createdAt: nowIso,
      log: [
        {
          id: `log-${Date.now()}`,
          action: 'created',
          adminEmail: 'citizen',
          timestamp: nowIso,
          note: 'Submitted via citizen reporting portal',
        },
      ],
    };

    if (isConnectedToPostgres && pool) {
      await pool.query(
        `INSERT INTO reports 
          (id, type, office, person_involved, incident_date, location, description, is_anonymous, reporter_name, reporter_phone, status, admin_notes, seen, urgent, created_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)`,
        [
          newReport.id,
          newReport.type,
          newReport.office,
          newReport.personInvolved || null,
          newReport.incidentDate,
          newReport.location,
          newReport.description,
          newReport.isAnonymous,
          newReport.reporterName || null,
          newReport.reporterPhone || null,
          newReport.status,
          newReport.adminNotes || '',
          newReport.seen,
          newReport.urgent,
          newReport.createdAt,
        ]
      );

      // Store evidence references (metadata and storage URLs) in Neon
      for (const ev of newReport.evidence) {
        const storageKey = (ev as any).storageKey || `files/${ev.id}-${ev.name}`;
        const storageProvider = (ev as any).storageProvider || (config.storageMode === 'local' ? 'local' : 'r2');
        await pool.query(
          `INSERT INTO evidence (id, report_id, name, type, size, storage_key, storage_provider, url, created_at)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
          [ev.id, newReport.id, ev.name, ev.type, ev.size, storageKey, storageProvider, ev.dataUrl, newReport.createdAt]
        );
      }

      const initialLog = newReport.log[0];
      await pool.query(
        `INSERT INTO decision_logs (id, report_id, action, note, admin_email, timestamp)
         VALUES ($1, $2, $3, $4, $5, $6)`,
        [initialLog.id, newReport.id, initialLog.action, initialLog.note, initialLog.adminEmail, initialLog.timestamp]
      );

      return newReport;
    }

    // Production guard: MUST FAIL clearly
    if (config.nodeEnv === 'production') {
      throw new Error('Database unavailable: Cannot submit report. Persistent Neon PostgreSQL connection is required in production.');
    }

    // Local Development/Testing Fallback
    inMemoryReports.unshift(newReport);
    return newReport;
  },

  // 4. Update Status
  async updateReportStatus(
    id: string,
    status: ReportStatus,
    note: string = '',
    adminEmail: string = 'admin@nsl.gov.et'
  ): Promise<Report | null> {
    if (config.nodeEnv === 'production' && !isConnectedToPostgres) {
      throw new Error('Database unavailable: Persistent connection required.');
    }

    const report = await db.getReportById(id);
    if (!report) return null;

    const logItem = {
      id: `log-${Date.now()}`,
      action: 'status_change' as const,
      fromStatus: report.status,
      toStatus: status,
      note: note.trim() || undefined,
      adminEmail,
      timestamp: new Date().toISOString(),
    };

    if (isConnectedToPostgres && pool) {
      await pool.query(
        `UPDATE reports SET status = $1, seen = true, updated_at = NOW() WHERE id = $2`,
        [status, id]
      );
      await pool.query(
        `INSERT INTO decision_logs (id, report_id, action, from_status, to_status, note, admin_email, timestamp)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
        [logItem.id, id, logItem.action, logItem.fromStatus, logItem.toStatus, logItem.note || null, logItem.adminEmail, logItem.timestamp]
      );
    }

    const memIdx = inMemoryReports.findIndex((r) => r.id === id);
    if (memIdx !== -1) {
      inMemoryReports[memIdx] = {
        ...inMemoryReports[memIdx],
        status,
        seen: true,
        log: [logItem, ...inMemoryReports[memIdx].log],
      };
      return inMemoryReports[memIdx];
    }

    return { ...report, status, seen: true, log: [logItem, ...report.log] };
  },

  // 5. Update Notes
  async updateReportNotes(
    id: string,
    notes: string,
    adminEmail: string = 'admin@nsl.gov.et'
  ): Promise<Report | null> {
    if (config.nodeEnv === 'production' && !isConnectedToPostgres) {
      throw new Error('Database unavailable: Persistent connection required.');
    }

    const report = await db.getReportById(id);
    if (!report) return null;

    const logItem = {
      id: `log-${Date.now()}`,
      action: 'note_added' as const,
      note: notes.trim(),
      adminEmail,
      timestamp: new Date().toISOString(),
    };

    if (isConnectedToPostgres && pool) {
      await pool.query(
        `UPDATE reports SET admin_notes = $1, seen = true, updated_at = NOW() WHERE id = $2`,
        [notes, id]
      );
      await pool.query(
        `INSERT INTO decision_logs (id, report_id, action, note, admin_email, timestamp)
         VALUES ($1, $2, $3, $4, $5, $6)`,
        [logItem.id, id, logItem.action, logItem.note, logItem.adminEmail, logItem.timestamp]
      );
    }

    const memIdx = inMemoryReports.findIndex((r) => r.id === id);
    if (memIdx !== -1) {
      inMemoryReports[memIdx] = {
        ...inMemoryReports[memIdx],
        adminNotes: notes,
        seen: true,
        log: [logItem, ...inMemoryReports[memIdx].log],
      };
      return inMemoryReports[memIdx];
    }

    return { ...report, adminNotes: notes, seen: true, log: [logItem, ...report.log] };
  },

  // 6. Toggle Urgent
  async toggleUrgent(id: string): Promise<Report | null> {
    if (config.nodeEnv === 'production' && !isConnectedToPostgres) {
      throw new Error('Database unavailable: Persistent connection required.');
    }

    const report = await db.getReportById(id);
    if (!report) return null;
    const nextUrgent = !report.urgent;

    if (isConnectedToPostgres && pool) {
      await pool.query(`UPDATE reports SET urgent = $1 WHERE id = $2`, [nextUrgent, id]);
    }

    const memIdx = inMemoryReports.findIndex((r) => r.id === id);
    if (memIdx !== -1) {
      inMemoryReports[memIdx].urgent = nextUrgent;
      return inMemoryReports[memIdx];
    }
    return { ...report, urgent: nextUrgent };
  },

  // 7. Mark As Seen
  async markAsSeen(id: string, adminEmail: string = 'admin@nsl.gov.et'): Promise<Report | null> {
    if (config.nodeEnv === 'production' && !isConnectedToPostgres) {
      throw new Error('Database unavailable: Persistent connection required.');
    }

    const report = await db.getReportById(id);
    if (!report || report.seen) return report;

    const logItem = {
      id: `log-${Date.now()}`,
      action: 'marked_seen' as const,
      adminEmail,
      timestamp: new Date().toISOString(),
    };

    if (isConnectedToPostgres && pool) {
      await pool.query(`UPDATE reports SET seen = true WHERE id = $1`, [id]);
      await pool.query(
        `INSERT INTO decision_logs (id, report_id, action, admin_email, timestamp)
         VALUES ($1, $2, $3, $4, $5)`,
        [logItem.id, id, logItem.action, logItem.adminEmail, logItem.timestamp]
      );
    }

    const memIdx = inMemoryReports.findIndex((r) => r.id === id);
    if (memIdx !== -1) {
      inMemoryReports[memIdx].seen = true;
      inMemoryReports[memIdx].log = [logItem, ...inMemoryReports[memIdx].log];
      return inMemoryReports[memIdx];
    }
    return { ...report, seen: true, log: [logItem, ...report.log] };
  },

  // 8. Stats for Dashboard
  async getReportStats(daysRange: 7 | 30 | 90 = 30): Promise<ReportStats> {
    const allReports = await db.getReports();

    const total = allReports.length;
    const newCount = allReports.filter((r) => r.status === 'new').length;
    const underReview = allReports.filter((r) => r.status === 'under_review').length;
    const investigating = allReports.filter((r) => r.status === 'investigating').length;
    const resolved = allReports.filter((r) => r.status === 'resolved').length;
    const rejected = allReports.filter((r) => r.status === 'rejected').length;
    const anonymous = allReports.filter((r) => r.isAnonymous).length;
    const urgent = allReports.filter((r) => r.urgent).length;

    const typeCounts: Record<string, number> = {};
    allReports.forEach((r) => {
      typeCounts[r.type] = (typeCounts[r.type] || 0) + 1;
    });
    const typeBreakdown = Object.entries(typeCounts).map(([type, count]) => ({
      type: type as any,
      count,
    }));

    const officeCounts: Record<string, number> = {};
    allReports.forEach((r) => {
      officeCounts[r.office] = (officeCounts[r.office] || 0) + 1;
    });
    const officeBreakdown = Object.entries(officeCounts)
      .map(([office, count]) => ({ office, count }))
      .sort((a, b) => b.count - a.count);

    const timelineMap: Record<string, number> = {};
    for (let i = daysRange - 1; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const str = d.toISOString().split('T')[0];
      timelineMap[str] = 0;
    }

    allReports.forEach((r) => {
      const d = r.incidentDate || r.createdAt.split('T')[0];
      if (timelineMap[d] !== undefined) {
        timelineMap[d]++;
      }
    });

    const timeline = Object.entries(timelineMap).map(([date, count]) => ({ date, count }));

    return {
      total,
      new: newCount,
      underReview,
      investigating,
      resolved,
      rejected,
      anonymous,
      urgent,
      typeBreakdown,
      officeBreakdown,
      timeline,
    };
  },
};
