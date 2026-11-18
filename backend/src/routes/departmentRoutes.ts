import { Router } from 'express';
import { departmentController } from '../controllers/departmentController.js';
import { requireAdmin } from '../middleware/authMiddleware.js';

const router = Router();

// Public: Anyone (citizens, QR scanners, admin) can read the list of active departments
router.get('/', departmentController.getDepartments);

// Protected: Only authenticated admins can create or delete departments
router.post('/', requireAdmin, departmentController.createDepartment);
router.delete('/:id', requireAdmin, departmentController.deleteDepartment);

export default router;
