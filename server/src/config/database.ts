import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
});

// Connect to database
export const connectDatabase = async (): Promise<void> => {
  try {
    const databaseUrl = process.env.DATABASE_URL;
    if (!databaseUrl) {
      throw new Error('DATABASE_URL environment variable is not set');
    }
    
    // Log connection attempt (without exposing password)
    const urlParts = new URL(databaseUrl);
    console.log(`   🔌 Connecting to database: ${urlParts.hostname}:${urlParts.port}/${urlParts.pathname.split('/').pop()}`);
    
    await prisma.$connect();
    
    // Test the connection with a simple query
    await prisma.$queryRaw`SELECT 1`;
    
    console.log('   ✅ Database connection successful');
    console.log('   ✅ Database connection verified with test query');
  } catch (error) {
    console.error('   ❌ Database connection failed');
    console.error('   Error Type:', error?.constructor?.name || 'Unknown');
    console.error('   Error Message:', error instanceof Error ? error.message : String(error));
    if (error instanceof Error && error.stack) {
      console.error('   Stack Trace:');
      console.error(error.stack);
    }
    throw error; // Re-throw to be caught by startServer
  }
};

// Disconnect from database
export const disconnectDatabase = async (): Promise<void> => {
  await prisma.$disconnect();
  console.log('Database disconnected');
};

export default prisma;

