import { Response, NextFunction } from 'express';
import { getUserById, updateProfile, changePassword } from '../services/user.service';
import { sendSuccess } from '../utils/api-response';
import { RequestWithUser } from '../types';

/**
 * Get current user profile
 */
export const getCurrentUser = async (
  req: RequestWithUser,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user) {
      throw new Error('User not authenticated');
    }

    const user = await getUserById(req.user.id);
    
    sendSuccess(res, user, 'User profile retrieved successfully');
  } catch (error) {
    next(error);
  }
};

/**
 * Update user profile
 */
export const updateProfileController = async (
  req: RequestWithUser,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user) {
      throw new Error('User not authenticated');
    }

    const { name, avatar } = req.body;
    
    const user = await updateProfile(req.user.id, { name, avatar });
    
    sendSuccess(res, user, 'Profile updated successfully');
  } catch (error) {
    next(error);
  }
};

/**
 * Change user password
 */
export const changePasswordController = async (
  req: RequestWithUser,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user) {
      throw new Error('User not authenticated');
    }

    const { currentPassword, newPassword } = req.body;
    
    await changePassword({
      userId: req.user.id,
      currentPassword,
      newPassword,
    });
    
    sendSuccess(res, null, 'Password changed successfully');
  } catch (error) {
    next(error);
  }
};

