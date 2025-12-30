import { Router, type IRouter } from 'express';
import { getRoomsController, getRoomByIdController } from '../controllers/room.controller';
import { validate } from '../middleware/validate.middleware';
import { cacheMiddlewares } from '../middleware/cache.middleware';
import { z } from 'zod';

const roomIdSchema = z.object({
  params: z.object({
    id: z.string().uuid('Invalid room ID'),
  }),
});

const router: IRouter = Router();

// Public routes with cache headers (medium cache with revalidation)
router.get('/', cacheMiddlewares.medium, getRoomsController);
router.get('/:id', cacheMiddlewares.medium, validate(roomIdSchema), getRoomByIdController);

export default router;

