import dotenv from 'dotenv';
import { startServer } from './app';

// Load environment variables
dotenv.config();

// Log startup information
console.log('='.repeat(60));
console.log('🚀 LuxeNest Server Starting...');
console.log('='.repeat(60));
console.log(`📅 Start Time: ${new Date().toISOString()}`);
console.log(`🌍 Node Version: ${process.version}`);
console.log(`📦 Environment: ${process.env.NODE_ENV || 'development'}`);
console.log(`🔌 Port: ${process.env.PORT || 5000}`);
console.log('='.repeat(60));

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Unhandled Rejection at:', promise);
  console.error('❌ Reason:', reason);
  if (reason instanceof Error) {
    console.error('❌ Stack:', reason.stack);
  }
  // Don't exit in production, but log the error
  if (process.env.NODE_ENV === 'production') {
    console.error('⚠️  Continuing in production mode despite unhandled rejection');
  } else {
    process.exit(1);
  }
});

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  console.error('❌ Uncaught Exception:', error);
  console.error('❌ Stack:', error.stack);
  process.exit(1);
});

// Start the server
console.log('📝 Initiating server startup...');
startServer().catch((error) => {
  console.error('='.repeat(60));
  console.error('❌ FATAL ERROR: Failed to start server');
  console.error('='.repeat(60));
  console.error('Error Type:', error?.constructor?.name || 'Unknown');
  console.error('Error Message:', error instanceof Error ? error.message : String(error));
  if (error instanceof Error && error.stack) {
    console.error('Stack Trace:');
    console.error(error.stack);
  }
  console.error('='.repeat(60));
  process.exit(1);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('='.repeat(60));
  console.log('🛑 SIGTERM signal received: closing HTTP server');
  console.log(`📅 Shutdown Time: ${new Date().toISOString()}`);
  console.log('='.repeat(60));
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('='.repeat(60));
  console.log('🛑 SIGINT signal received: closing HTTP server');
  console.log(`📅 Shutdown Time: ${new Date().toISOString()}`);
  console.log('='.repeat(60));
  process.exit(0);
});

