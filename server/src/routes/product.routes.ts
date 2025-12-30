import { Router, type IRouter } from 'express';
import {
  getProductsController,
  getProductByIdController,
  createProductController,
  updateProductController,
  deleteProductController,
  getFeaturedProductsController,
  getNewProductsController,
  getSaleProductsController,
} from '../controllers/product.controller';
import { authenticate, authorize } from '../middleware/auth.middleware';
import { validate } from '../middleware/validate.middleware';
import { cacheMiddlewares } from '../middleware/cache.middleware';
import {
  getProductsQuerySchema,
  createProductSchema,
  updateProductSchema,
  productIdSchema,
} from '../validations/product.validation';

const router: IRouter = Router();

// Public routes with cache headers (medium cache with revalidation)
router.get('/', cacheMiddlewares.medium, validate(getProductsQuerySchema), getProductsController);
router.get('/featured', cacheMiddlewares.medium, getFeaturedProductsController);
router.get('/new', cacheMiddlewares.medium, getNewProductsController);
router.get('/sale', cacheMiddlewares.medium, getSaleProductsController);
router.get('/:id', cacheMiddlewares.medium, validate(productIdSchema), getProductByIdController);

// Admin routes (require authentication and admin role)
router.post('/', authenticate, authorize('ADMIN'), validate(createProductSchema), createProductController);
router.patch('/:id', authenticate, authorize('ADMIN'), validate(productIdSchema), validate(updateProductSchema), updateProductController);
router.delete('/:id', authenticate, authorize('ADMIN'), validate(productIdSchema), deleteProductController);

export default router;

