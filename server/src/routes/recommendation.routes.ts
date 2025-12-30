import { Router, type IRouter } from 'express';
import {
  getProductRecommendationsController,
  getUserRecommendationsController,
  getTrendingProductsController,
} from '../controllers/recommendation.controller';
import { authenticate } from '../middleware/auth.middleware';
import { validate } from '../middleware/validate.middleware';
import { z } from 'zod';

const productIdSchema = z.object({
  params: z.object({
    id: z.string().uuid('Invalid product ID'),
  }),
});

const router: IRouter = Router();

// Public routes
router.get('/products/:id/recommendations', validate(productIdSchema), getProductRecommendationsController);
router.get('/trending', getTrendingProductsController);

// Authenticated routes
router.get('/user/recommendations', authenticate, getUserRecommendationsController);

export default router;

