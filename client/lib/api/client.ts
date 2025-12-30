/**
 * API Client base configuration and utilities
 */

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1';
import { tokenStorage } from '../utils/token-storage';
import { logApiRequest, logApiResponse, logApiError, logWarn, logError } from '../utils/logger';

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

export interface ApiError {
  message: string;
  statusCode?: number;
}

/**
 * Custom error class for API errors
 */
export class ApiClientError extends Error {
  statusCode: number;
  data?: any;

  constructor(message: string, statusCode: number = 500, data?: any) {
    super(message);
    this.name = 'ApiClientError';
    this.statusCode = statusCode;
    this.data = data;
  }
}

/**
 * Refresh access token using refresh token
 */
let isRefreshing = false;
let refreshPromise: Promise<string> | null = null;

const refreshAccessToken = async (): Promise<string> => {
  if (isRefreshing && refreshPromise) {
    logWarn('Token refresh already in progress, waiting...');
    return refreshPromise;
  }

  isRefreshing = true;
  refreshPromise = (async () => {
    try {
      logApiRequest('POST', `${API_URL}/auth/refresh`, { action: 'token_refresh' });
      
      const refreshToken = tokenStorage.getRefreshToken();
      
      if (!refreshToken) {
        throw new Error('No refresh token available');
      }

      const response = await fetch(`${API_URL}/auth/refresh`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ refreshToken }),
      });

      logApiResponse('POST', `${API_URL}/auth/refresh`, response.status);

      if (!response.ok) {
        throw new Error(`Failed to refresh token: ${response.status}`);
      }

      const result: ApiResponse<{ accessToken: string }> = await response.json();

      if (result.success && result.data?.accessToken) {
        tokenStorage.setAccessToken(result.data.accessToken);
        logWarn('Token refreshed successfully');
        return result.data.accessToken;
      }

      throw new Error('Invalid refresh response');
    } catch (error) {
      logApiError('POST', `${API_URL}/auth/refresh`, error as Error, undefined, {
        action: 'token_refresh',
      });
      // Clear tokens on refresh failure
      tokenStorage.clearTokens();
      throw error;
    } finally {
      isRefreshing = false;
      refreshPromise = null;
    }
  })();

  return refreshPromise;
};

/**
 * Make API request with automatic token refresh
 */
export const apiRequest = async <T = any>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> => {
  const url = `${API_URL}${endpoint}`;
  const method = options.method || 'GET';
  const accessToken = tokenStorage.getAccessToken();
  const requestId = `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

  // Prepare headers
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  // Add authorization header if token exists
  if (accessToken) {
    headers['Authorization'] = `Bearer ${accessToken}`;
  }

  logApiRequest(method, url, {
    requestId,
    hasAuth: !!accessToken,
    endpoint,
  });

  let response: Response;
  try {
    // Make initial request
    response = await fetch(url, {
      ...options,
      headers,
      credentials: 'include',
    });

    logApiResponse(method, url, response.status, { requestId });
  } catch (fetchError) {
    logApiError(method, url, fetchError as Error, undefined, {
      requestId,
      errorType: 'network_error',
    });
    throw new ApiClientError(
      `Network error: ${fetchError instanceof Error ? fetchError.message : 'Failed to connect to server'}`,
      0,
      { originalError: fetchError }
    );
  }

  // If unauthorized and we have a refresh token, try to refresh
  if (response.status === 401 && tokenStorage.getRefreshToken()) {
    try {
      logWarn('Received 401, attempting token refresh', { requestId });
      const newAccessToken = await refreshAccessToken();
      
      // Retry request with new token
      headers['Authorization'] = `Bearer ${newAccessToken}`;
      logApiRequest(method, url, { requestId, retry: true, hasAuth: true });
      
      response = await fetch(url, {
        ...options,
        headers,
        credentials: 'include',
      });
      
      logApiResponse(method, url, response.status, { requestId, retry: true });
    } catch (error) {
      // Refresh failed, clear tokens and throw error
      logError('Token refresh failed, clearing tokens', error as Error, { requestId });
      tokenStorage.clearTokens();
      throw new ApiClientError('Session expired. Please login again.', 401);
    }
  }

  // Parse response
  let data: ApiResponse<T>;
  try {
    data = await response.json();
  } catch (parseError) {
    logApiError(method, url, parseError as Error, response.status, {
      requestId,
      errorType: 'parse_error',
    });
    throw new ApiClientError('Failed to parse response', response.status);
  }

  // Handle error responses
  if (!response.ok || !data.success) {
    const errorMessage = data.error || data.message || 'An error occurred';
    logApiError(method, url, new Error(errorMessage), response.status, {
      requestId,
      errorType: 'api_error',
      errorData: data,
    });
    throw new ApiClientError(errorMessage, response.status, data);
  }

  return data.data as T;
};

/**
 * GET request helper
 */
export const apiGet = <T = any>(endpoint: string, options?: RequestInit): Promise<T> => {
  return apiRequest<T>(endpoint, {
    ...options,
    method: 'GET',
  });
};

/**
 * POST request helper
 */
export const apiPost = <T = any>(
  endpoint: string,
  body?: any,
  options?: RequestInit
): Promise<T> => {
  return apiRequest<T>(endpoint, {
    ...options,
    method: 'POST',
    body: JSON.stringify(body),
  });
};

/**
 * PATCH request helper
 */
export const apiPatch = <T = any>(
  endpoint: string,
  body?: any,
  options?: RequestInit
): Promise<T> => {
  return apiRequest<T>(endpoint, {
    ...options,
    method: 'PATCH',
    body: JSON.stringify(body),
  });
};

/**
 * PUT request helper
 */
export const apiPut = <T = any>(
  endpoint: string,
  body?: any,
  options?: RequestInit
): Promise<T> => {
  return apiRequest<T>(endpoint, {
    ...options,
    method: 'PUT',
    body: JSON.stringify(body),
  });
};

/**
 * DELETE request helper
 */
export const apiDelete = <T = any>(endpoint: string, options?: RequestInit): Promise<T> => {
  return apiRequest<T>(endpoint, {
    ...options,
    method: 'DELETE',
  });
};

