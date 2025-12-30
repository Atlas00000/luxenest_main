import dotenv from 'dotenv';
import { connectDatabase, disconnectDatabase } from './database';
import { connectRedis, disconnectRedis } from './redis';

dotenv.config();

async function testConnections() {
  console.log('🔍 Testing database and Redis connections...\n');

  // Test Database Connection
  try {
    await connectDatabase();
    console.log('✅ Database connection test passed\n');
  } catch (error) {
    console.error('❌ Database connection test failed:', error);
    process.exit(1);
  }

  // Test Redis Connection
  try {
    await connectRedis();
    console.log('✅ Redis connection test passed\n');
  } catch (error) {
    console.error('⚠️  Redis connection test failed (non-critical):', error);
  }

  // Cleanup
  await disconnectDatabase();
  await disconnectRedis();
  
  console.log('✅ All connection tests completed');
  process.exit(0);
}

testConnections();

