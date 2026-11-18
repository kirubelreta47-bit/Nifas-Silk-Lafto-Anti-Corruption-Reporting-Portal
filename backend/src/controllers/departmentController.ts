import { Request, Response } from 'express';
import { db } from '../db/index.js';
import { CreateDepartmentInput } from '../types/index.js';

export const departmentController = {
  // GET /api/departments
  getDepartments: async (_req: Request, res: Response) => {
    try {
      const departments = await db.getDepartments();
      return res.json({ success: true, count: departments.length, data: departments });
    } catch (err: any) {
      console.error('getDepartments error:', err.message);
      return res.status(500).json({ error: err.message || 'Failed to fetch departments' });
    }
  },

  // POST /api/departments (Admin Only)
  createDepartment: async (req: Request, res: Response) => {
    try {
      const body: CreateDepartmentInput = req.body;

      if (!body.nameEn || !body.nameEn.trim()) {
        return res.status(400).json({ error: 'English department name is required' });
      }
      if (!body.nameAm || !body.nameAm.trim()) {
        return res.status(400).json({ error: 'Amharic department name is required' });
      }

      const created = await db.createDepartment({
        id: body.id?.trim() || undefined,
        code: body.code?.trim() || undefined,
        nameAm: body.nameAm.trim(),
        nameEn: body.nameEn.trim(),
        descriptionAm: body.descriptionAm?.trim() || undefined,
        descriptionEn: body.descriptionEn?.trim() || undefined,
      });

      return res.status(201).json({ success: true, data: created });
    } catch (err: any) {
      console.error('createDepartment error:', err.message);
      return res.status(500).json({ error: err.message || 'Failed to create department' });
    }
  },

  // DELETE /api/departments/:id (Admin Only)
  deleteDepartment: async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const success = await db.deleteDepartment(id);
      if (!success) {
        return res.status(404).json({ error: 'Custom department not found or is a protected standard bureau' });
      }
      return res.json({ success: true, message: 'Department deleted successfully' });
    } catch (err: any) {
      console.error('deleteDepartment error:', err.message);
      return res.status(500).json({ error: err.message || 'Failed to delete department' });
    }
  },
};
