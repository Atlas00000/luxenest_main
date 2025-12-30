import { Router, type IRouter } from 'express';
import { uploadSingle, uploadMultiple } from '../controllers/upload.controller';
import { authenticate, authorize } from '../middleware/auth.middleware';

const router: IRouter = Router();

// All upload routes require authentication and admin role
router.use(authenticate);
router.use(authorize('ADMIN'));

// Upload routes
router.post('/single', uploadSingle);
router.post('/multiple', uploadMultiple);

export default router;

