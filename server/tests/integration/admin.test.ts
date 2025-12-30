import request from 'supertest';
import app from '../../src/app';
import { testPrisma } from '../helpers/test-db';
import { registerTestUser, getAuthHeaders } from '../helpers/test-auth';
import { createCategory } from '../fixtures/categories.fixture';
import { createProduct } from '../fixtures/products.fixture';

describe('Admin API', () => {
  let adminUser: any;
  let regularUser: any;
  let category: any;

  beforeEach(async () => {
    await testPrisma.user.deleteMany();
    await testPrisma.product.deleteMany();
    await testPrisma.category.deleteMany();
    await testPrisma.orderItem.deleteMany();
    await testPrisma.order.deleteMany();

    // Create admin user via API registration
    const adminData = {
      name: 'Admin User',
      email: `admin${Date.now()}@example.com`,
      password: 'Admin1234!'
    };
    const adminResponse = await request(app)
      .post('/api/v1/auth/register')
      .send(adminData)
      .expect(201);
    
    // Update to admin role
    await testPrisma.user.update({
      where: { id: adminResponse.body.data.user.id },
      data: { role: 'ADMIN' }
    });

    // Login as admin to get fresh token
    const adminLogin = await request(app)
      .post('/api/v1/auth/login')
      .send({ email: adminData.email, password: adminData.password })
      .expect(200);
    
    adminUser = {
      ...adminResponse.body.data.user,
      password: adminData.password,
      accessToken: adminLogin.body.data.accessToken,
      refreshToken: adminLogin.body.data.refreshToken
    };

    // Create regular user
    regularUser = await registerTestUser();

    // Create category
    category = await createCategory();
  });

  describe('GET /api/v1/admin/stats', () => {
    it('should get admin stats for 30d', async () => {
      const response = await request(app)
        .get('/api/v1/admin/stats')
        .set(getAuthHeaders(adminUser.accessToken!))
        .query({ dateRange: '30d' })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.revenue).toBeDefined();
      expect(response.body.data.orders).toBeDefined();
      expect(response.body.data.users).toBeDefined();
      expect(response.body.data.products).toBeDefined();
    });

    it('should get admin stats for different date ranges', async () => {
      const ranges = ['7d', '30d', '90d', '1y'];
      
      for (const range of ranges) {
        const response = await request(app)
          .get('/api/v1/admin/stats')
          .set(getAuthHeaders(adminUser.accessToken!))
          .query({ dateRange: range })
          .expect(200);

        expect(response.body.success).toBe(true);
        expect(response.body.data).toBeDefined();
      }
    });

    it('should return 403 for regular user', async () => {
      await request(app)
        .get('/api/v1/admin/stats')
        .set(getAuthHeaders(regularUser.accessToken!))
        .expect(403);
    });
  });

  describe('GET /api/v1/admin/orders', () => {
    it('should get all orders for admin', async () => {
      const response = await request(app)
        .get('/api/v1/admin/orders')
        .set(getAuthHeaders(adminUser.accessToken!))
        .query({ page: 1, limit: 20 })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeDefined();
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.meta).toBeDefined();
    });

    it('should filter orders by status', async () => {
      const response = await request(app)
        .get('/api/v1/admin/orders')
        .set(getAuthHeaders(adminUser.accessToken!))
        .query({ status: 'PENDING' })
        .expect(200);

      expect(response.body.success).toBe(true);
    });
  });

  describe('GET /api/v1/admin/users', () => {
    it('should get all users for admin', async () => {
      const response = await request(app)
        .get('/api/v1/admin/users')
        .set(getAuthHeaders(adminUser.accessToken!))
        .query({ page: 1, limit: 20 })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeDefined();
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.meta).toBeDefined();
    });

    it('should search users', async () => {
      const response = await request(app)
        .get('/api/v1/admin/users')
        .set(getAuthHeaders(adminUser.accessToken!))
        .query({ search: 'test' })
        .expect(200);

      expect(response.body.success).toBe(true);
    });
  });

  describe('GET /api/v1/admin/products', () => {
    it('should get all products for admin', async () => {
      await createProduct(category.id);
      await createProduct(category.id);

      const response = await request(app)
        .get('/api/v1/admin/products')
        .set(getAuthHeaders(adminUser.accessToken!))
        .query({ page: 1, limit: 20 })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeDefined();
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.meta).toBeDefined();
    });

    it('should filter low stock products', async () => {
      await createProduct(category.id, { stock: 5 });
      await createProduct(category.id, { stock: 20 });

      const response = await request(app)
        .get('/api/v1/admin/products')
        .set(getAuthHeaders(adminUser.accessToken!))
        .query({ lowStock: 'true' })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
      response.body.data.forEach((product: any) => {
        expect(product.stock).toBeLessThan(10);
      });
    });
  });
});

