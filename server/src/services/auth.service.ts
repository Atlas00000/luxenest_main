import prisma from '../config/database';
import { hashPassword, comparePassword } from '../utils/bcrypt.util';
import { generateAccessToken, generateRefreshToken } from '../utils/jwt.util';
import { ConflictError, UnauthorizedError, NotFoundError } from '../utils/api-error';
import redisClient from '../config/redis';

export interface RegisterData {
  name: string;
  email: string;
  password: string;
}

export interface LoginData {
  email: string;
  password: string;
}

export interface AuthResponse {
  user: {
    id: string;
    name: string;
    email: string;
    role: string;
    avatar: string | null;
  };
  accessToken: string;
  refreshToken: string;
}

/**
 * Register a new user
 */
export const register = async (data: RegisterData): Promise<AuthResponse> => {
  // Check if user already exists
  const existingUser = await prisma.user.findUnique({
    where: { email: data.email.toLowerCase() },
  });

  if (existingUser) {
    throw new ConflictError('User with this email already exists');
  }

  // Hash password
  const hashedPassword = await hashPassword(data.password);

  // Create user
  const user = await prisma.user.create({
    data: {
      name: data.name,
      email: data.email.toLowerCase(),
      password: hashedPassword,
    },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      avatar: true,
    },
  });

  // Generate tokens
  const accessToken = generateAccessToken({
    userId: user.id,
    email: user.email,
    role: user.role,
  });

  const refreshToken = generateRefreshToken({
    userId: user.id,
    email: user.email,
    role: user.role,
  });

  // Store refresh token in Redis (optional, for token revocation)
  try {
    await redisClient.setEx(
      `refresh_token:${user.id}`,
      7 * 24 * 60 * 60, // 7 days in seconds
      refreshToken
    );
  } catch (error) {
    console.warn('Failed to store refresh token in Redis:', error);
    // Non-critical, continue
  }

  return {
    user,
    accessToken,
    refreshToken,
  };
};

/**
 * Login user
 */
export const login = async (data: LoginData): Promise<AuthResponse> => {
  // Find user by email
  const user = await prisma.user.findUnique({
    where: { email: data.email.toLowerCase() },
  });

  if (!user) {
    throw new UnauthorizedError('Invalid email or password');
  }

  // Verify password
  const isPasswordValid = await comparePassword(data.password, user.password);

  if (!isPasswordValid) {
    throw new UnauthorizedError('Invalid email or password');
  }

  // Generate tokens
  const accessToken = generateAccessToken({
    userId: user.id,
    email: user.email,
    role: user.role,
  });

  const refreshToken = generateRefreshToken({
    userId: user.id,
    email: user.email,
    role: user.role,
  });

  // Store refresh token in Redis
  try {
    await redisClient.setEx(
      `refresh_token:${user.id}`,
      7 * 24 * 60 * 60, // 7 days in seconds
      refreshToken
    );
  } catch (error) {
    console.warn('Failed to store refresh token in Redis:', error);
  }

  return {
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      avatar: user.avatar,
    },
    accessToken,
    refreshToken,
  };
};

/**
 * Logout user (revoke refresh token)
 */
export const logout = async (userId: string): Promise<void> => {
  try {
    // Remove refresh token from Redis
    await redisClient.del(`refresh_token:${userId}`);
  } catch (error) {
    console.warn('Failed to remove refresh token from Redis:', error);
  }
};

/**
 * Refresh access token using refresh token
 */
export const refreshAccessToken = async (refreshToken: string): Promise<{ accessToken: string }> => {
  const { verifyRefreshToken } = await import('../utils/jwt.util');
  
  try {
    // Verify refresh token
    const decoded = verifyRefreshToken(refreshToken);

    // Check if token exists in Redis (optional validation)
    try {
      const storedToken = await redisClient.get(`refresh_token:${decoded.userId}`);
      if (storedToken !== refreshToken) {
        throw new UnauthorizedError('Invalid refresh token');
      }
    } catch (error) {
      // If Redis is unavailable, continue without validation
      console.warn('Redis unavailable, skipping token validation');
    }

    // Get user to ensure they still exist
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: {
        id: true,
        email: true,
        role: true,
      },
    });

    if (!user) {
      throw new NotFoundError('User not found');
    }

    // Generate new access token
    const accessToken = generateAccessToken({
      userId: user.id,
      email: user.email,
      role: user.role,
    });

    return { accessToken };
  } catch (error) {
    throw new UnauthorizedError('Invalid or expired refresh token');
  }
};

