import { Request, Response, NextFunction } from 'express';
import { setCacheHeaders, CacheStrategy } from '../utils/cache-headers.util';

/**
 * Cache middleware factory - creates middleware with specific cache strategy
 * @param strategy Cache strategy to apply
 * @param options Additional cache options
 */
export function cacheMiddleware(
  strategy: CacheStrategy,
  options: {
    revalidate?: boolean;
    maxAge?: number;
    isPrivate?: boolean;
  } = {}
) {
  return (_req: Request, res: Response, next: NextFunction): void => {
    setCacheHeaders(res, strategy, options);
    next();
  };
}

/**
 * Predefined cache middlewares for common use cases
 */
export const cacheMiddlewares = {
  /** No caching - for dynamic/user-specific content */
  noCache: cacheMiddleware(CacheStrategy.NO_CACHE),
  
  /** Short cache (1 hour) - for frequently changing content */
  short: cacheMiddleware(CacheStrategy.SHORT, { revalidate: true }),
  
  /** Medium cache (1 day) - for moderately changing content */
  medium: cacheMiddleware(CacheStrategy.MEDIUM, { revalidate: true }),
  
  /** Long cache (1 week) - for static/semi-static content */
  long: cacheMiddleware(CacheStrategy.LONG, { revalidate: true }),
  
  /** Very long cache (30 days) - for static assets */
  veryLong: cacheMiddleware(CacheStrategy.VERY_LONG),
  
  /** Immutable cache (1 year) - for versioned static assets */
  immutable: cacheMiddleware(CacheStrategy.IMMUTABLE),
  
  /** Private cache (1 hour) - for user-specific content */
  privateShort: cacheMiddleware(CacheStrategy.SHORT, { isPrivate: true }),
  
  /** Private cache (1 day) - for user-specific content */
  privateMedium: cacheMiddleware(CacheStrategy.MEDIUM, { isPrivate: true }),
};

