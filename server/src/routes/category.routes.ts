import { Router, type IRouter } from 'express';
import {
  getCategoriesController,
  getCategoryByIdController,
  getCategoryBySlugController,
  createCategoryController,
  updateCategoryController,
  deleteCategoryController,
} from '../controllers/category.controller';
import { authenticate, authorize } from '../middleware/auth.middleware';
import { validate } from '../middleware/validate.middleware';
import { cacheMiddlewares } from '../middleware/cache.middleware';
import {
  createCategorySchema,
  updateCategorySchema,
  categoryIdSchema,
  categorySlugSchema,
} from '../validations/category.validation';

const router: IRouter = Router();

// Public routes with cache headers (medium cache with revalidation)
router.get('/', cacheMiddlewares.medium, getCategoriesController);
router.get('/slug/:slug', cacheMiddlewares.medium, validate(categorySlugSchema), getCategoryBySlugController);
router.get('/:id', cacheMiddlewares.medium, validate(categoryIdSchema), getCategoryByIdController);

// Admin routes (require authentication and admin role)
router.post('/', authenticate, authorize('ADMIN'), validate(createCategorySchema), createCategoryController);
router.patch('/:id', authenticate, authorize('ADMIN'), validate(categoryIdSchema), validate(updateCategorySchema), updateCategoryController);
router.delete('/:id', authenticate, authorize('ADMIN'), validate(categoryIdSchema), deleteCategoryController);

export default router;

