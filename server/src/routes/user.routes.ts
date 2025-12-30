import { Router, type IRouter } from 'express';
import {
  getCurrentUser,
  updateProfileController,
  changePasswordController,
} from '../controllers/user.controller';
import { authenticate } from '../middleware/auth.middleware';
import { validate } from '../middleware/validate.middleware';
import {
  updateProfileSchema,
  changePasswordSchema,
} from '../validations/auth.validation';

const router: IRouter = Router();

// All user routes require authentication
router.use(authenticate);

// Get current user profile
router.get('/me', getCurrentUser);

// Update user profile
router.patch('/me', validate(updateProfileSchema), updateProfileController);

// Change password
router.patch('/me/password', validate(changePasswordSchema), changePasswordController);

export default router;

