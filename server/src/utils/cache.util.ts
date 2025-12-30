import redisClient from '../config/redis';

const CACHE_TTL = {
  SHORT: 60, // 1 minute
  MEDIUM: 300, // 5 minutes
  LONG: 3600, // 1 hour
  VERY_LONG: 86400, // 24 hours
};

/**
 * Get cached data
 */
export const getCache = async <T>(key: string): Promise<T | null> => {
  try {
    if (!redisClient.isOpen) {
      return null;
    }

    const cached = await redisClient.get(key);
    if (cached) {
      return JSON.parse(cached) as T;
    }
    return null;
  } catch (error) {
    console.error(`Cache get error for key ${key}:`, error);
    return null;
  }
};

/**
 * Set cached data
 */
export const setCache = async (
  key: string,
  value: any,
  ttl: number = CACHE_TTL.MEDIUM
): Promise<void> => {
  try {
    if (!redisClient.isOpen) {
      return;
    }

    await redisClient.setEx(key, ttl, JSON.stringify(value));
  } catch (error) {
    console.error(`Cache set error for key ${key}:`, error);
  }
};

/**
 * Delete cached data
 */
export const deleteCache = async (key: string): Promise<void> => {
  try {
    if (!redisClient.isOpen) {
      return;
    }

    await redisClient.del(key);
  } catch (error) {
    console.error(`Cache delete error for key ${key}:`, error);
  }
};

/**
 * Delete cache by pattern
 */
export const deleteCachePattern = async (pattern: string): Promise<void> => {
  try {
    if (!redisClient.isOpen) {
      return;
    }

    const keys = await redisClient.keys(pattern);
    if (keys.length > 0) {
      await redisClient.del(keys);
    }
  } catch (error) {
    console.error(`Cache delete pattern error for ${pattern}:`, error);
  }
};

/**
 * Cache key generators
 */
export const CacheKeys = {
  // Products
  products: (filters: string) => `products:${filters}`,
  product: (id: string) => `product:${id}`,
  featuredProducts: () => 'products:featured',
  newProducts: () => 'products:new',
  saleProducts: () => 'products:sale',
  
  // Categories
  categories: (featured: boolean) => `categories:${featured ? 'featured' : 'all'}`,
  category: (id: string) => `category:${id}`,
  categoryBySlug: (slug: string) => `category:slug:${slug}`,
  
  // Admin
  adminStats: (dateRange: string) => `admin:stats:${dateRange}`,
  
  // User sessions (already handled by auth, but can be extended)
  userSession: (userId: string) => `session:${userId}`,
};

export { CACHE_TTL };

