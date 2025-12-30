// Mock Redis client for testing
const mockCache: Record<string, string> = {};

const mockRedisClient = {
  connect: jest.fn().mockResolvedValue(undefined),
  disconnect: jest.fn().mockResolvedValue(undefined),
  quit: jest.fn().mockResolvedValue(undefined),
  get: jest.fn((key: string) => Promise.resolve(mockCache[key] || null)),
  set: jest.fn((key: string, value: string) => {
    mockCache[key] = value;
    return Promise.resolve('OK');
  }),
  setEx: jest.fn((key: string, _ttl: number, value: string) => {
    mockCache[key] = value;
    return Promise.resolve('OK');
  }),
  del: jest.fn((keys: string | string[]) => {
    const keysToDelete = Array.isArray(keys) ? keys : [keys];
    keysToDelete.forEach(key => delete mockCache[key]);
    return Promise.resolve(keysToDelete.length);
  }),
  exists: jest.fn((key: string) => Promise.resolve(key in mockCache ? 1 : 0)),
  keys: jest.fn((pattern: string) => {
    const regex = new RegExp(pattern.replace(/\*/g, '.*'));
    return Promise.resolve(Object.keys(mockCache).filter(key => regex.test(key)));
  }),
  on: jest.fn(),
  isOpen: true,
  // Clear all cache (for test cleanup)
  flushAll: jest.fn(() => {
    Object.keys(mockCache).forEach(key => delete mockCache[key]);
    return Promise.resolve('OK');
  }),
};

// Helper to clear cache (called from test setup)
export const clearMockCache = () => {
  Object.keys(mockCache).forEach(key => delete mockCache[key]);
};

export const createClient = jest.fn(() => mockRedisClient);
export const RedisClientType = jest.fn();

export default mockRedisClient;

