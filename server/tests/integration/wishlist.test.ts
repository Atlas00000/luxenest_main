import request from 'supertest';
import app from '../../src/app';
import { testPrisma } from '../helpers/test-db';
import { registerTestUser, getAuthHeaders } from '../helpers/test-auth';
import { createCategory } from '../fixtures/categories.fixture';
import { createProduct } from '../fixtures/products.fixture';

describe('Wishlist API', () => {
  let user: any;
  let category: any;
  let product1: any;

  beforeEach(async () => {
    await testPrisma.user.deleteMany();
    await testPrisma.product.deleteMany();
    await testPrisma.category.deleteMany();
    await testPrisma.wishlistItem.deleteMany();
    await testPrisma.wishlist.deleteMany();

    // Create user
    user = await registerTestUser();

    // Create category and products
    category = await createCategory();
    product1 = await createProduct(category.id);
  });

  describe('GET /api/v1/wishlist', () => {
    it('should get empty wishlist for new user', async () => {
      const response = await request(app)
        .get('/api/v1/wishlist')
        .set(getAuthHeaders(user.accessToken!))
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.items).toBeDefined();
      expect(response.body.data.items.length).toBe(0);
    });

    it('should get wishlist with items', async () => {
      // Add items first
      await request(app)
        .post(`/api/v1/wishlist/items/${product1.id}`)
        .set(getAuthHeaders(user.accessToken!))
        .expect(201);

      const response = await request(app)
        .get('/api/v1/wishlist')
        .set(getAuthHeaders(user.accessToken!))
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.items.length).toBe(1);
      expect(response.body.data.items[0].product.id).toBe(product1.id);
    });

    it('should return 401 without authentication', async () => {
      await request(app)
        .get('/api/v1/wishlist')
        .expect(401);
    });
  });

  describe('GET /api/v1/wishlist/items/:productId/check', () => {
    it('should return true if product is in wishlist', async () => {
      await request(app)
        .post(`/api/v1/wishlist/items/${product1.id}`)
        .set(getAuthHeaders(user.accessToken!))
        .expect(201);

      const response = await request(app)
        .get(`/api/v1/wishlist/items/${product1.id}/check`)
        .set(getAuthHeaders(user.accessToken!))
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.inWishlist).toBe(true);
    });

    it('should return false if product is not in wishlist', async () => {
      const response = await request(app)
        .get(`/api/v1/wishlist/items/${product1.id}/check`)
        .set(getAuthHeaders(user.accessToken!))
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.inWishlist).toBe(false);
    });
  });

  describe('POST /api/v1/wishlist/items/:productId', () => {
    it('should add product to wishlist', async () => {
      const response = await request(app)
        .post(`/api/v1/wishlist/items/${product1.id}`)
        .set(getAuthHeaders(user.accessToken!))
        .expect(201);

      expect(response.body.success).toBe(true);
    });

    it('should return 409 when adding duplicate product', async () => {
      await request(app)
        .post(`/api/v1/wishlist/items/${product1.id}`)
        .set(getAuthHeaders(user.accessToken!))
        .expect(201);

      await request(app)
        .post(`/api/v1/wishlist/items/${product1.id}`)
        .set(getAuthHeaders(user.accessToken!))
        .expect(409);
    });

    it('should return 404 for non-existent product', async () => {
      const fakeId = '00000000-0000-0000-0000-000000000000';
      
      await request(app)
        .post(`/api/v1/wishlist/items/${fakeId}`)
        .set(getAuthHeaders(user.accessToken!))
        .expect(404);
    });
  });

  describe('DELETE /api/v1/wishlist/items/:productId', () => {
    it('should remove item from wishlist', async () => {
      await request(app)
        .post(`/api/v1/wishlist/items/${product1.id}`)
        .set(getAuthHeaders(user.accessToken!))
        .expect(201);

      await request(app)
        .delete(`/api/v1/wishlist/items/${product1.id}`)
        .set(getAuthHeaders(user.accessToken!))
        .expect(200);

      const wishlistResponse = await request(app)
        .get('/api/v1/wishlist')
        .set(getAuthHeaders(user.accessToken!))
        .expect(200);

      expect(wishlistResponse.body.data.items.length).toBe(0);
    });

    it('should return 404 when removing non-existent item', async () => {
      const fakeId = '00000000-0000-0000-0000-000000000000';
      
      await request(app)
        .delete(`/api/v1/wishlist/items/${fakeId}`)
        .set(getAuthHeaders(user.accessToken!))
        .expect(404);
    });
  });
});

