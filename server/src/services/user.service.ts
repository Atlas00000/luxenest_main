import prisma from '../config/database';
import { hashPassword, comparePassword } from '../utils/bcrypt.util';
import { NotFoundError, UnauthorizedError } from '../utils/api-error';

export interface UpdateProfileData {
  name?: string;
  avatar?: string | null;
}

export interface ChangePasswordData {
  userId: string;
  currentPassword: string;
  newPassword: string;
}

/**
 * Get user by ID
 */
export const getUserById = async (userId: string) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      avatar: true,
      emailVerified: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  if (!user) {
    throw new NotFoundError('User not found');
  }

  return user;
};

/**
 * Update user profile
 */
export const updateProfile = async (
  userId: string,
  data: UpdateProfileData
) => {
  const user = await prisma.user.update({
    where: { id: userId },
    data: {
      ...(data.name && { name: data.name }),
      ...(data.avatar !== undefined && { avatar: data.avatar }),
    },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      avatar: true,
      emailVerified: true,
      updatedAt: true,
    },
  });

  return user;
};

/**
 * Change user password
 */
export const changePassword = async (data: ChangePasswordData): Promise<void> => {
  // Get user with password
  const user = await prisma.user.findUnique({
    where: { id: data.userId },
    select: {
      id: true,
      password: true,
    },
  });

  if (!user) {
    throw new NotFoundError('User not found');
  }

  // Verify current password
  const isPasswordValid = await comparePassword(data.currentPassword, user.password);

  if (!isPasswordValid) {
    throw new UnauthorizedError('Current password is incorrect');
  }

  // Hash new password
  const hashedPassword = await hashPassword(data.newPassword);

  // Update password
  await prisma.user.update({
    where: { id: data.userId },
    data: {
      password: hashedPassword,
    },
  });
};

/**
 * Check if email is available
 */
export const checkEmailAvailability = async (email: string): Promise<boolean> => {
  const user = await prisma.user.findUnique({
    where: { email: email.toLowerCase() },
  });

  return !user; // Return true if email is available (user doesn't exist)
};

