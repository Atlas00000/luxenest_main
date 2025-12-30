import request from 'supertest';
import app from '../../src/app';
import { testPrisma } from '../helpers/test-db';
import { createUserFixture } from '../fixtures/users.fixture';

// Jest globals (describe, it, expect) are available without import

describe('POST /api/v1/auth/register', () => {
  beforeEach(async () => {
    await testPrisma.user.deleteMany();
  });

  it('should register a new user', async () => {
    const userData = createUserFixture();
    
    const response = await request(app)
      .post('/api/v1/auth/register')
      .send(userData)
      .expect(201);

    expect(response.body.success).toBe(true);
    expect(response.body.data.user).toBeDefined();
    expect(response.body.data.accessToken).toBeDefined();
    expect(response.body.data.refreshToken).toBeDefined();
    expect(response.body.data.user.role).toBe('USER');
  });

  it('should return 409 for duplicate email', async () => {
    const userData = createUserFixture();
    
    await request(app)
      .post('/api/v1/auth/register')
      .send(userData)
      .expect(201);

    await request(app)
      .post('/api/v1/auth/register')
      .send(userData)
      .expect(409);
  });

  it('should validate email format', async () => {
    const response = await request(app)
      .post('/api/v1/auth/register')
      .send({
        name: 'Test User',
        email: 'invalid-email',
        password: 'Password123!'
      })
      .expect(400);

    expect(response.body.success).toBe(false);
  });
});

describe('POST /api/v1/auth/login', () => {
  beforeEach(async () => {
    await testPrisma.user.deleteMany();
  });

  it('should login with valid credentials', async () => {
    const userData = createUserFixture();
    
    // Register first
    await request(app)
      .post('/api/v1/auth/register')
      .send(userData)
      .expect(201);

    // Login
    const response = await request(app)
      .post('/api/v1/auth/login')
      .send({
        email: userData.email,
        password: userData.password
      })
      .expect(200);

    expect(response.body.success).toBe(true);
    expect(response.body.data.accessToken).toBeDefined();
    expect(response.body.data.refreshToken).toBeDefined();
  });

  it('should return 401 for invalid credentials', async () => {
    await request(app)
      .post('/api/v1/auth/login')
      .send({
        email: 'nonexistent@example.com',
        password: 'wrongpassword'
      })
      .expect(401);
  });
});

