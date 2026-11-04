import { Router } from 'express';
import { reportController } from '../controllers/reportController.js';
import { requireAdmin } from '../middleware/authMiddleware.js';

const router = Router();

// Public: Citizen submits corruption report
router.post('/', reportController.createReport);

// Protected: Admin case management & dashboard metrics
router.get('/', reportController.getReports);
router.get('/stats', reportController.getStats);
router.get('/:id', reportController.getReportById);

// Protected actions: Status updates, internal notes, urgent priority toggle
router.patch('/:id/status', requireAdmin as any, reportController.updateStatus);
router.patch('/:id/notes', requireAdmin as any, reportController.updateNotes);
router.patch('/:id/urgent', requireAdmin as any, reportController.toggleUrgent);

export default router;
