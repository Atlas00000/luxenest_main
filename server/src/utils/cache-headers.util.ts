import { Response } from 'express';

/**
 * Cache strategies for different content types
 */
export enum CacheStrategy {
  /** No caching - for dynamic/user-specific content */
  NO_CACHE = 'no-cache',
  /** Short cache - for frequently changing content (1 hour) */
  SHORT = 'short',
  /** Medium cache - for moderately changing content (1 day) */
  MEDIUM = 'medium',
  /** Long cache - for static/semi-static content (1 week) */
  LONG = 'long',
  /** Very long cache - for static assets (1 month) */
  VERY_LONG = 'very-long',
  /** Immutable - for versioned static assets */
  IMMUTABLE = 'immutable',
}

/**
 * Cache duration in seconds for each strategy
 */
const CACHE_DURATIONS: Record<CacheStrategy, number> = {
  [CacheStrategy.NO_CACHE]: 0,
  [CacheStrategy.SHORT]: 3600, // 1 hour
  [CacheStrategy.MEDIUM]: 86400, // 1 day
  [CacheStrategy.LONG]: 604800, // 1 week
  [CacheStrategy.VERY_LONG]: 2592000, // 30 days
  [CacheStrategy.IMMUTABLE]: 31536000, // 1 year
};

/**
 * Sets cache headers on the response based on the strategy
 * @param res Express response object
 * @param strategy Cache strategy to apply
 * @param options Additional cache options
 */
export function setCacheHeaders(
  res: Response,
  strategy: CacheStrategy,
  options: {
    /** Whether to allow revalidation (stale-while-revalidate) */
    revalidate?: boolean;
    /** Custom max-age in seconds (overrides strategy default) */
    maxAge?: number;
    /** Whether this is a private cache (user-specific) */
    isPrivate?: boolean;
  } = {}
): void {
  const { revalidate = false, maxAge, isPrivate = false } = options;
  const duration = maxAge ?? CACHE_DURATIONS[strategy];

  if (strategy === CacheStrategy.NO_CACHE) {
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
    return;
  }

  const cacheControl: string[] = [];
  
  // Public or private
  cacheControl.push(isPrivate ? 'private' : 'public');
  
  // Max age
  if (duration > 0) {
    cacheControl.push(`max-age=${duration}`);
  }
  
  // Revalidation
  if (revalidate) {
    // Allow serving stale content while revalidating (stale-while-revalidate)
    cacheControl.push('stale-while-revalidate=86400'); // 1 day
    cacheControl.push('must-revalidate');
  }
  
  // Immutable for versioned assets
  if (strategy === CacheStrategy.IMMUTABLE) {
    cacheControl.push('immutable');
  }

  res.setHeader('Cache-Control', cacheControl.join(', '));
  
  // Set Expires header for older browsers
  if (duration > 0) {
    const expiresDate = new Date(Date.now() + duration * 1000);
    res.setHeader('Expires', expiresDate.toUTCString());
  }
}

/**
 * Sets ETag header for conditional requests
 * @param res Express response object
 * @param etag ETag value (usually a hash of the content)
 */
export function setETag(res: Response, etag: string): void {
  res.setHeader('ETag', `"${etag}"`);
}

/**
 * Sets Last-Modified header
 * @param res Express response object
 * @param date Last modified date
 */
export function setLastModified(res: Response, date: Date): void {
  res.setHeader('Last-Modified', date.toUTCString());
}

/**
 * Checks if the request has a valid conditional header (If-None-Match or If-Modified-Since)
 * Returns true if the resource hasn't changed (304 Not Modified)
 * @param req Express request object
 * @param res Express response object
 * @param etag Current ETag value
 * @param lastModified Last modified date
 * @returns true if resource hasn't changed, false otherwise
 */
export function checkConditionalRequest(
  req: any,
  res: Response,
  etag?: string,
  lastModified?: Date
): boolean {
  // Check ETag (If-None-Match)
  if (etag) {
    const ifNoneMatch = req.get('If-None-Match');
    if (ifNoneMatch && ifNoneMatch === `"${etag}"`) {
      res.status(304).end();
      return true;
    }
  }

  // Check Last-Modified (If-Modified-Since)
  if (lastModified) {
    const ifModifiedSince = req.get('If-Modified-Since');
    if (ifModifiedSince) {
      const ifModifiedSinceDate = new Date(ifModifiedSince);
      if (lastModified <= ifModifiedSinceDate) {
        res.status(304).end();
        return true;
      }
    }
  }

  return false;
}

/**
 * Generates an ETag from data (simple hash)
 * @param data Data to generate ETag from
 * @returns ETag string
 */
export function generateETag(data: any): string {
  const str = JSON.stringify(data);
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  return Math.abs(hash).toString(36);
}

