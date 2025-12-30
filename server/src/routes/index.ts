import { Router, type IRouter } from 'express';
import { sendSuccess } from '../utils/api-response';
import authRoutes from './auth.routes';
import userRoutes from './user.routes';
import productRoutes from './product.routes';
import categoryRoutes from './category.routes';
import cartRoutes from './cart.routes';
import wishlistRoutes from './wishlist.routes';
import reviewRoutes from './review.routes';
import roomRoutes from './room.routes';
import recommendationRoutes from './recommendation.routes';
import orderRoutes from './order.routes';
import adminRoutes from './admin.routes';
import uploadRoutes from './upload.routes';

const router: IRouter = Router();

// Root API endpoint
router.get('/', (_req, res) => {
  sendSuccess(res, {
    name: 'LuxeNest API',
    version: '1.0.0',
    description: 'Premium Home Decor E-Commerce Platform API',
  }, 'Welcome to LuxeNest API');
});

// Auth routes
router.use('/auth', authRoutes);

// User routes
router.use('/users', userRoutes);

// Product routes
router.use('/products', productRoutes);

// Category routes
router.use('/categories', categoryRoutes);

// Cart routes
router.use('/cart', cartRoutes);

// Wishlist routes
router.use('/wishlist', wishlistRoutes);

// Review routes
router.use('/', reviewRoutes);

// Room routes
router.use('/rooms', roomRoutes);

// Recommendation routes
router.use('/', recommendationRoutes);

// Order routes
router.use('/orders', orderRoutes);

// Admin routes
router.use('/admin', adminRoutes);

// Upload routes
router.use('/upload', uploadRoutes);

// Placeholder routes - will be implemented in subsequent weeks
// router.use('/cart', cartRoutes);
// router.use('/wishlist', wishlistRoutes);
// router.use('/orders', orderRoutes);
// router.use('/reviews', reviewRoutes);
// router.use('/rooms', roomRoutes);
// router.use('/admin', adminRoutes);

export default router;

