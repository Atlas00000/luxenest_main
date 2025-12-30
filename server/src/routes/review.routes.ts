import { Router, type IRouter } from 'express';
import {
  getProductReviewsController,
  createReviewController,
  markReviewHelpfulController,
  getUserReviewController,
} from '../controllers/review.controller';
import { authenticate } from '../middleware/auth.middleware';
import { validate } from '../middleware/validate.middleware';
import { cacheMiddlewares } from '../middleware/cache.middleware';
import {
  createReviewSchema,
  productIdParamSchema,
  reviewIdParamSchema,
  getReviewsQuerySchema,
} from '../validations/review.validation';

const router: IRouter = Router();

// Get reviews for a product (public) - short cache since reviews can change
router.get('/products/:id/reviews', cacheMiddlewares.short, validate(productIdParamSchema), validate(getReviewsQuerySchema), getProductReviewsController);

// Get user's review for a product (authenticated)
router.get('/products/:id/reviews/me', authenticate, validate(productIdParamSchema), getUserReviewController);

// Create review (authenticated)
router.post('/products/:id/reviews', authenticate, validate(productIdParamSchema), validate(createReviewSchema), createReviewController);

// Mark review as helpful (public, but can be authenticated later for tracking)
router.patch('/reviews/:id/helpful', validate(reviewIdParamSchema), markReviewHelpfulController);

export default router;

