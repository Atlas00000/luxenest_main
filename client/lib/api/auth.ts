/**
 * Authentication API service
 */

import { apiPost, apiGet, apiPatch, ApiClientError } from './client';
import { tokenStorage } from '../utils/token-storage';

export interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  avatar: string | null;
  emailVerified?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

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
  user: User;
  accessToken: string;
  refreshToken: string;
}

export interface RefreshTokenResponse {
  accessToken: string;
}

export interface UpdateProfileData {
  name?: string;
  avatar?: string | null;
}

export interface ChangePasswordData {
  currentPassword: string;
  newPassword: string;
}

/**
 * Register a new user
 */
export const register = async (data: RegisterData): Promise<AuthResponse> => {
  try {
    const response = await apiPost<AuthResponse>('/auth/register', data);
    
    // Store tokens
    tokenStorage.setTokens(response.accessToken, response.refreshToken);
    
    return response;
  } catch (error) {
    if (error instanceof ApiClientError) {
      throw error;
    }
    throw new ApiClientError('Registration failed. Please try again.');
  }
};

/**
 * Login user
 */
export const login = async (data: LoginData): Promise<AuthResponse> => {
  try {
    const response = await apiPost<AuthResponse>('/auth/login', data);
    
    // Store tokens
    tokenStorage.setTokens(response.accessToken, response.refreshToken);
    
    return response;
  } catch (error) {
    if (error instanceof ApiClientError) {
      throw error;
    }
    throw new ApiClientError('Login failed. Please check your credentials.');
  }
};

/**
 * Logout user
 */
export const logout = async (): Promise<void> => {
  try {
    // Call logout endpoint (optional, for server-side token revocation)
    await apiPost('/auth/logout');
  } catch (error) {
    // Continue with logout even if API call fails
    console.warn('Logout API call failed:', error);
  } finally {
    // Always clear tokens
    tokenStorage.clearTokens();
  }
};

/**
 * Refresh access token
 */
export const refreshToken = async (): Promise<RefreshTokenResponse> => {
  const refreshTokenValue = tokenStorage.getRefreshToken();
  
  if (!refreshTokenValue) {
    throw new ApiClientError('No refresh token available', 401);
  }

  try {
    const response = await apiPost<RefreshTokenResponse>('/auth/refresh', {
      refreshToken: refreshTokenValue,
    });
    
    // Update access token
    tokenStorage.setAccessToken(response.accessToken);
    
    return response;
  } catch (error) {
    // Clear tokens on refresh failure
    tokenStorage.clearTokens();
    
    if (error instanceof ApiClientError) {
      throw error;
    }
    throw new ApiClientError('Token refresh failed', 401);
  }
};

/**
 * Get current user profile
 */
export const getCurrentUser = async (): Promise<User> => {
  try {
    return await apiGet<User>('/users/me');
  } catch (error) {
    if (error instanceof ApiClientError && error.statusCode === 401) {
      // Clear tokens if unauthorized
      tokenStorage.clearTokens();
    }
    throw error;
  }
};

/**
 * Update user profile
 */
export const updateProfile = async (data: UpdateProfileData): Promise<User> => {
  try {
    return await apiPatch<User>('/users/me', data);
  } catch (error) {
    if (error instanceof ApiClientError) {
      throw error;
    }
    throw new ApiClientError('Failed to update profile');
  }
};

/**
 * Change user password
 */
export const changePassword = async (data: ChangePasswordData): Promise<void> => {
  try {
    await apiPatch('/users/me/password', data);
  } catch (error) {
    if (error instanceof ApiClientError) {
      throw error;
    }
    throw new ApiClientError('Failed to change password');
  }
};

/**
 * Check if user is authenticated (has valid tokens)
 */
export const isAuthenticated = (): boolean => {
  return tokenStorage.hasTokens();
};

