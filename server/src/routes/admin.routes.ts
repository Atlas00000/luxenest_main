import { Router, type IRouter } from 'express';
import {
  getAdminStatsController,
  getAdminOrdersController,
  getAdminUsersController,
  getAdminProductsController,
} from '../controllers/admin.controller';
import { authenticate, authorize } from '../middleware/auth.middleware';

const router: IRouter = Router();

// All admin routes require authentication and admin role
router.use(authenticate);
router.use(authorize('ADMIN'));

// Admin routes
router.get('/stats', getAdminStatsController);
router.get('/orders', getAdminOrdersController);
router.get('/users', getAdminUsersController);
router.get('/products', getAdminProductsController);

export default router;

