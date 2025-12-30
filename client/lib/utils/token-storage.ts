/**
 * Token storage utility for managing access and refresh tokens
 */

const ACCESS_TOKEN_KEY = 'luxenest_access_token';
const REFRESH_TOKEN_KEY = 'luxenest_refresh_token';

export const tokenStorage = {
  /**
   * Get access token from storage
   */
  getAccessToken: (): string | null => {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem(ACCESS_TOKEN_KEY);
  },

  /**
   * Get refresh token from storage
   */
  getRefreshToken: (): string | null => {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem(REFRESH_TOKEN_KEY);
  },

  /**
   * Set access token in storage
   */
  setAccessToken: (token: string): void => {
    if (typeof window === 'undefined') return;
    localStorage.setItem(ACCESS_TOKEN_KEY, token);
  },

  /**
   * Set refresh token in storage
   */
  setRefreshToken: (token: string): void => {
    if (typeof window === 'undefined') return;
    localStorage.setItem(REFRESH_TOKEN_KEY, token);
  },

  /**
   * Set both tokens
   */
  setTokens: (accessToken: string, refreshToken: string): void => {
    tokenStorage.setAccessToken(accessToken);
    tokenStorage.setRefreshToken(refreshToken);
  },

  /**
   * Remove access token from storage
   */
  removeAccessToken: (): void => {
    if (typeof window === 'undefined') return;
    localStorage.removeItem(ACCESS_TOKEN_KEY);
  },

  /**
   * Remove refresh token from storage
   */
  removeRefreshToken: (): void => {
    if (typeof window === 'undefined') return;
    localStorage.removeItem(REFRESH_TOKEN_KEY);
  },

  /**
   * Remove all tokens
   */
  clearTokens: (): void => {
    tokenStorage.removeAccessToken();
    tokenStorage.removeRefreshToken();
  },

  /**
   * Check if user has tokens (is authenticated)
   */
  hasTokens: (): boolean => {
    return !!(tokenStorage.getAccessToken() && tokenStorage.getRefreshToken());
  },
};

