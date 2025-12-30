import { Router, type IRouter } from 'express';
import {
  createOrderController,
  getUserOrdersController,
  getOrderByIdController,
  updateOrderStatusController,
} from '../controllers/order.controller';
import { authenticate, authorize } from '../middleware/auth.middleware';
import { validate } from '../middleware/validate.middleware';
import {
  createOrderSchema,
  updateOrderStatusSchema,
  orderIdParamSchema,
  getOrdersQuerySchema,
} from '../validations/order.validation';

const router: IRouter = Router();

// All order routes require authentication
router.use(authenticate);

// Order routes
router.post('/', validate(createOrderSchema), createOrderController);
router.get('/', validate(getOrdersQuerySchema), getUserOrdersController);
router.get('/:id', validate(orderIdParamSchema), getOrderByIdController);

// Admin routes
router.patch('/:id/status', authorize('ADMIN'), validate(orderIdParamSchema), validate(updateOrderStatusSchema), updateOrderStatusController);

export default router;

