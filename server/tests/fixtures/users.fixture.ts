// Simple test data generator (avoiding ES module issues with faker for now)
let counter = 0;

export const createUserFixture = (overrides = {}) => {
  counter++;
  return {
    name: `Test User ${counter}`,
    email: `testuser${counter}@example.com`,
    password: 'Test1234!',
    ...overrides
  };
};

export const createAdminFixture = () => ({
  ...createUserFixture(),
  role: 'ADMIN'
});

