import request from 'supertest';
import app from '../../src/app';
import { testPrisma } from '../helpers/test-db';
import { registerTestUser, getAuthHeaders } from '../helpers/test-auth';
import { createCategory } from '../fixtures/categories.fixture';
import { createProduct } from '../fixtures/products.fixture';

describe('Recommendations API', () => {
  let user: any;
  let category: any;
  let product1: any;

  beforeEach(async () => {
    await testPrisma.user.deleteMany();
    await testPrisma.product.deleteMany();
    await testPrisma.category.deleteMany();

    // Create user
    user = await registerTestUser();

    // Create category and products
    category = await createCategory();
    product1 = await createProduct(category.id);
  });

  describe('GET /api/v1/products/:id/recommendations', () => {
    it('should get product recommendations', async () => {
      const response = await request(app)
        .get(`/api/v1/products/${product1.id}/recommendations`)
        .query({ limit: 8 })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
    });

    it('should respect limit parameter', async () => {
      const response = await request(app)
        .get(`/api/v1/products/${product1.id}/recommendations`)
        .query({ limit: 2 })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.length).toBeLessThanOrEqual(2);
    });
  });

  describe('GET /api/v1/user/recommendations', () => {
    it('should get user recommendations when authenticated', async () => {
      const response = await request(app)
        .get('/api/v1/user/recommendations')
        .set(getAuthHeaders(user.accessToken!))
        .query({ limit: 8 })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
    });

    it('should return 401 without authentication', async () => {
      await request(app)
        .get('/api/v1/user/recommendations')
        .expect(401);
    });
  });

  describe('GET /api/v1/trending', () => {
    it('should get trending products', async () => {
      const response = await request(app)
        .get('/api/v1/trending')
        .query({ limit: 8 })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
    });

    it('should respect limit parameter', async () => {
      const response = await request(app)
        .get('/api/v1/trending')
        .query({ limit: 2 })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.length).toBeLessThanOrEqual(2);
    });
  });
});

