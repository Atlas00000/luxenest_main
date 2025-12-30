import request from 'supertest';
import app from '../../src/app';
import { testPrisma } from './test-db';
import { hashPassword } from '../../src/utils/bcrypt.util';

let authCounter = 0;

export interface TestUser {
  id: string;
  email: string;
  password: string;
  name: string;
  role: 'USER' | 'ADMIN';
  accessToken?: string;
  refreshToken?: string;
}

/**
 * Create a test user in the database
 */
export const createTestUser = async (overrides?: Partial<TestUser>): Promise<TestUser> => {
  authCounter++;
  const userData = {
    name: `Test User ${authCounter}`,
    email: `testuser${authCounter}@example.com`,
    password: 'Test1234!',
    role: 'USER' as const,
    ...overrides
  };

  const hashedPassword = await hashPassword(userData.password);

  const user = await testPrisma.user.create({
    data: {
      name: userData.name,
      email: userData.email,
      password: hashedPassword,
      role: userData.role,
    },
  });

  return {
    id: user.id,
    email: user.email,
    password: userData.password,
    name: user.name,
    role: user.role,
  };
};

/**
 * Register a user via API and return tokens
 */
export const registerTestUser = async (userData?: Partial<TestUser>): Promise<TestUser> => {
  authCounter++;
  const data = {
    name: `Test User ${authCounter}`,
    email: `testuser${authCounter}@example.com`,
    password: 'Test1234!',
    ...userData
  };

  const response = await request(app)
    .post('/api/v1/auth/register')
    .send({
      name: data.name,
      email: data.email,
      password: data.password,
    })
    .expect(201);

    return {
      id: response.body.data.user.id,
      email: response.body.data.user.email,
      password: data.password!,
      name: response.body.data.user.name,
      role: response.body.data.user.role,
      accessToken: response.body.data.accessToken,
      refreshToken: response.body.data.refreshToken,
    };
};

/**
 * Login a user via API and return tokens
 */
export const loginTestUser = async (email: string, password: string): Promise<TestUser> => {
  const response = await request(app)
    .post('/api/v1/auth/login')
    .send({ email, password })
    .expect(200);

      return {
        id: response.body.data.user.id,
        email: response.body.data.user.email,
        password,
        name: response.body.data.user.name,
        role: response.body.data.user.role,
        accessToken: response.body.data.accessToken,
        refreshToken: response.body.data.refreshToken,
      };
};

/**
 * Get auth headers for a user
 */
export const getAuthHeaders = (accessToken: string) => ({
  Authorization: `Bearer ${accessToken}`
});

