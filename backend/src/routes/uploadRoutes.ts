import { Router } from 'express';
import { uploadController, uploadMiddleware } from '../controllers/uploadController.js';

const router = Router();

// Upload a single file
router.post('/', uploadMiddleware.single('file'), uploadController.uploadFile);

// Secure streaming download / preview of stored file by storageKey
router.get('/file/*', uploadController.getFile);

export default router;
