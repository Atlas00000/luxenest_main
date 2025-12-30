import { Router, type IRouter } from 'express';
import {
  getWishlistController,
  addWishlistItemController,
  removeWishlistItemController,
  checkWishlistItemController,
} from '../controllers/wishlist.controller';
import { authenticate } from '../middleware/auth.middleware';
import { validate } from '../middleware/validate.middleware';
import { productIdParamSchema } from '../validations/wishlist.validation';

const router: IRouter = Router();

// All wishlist routes require authentication
router.use(authenticate);

// Wishlist routes
router.get('/', getWishlistController);
router.get('/items/:productId/check', validate(productIdParamSchema), checkWishlistItemController);
router.post('/items/:productId', validate(productIdParamSchema), addWishlistItemController);
router.delete('/items/:productId', validate(productIdParamSchema), removeWishlistItemController);

export default router;

