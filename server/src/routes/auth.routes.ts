import { Router, type IRouter } from 'express';
import {
  registerController,
  loginController,
  logoutController,
  refreshTokenController,
} from '../controllers/auth.controller';
import { authenticate } from '../middleware/auth.middleware';
import { validate } from '../middleware/validate.middleware';
import {
  registerSchema,
  loginSchema,
  refreshTokenSchema,
} from '../validations/auth.validation';

const router: IRouter = Router();

// Public routes
router.post('/register', validate(registerSchema), registerController);
router.post('/login', validate(loginSchema), loginController);
router.post('/refresh', validate(refreshTokenSchema), refreshTokenController);

// Protected routes
router.post('/logout', authenticate, logoutController);

export default router;

