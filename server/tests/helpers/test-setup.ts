import { cleanDatabase, clearRedisCache } from './test-db';

// Jest globals are available without import
beforeAll(async () => {
  // Test database should already be set up
  // Run migrations if needed: execSync('pnpm prisma migrate deploy', { stdio: 'inherit' });
});

afterAll(async () => {
  // Final cleanup
  await cleanDatabase();
  await clearRedisCache();
});

beforeEach(async () => {
  // Clean database and cache before each test
  await cleanDatabase();
  await clearRedisCache();
});

afterEach(async () => {
  // Additional cleanup after each test
  await clearRedisCache();
});

