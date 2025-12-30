import { PrismaClient } from '@prisma/client';
import redisClient from '../../src/config/redis';
import { clearMockCache } from '../__mocks__/redis';

export const testPrisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.TEST_DATABASE_URL || process.env.DATABASE_URL
    }
  }
});

/**
 * Clean all database tables
 */
export const cleanDatabase = async () => {
  const tablenames = await testPrisma.$queryRaw<Array<{ tablename: string }>>`
    SELECT tablename FROM pg_tables WHERE schemaname='public'
  `;

  // Disable foreign key checks temporarily for cleaner truncation
  await testPrisma.$executeRawUnsafe('SET session_replication_role = replica;');

  for (const { tablename } of tablenames) {
    if (tablename !== '_prisma_migrations') {
      try {
        await testPrisma.$executeRawUnsafe(`TRUNCATE TABLE "public"."${tablename}" CASCADE;`);
      } catch (error) {
        // Ignore errors for tables that don't exist or can't be truncated
      }
    }
  }

  // Re-enable foreign key checks
  await testPrisma.$executeRawUnsafe('SET session_replication_role = DEFAULT;');
};

/**
 * Clear all Redis cache
 */
export const clearRedisCache = async () => {
  try {
    // Clear mock cache first (for test environment)
    clearMockCache();
    
    // If real Redis is available, clear it too
    if (redisClient && typeof redisClient.isOpen !== 'undefined' && redisClient.isOpen) {
      const keys = await redisClient.keys('*');
      if (keys.length > 0) {
        await redisClient.del(keys);
      }
    }
  } catch (error) {
    // Redis might not be available in test environment, ignore errors
  }
};

