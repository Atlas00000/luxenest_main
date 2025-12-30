import { Request, Response, NextFunction } from 'express';
import { register, login, logout, refreshAccessToken } from '../services/auth.service';
import { sendSuccess } from '../utils/api-response';
import { RequestWithUser } from '../types';

/**
 * Register a new user
 */
export const registerController = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { name, email, password } = req.body;
    
    const result = await register({ name, email, password });
    
    sendSuccess(res, result, 'User registered successfully', 201);
  } catch (error) {
    next(error);
  }
};

/**
 * Login user
 */
export const loginController = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { email, password } = req.body;
    
    const result = await login({ email, password });
    
    sendSuccess(res, result, 'Login successful');
  } catch (error) {
    next(error);
  }
};

/**
 * Logout user
 */
export const logoutController = async (
  req: RequestWithUser,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (req.user) {
      await logout(req.user.id);
    }
    
    sendSuccess(res, null, 'Logout successful');
  } catch (error) {
    next(error);
  }
};

/**
 * Refresh access token
 */
export const refreshTokenController = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { refreshToken } = req.body;
    
    const result = await refreshAccessToken(refreshToken);
    
    sendSuccess(res, result, 'Token refreshed successfully');
  } catch (error) {
    next(error);
  }
};

