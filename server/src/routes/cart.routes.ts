import { Router, type IRouter } from 'express';
import {
  getCartController,
  addCartItemController,
  updateCartItemController,
  removeCartItemController,
  clearCartController,
} from '../controllers/cart.controller';
import { authenticate } from '../middleware/auth.middleware';
import { validate } from '../middleware/validate.middleware';
import {
  addCartItemSchema,
  updateCartItemSchema,
  productIdParamSchema,
} from '../validations/cart.validation';

const router: IRouter = Router();

// All cart routes require authentication
router.use(authenticate);

// Cart routes
router.get('/', getCartController);
router.post('/items', validate(addCartItemSchema), addCartItemController);
router.patch('/items/:productId', validate(productIdParamSchema), validate(updateCartItemSchema), updateCartItemController);
router.delete('/items/:productId', validate(productIdParamSchema), removeCartItemController);
router.delete('/', clearCartController);

export default router;

