import { createClient, RedisClientType } from 'redis';

const redisClient: RedisClientType = createClient({
  url: process.env.REDIS_URL || 'redis://localhost:6379',
}) as RedisClientType;

redisClient.on('error', (err) => {
  console.error('   ❌ Redis Client Error:', err);
});

redisClient.on('connect', () => {
  console.log('   🔌 Redis client connecting...');
});

redisClient.on('ready', () => {
  console.log('   ✅ Redis connected and ready');
});

// Connect to Redis
export const connectRedis = async (): Promise<void> => {
  // Only connect if REDIS_URL is provided
  if (!process.env.REDIS_URL) {
    console.log('   ⚠️  Redis URL not provided, skipping Redis connection (optional)');
    console.log('   ℹ️  Cache will work without Redis (in-memory only)');
    return;
  }
  
  try {
    const redisUrl = process.env.REDIS_URL;
    const urlParts = new URL(redisUrl);
    console.log(`   🔌 Connecting to Redis: ${urlParts.hostname}:${urlParts.port || 6379}`);
    
    await redisClient.connect();
    console.log('   ✅ Redis connection successful');
  } catch (error) {
    console.error('   ⚠️  Redis connection failed (non-critical)');
    console.error('   Error Type:', error?.constructor?.name || 'Unknown');
    console.error('   Error Message:', error instanceof Error ? error.message : String(error));
    // Don't exit process - Redis is optional for caching
    console.log('   ℹ️  Continuing without Redis cache');
  }
};

// Disconnect from Redis
export const disconnectRedis = async (): Promise<void> => {
  await redisClient.quit();
  console.log('Redis disconnected');
};

export default redisClient;

