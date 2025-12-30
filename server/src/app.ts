import express, { Express, Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { connectDatabase } from './config/database';
import { connectRedis } from './config/redis';
import { errorHandler } from './middleware/error.middleware';
import { requestLogger } from './middleware/logger.middleware';
import { cacheMiddlewares } from './middleware/cache.middleware';
import apiRoutes from './routes';

// Load environment variables
dotenv.config();

const app: Express = express();
const PORT = process.env.PORT || 5000;
const CORS_ORIGIN = process.env.CORS_ORIGIN || 'http://localhost:3000';

// Parse CORS origins (support multiple origins separated by commas)
const allowedOrigins = CORS_ORIGIN.split(',').map(origin => origin.trim());

// Middleware
app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) {
      return callback(null, true);
    }
    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files (uploads) with cache headers
app.use('/uploads', 
  cacheMiddlewares.veryLong, // 30 days cache for uploaded images
  express.static(path.join(process.cwd(), 'server', 'uploads'))
);

// Request logging
app.use(requestLogger);

// Health check endpoint
app.get('/health', (_req: Request, res: Response) => {
  res.status(200).json({
    success: true,
    message: 'Server is healthy',
    timestamp: new Date().toISOString(),
  });
});

// API routes
app.use('/api/v1', apiRoutes);

// 404 handler
app.use((req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    message: 'Route not found',
    path: req.originalUrl,
  });
});

// Error handling middleware (must be last)
app.use(errorHandler);

// Initialize server
export const startServer = async (): Promise<void> => {
  try {
    console.log('📋 Step 1/3: Initializing Express app...');
    console.log(`   ✓ Express app initialized`);
    console.log(`   ✓ Middleware configured`);
    console.log(`   ✓ Routes registered`);
    
    console.log('📋 Step 2/3: Connecting to database...');
    await connectDatabase();
    console.log(`   ✓ Database connection successful`);
    
    console.log('📋 Step 3/3: Connecting to Redis (non-blocking)...');
    await connectRedis();
    console.log(`   ✓ Redis connection attempt completed`);
    
    console.log('📋 Starting HTTP server...');
    const server = app.listen(PORT, () => {
      console.log('='.repeat(60));
      console.log('✅ Server successfully started!');
      console.log('='.repeat(60));
      console.log(`🌐 Server URL: http://localhost:${PORT}`);
      console.log(`🔗 Health Check: http://localhost:${PORT}/health`);
      console.log(`📡 API Base URL: http://localhost:${PORT}/api/v1`);
      console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log(`🔐 CORS Origins: ${CORS_ORIGIN}`);
      console.log(`📅 Started At: ${new Date().toISOString()}`);
      console.log('='.repeat(60));
    });
    
    // Log any server errors
    server.on('error', (error: Error) => {
      console.error('❌ HTTP server error:', error);
      console.error('Stack:', error.stack);
    });
  } catch (error) {
    console.error('='.repeat(60));
    console.error('❌ FAILED TO START SERVER');
    console.error('='.repeat(60));
    console.error('Error Type:', error?.constructor?.name || 'Unknown');
    console.error('Error Message:', error instanceof Error ? error.message : String(error));
    if (error instanceof Error && error.stack) {
      console.error('Stack Trace:');
      console.error(error.stack);
    }
    console.error('='.repeat(60));
    throw error; // Re-throw to be caught by server.ts
  }
};

export default app;

