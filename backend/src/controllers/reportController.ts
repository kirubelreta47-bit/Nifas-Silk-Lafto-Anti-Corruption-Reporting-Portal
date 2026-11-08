import { Request, Response } from 'express';
import { db } from '../db/index.js';
import { CreateReportInput, FilterOptions, ReportStatus } from '../types/index.js';

export const reportController = {
  // GET /api/reports
  getReports: async (req: Request, res: Response) => {
    try {
      const options: FilterOptions = {
        status: req.query.status as string,
        type: req.query.type as string,
        office: req.query.office as string,
        search: req.query.search as string,
        anonymousOnly: req.query.anonymousOnly === 'true',
        dateFrom: req.query.dateFrom as string,
        dateTo: req.query.dateTo as string,
      };

      const reports = await db.getReports(options);
      return res.json({ success: true, count: reports.length, data: reports });
    } catch (err: any) {
      console.error('getReports error:', err.message);
      const isDbErr = err.message?.includes('Database unavailable');
      return res.status(isDbErr ? 503 : 500).json({ error: err.message || 'Failed to fetch reports' });
    }
  },

  // GET /api/reports/stats
  getStats: async (req: Request, res: Response) => {
    try {
      const days = parseInt(req.query.days as string, 10);
      const daysRange = days === 7 || days === 90 ? days : 30;
      const stats = await db.getReportStats(daysRange);
      return res.json({ success: true, data: stats });
    } catch (err: any) {
      console.error('getStats error:', err.message);
      const isDbErr = err.message?.includes('Database unavailable');
      return res.status(isDbErr ? 503 : 500).json({ error: err.message || 'Failed to compute stats' });
    }
  },

  // GET /api/reports/:id
  getReportById: async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const report = await db.getReportById(id);
      if (!report) {
        return res.status(404).json({ error: 'Report not found' });
      }

      // Automatically mark as seen if it's currently unread
      if (!report.seen) {
        await db.markAsSeen(id);
        report.seen = true;
      }

      return res.json({ success: true, data: report });
    } catch (err: any) {
      console.error('getReportById error:', err.message);
      const isDbErr = err.message?.includes('Database unavailable');
      return res.status(isDbErr ? 503 : 500).json({ error: err.message || 'Failed to retrieve report' });
    }
  },

  // POST /api/reports (Citizen report submission)
  createReport: async (req: Request, res: Response) => {
    try {
      const body = req.body as CreateReportInput;

      // Anti-bot Honeypot check
      if (body.honeypot && body.honeypot.trim() !== '') {
        return res.status(400).json({ error: 'errorBotDetected' });
      }

      // Mandatory validation
      if (!body.type || !body.office || !body.incidentDate || !body.location || !body.description) {
        return res.status(400).json({ error: 'errorRequiredField' });
      }

      if (body.description.trim().length < 30) {
        return res.status(400).json({ error: 'errorDescTooShort' });
      }

      const created = await db.createReport(body);
      return res.status(201).json({ success: true, data: created });
    } catch (err: any) {
      console.error('createReport error:', err.message);
      const isDbErr = err.message?.includes('Database unavailable');
      return res.status(isDbErr ? 503 : 500).json({
        error: isDbErr
          ? 'Database connection unavailable: Cannot save report to persistent storage. Please try again shortly.'
          : err.message || 'Failed to submit report',
      });
    }
  },

  // PATCH /api/reports/:id/status
  updateStatus: async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const { status, note, adminEmail } = req.body;

      if (!status) {
        return res.status(400).json({ error: 'Status is required' });
      }

      const updated = await db.updateReportStatus(
        id,
        status as ReportStatus,
        note || '',
        adminEmail || (req as any).user?.email || 'admin@nsl.gov.et'
      );

      if (!updated) {
        return res.status(404).json({ error: 'Report not found' });
      }

      return res.json({ success: true, data: updated });
    } catch (err: any) {
      console.error('updateStatus error:', err.message);
      const isDbErr = err.message?.includes('Database unavailable');
      return res.status(isDbErr ? 503 : 500).json({ error: err.message || 'Failed to update report status' });
    }
  },

  // PATCH /api/reports/:id/notes
  updateNotes: async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const { notes, adminEmail } = req.body;

      const updated = await db.updateReportNotes(
        id,
        notes || '',
        adminEmail || (req as any).user?.email || 'admin@nsl.gov.et'
      );

      if (!updated) {
        return res.status(404).json({ error: 'Report not found' });
      }

      return res.json({ success: true, data: updated });
    } catch (err: any) {
      console.error('updateNotes error:', err.message);
      const isDbErr = err.message?.includes('Database unavailable');
      return res.status(isDbErr ? 503 : 500).json({ error: err.message || 'Failed to update notes' });
    }
  },

  // PATCH /api/reports/:id/urgent
  toggleUrgent: async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const updated = await db.toggleUrgent(id);
      if (!updated) {
        return res.status(404).json({ error: 'Report not found' });
      }
      return res.json({ success: true, data: updated });
    } catch (err: any) {
      console.error('toggleUrgent error:', err.message);
      const isDbErr = err.message?.includes('Database unavailable');
      return res.status(isDbErr ? 503 : 500).json({ error: err.message || 'Failed to toggle urgent flag' });
    }
  },
};
