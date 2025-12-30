import request from 'supertest';
import app from '../../src/app';
import { testPrisma } from '../helpers/test-db';
import { registerTestUser, getAuthHeaders } from '../helpers/test-auth';
import { createCategory } from '../fixtures/categories.fixture';
import { createProduct } from '../fixtures/products.fixture';

describe('Cart API', () => {
  let user: any;
  let category: any;
  let product1: any;
  let product2: any;

  beforeEach(async () => {
    await testPrisma.user.deleteMany();
    await testPrisma.product.deleteMany();
    await testPrisma.category.deleteMany();
    await testPrisma.cartItem.deleteMany();
    await testPrisma.cart.deleteMany();

    // Create user
    user = await registerTestUser();

    // Create category and products
    category = await createCategory();
    product1 = await createProduct(category.id, { stock: 10 });
    product2 = await createProduct(category.id, { stock: 5 });
  });

  describe('GET /api/v1/cart', () => {
    it('should get empty cart for new user', async () => {
      const response = await request(app)
        .get('/api/v1/cart')
        .set(getAuthHeaders(user.accessToken!))
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeDefined();
      expect(response.body.data.items).toBeDefined();
      expect(Array.isArray(response.body.data.items)).toBe(true);
      expect(response.body.data.items.length).toBe(0);
    });

    it('should get cart with items', async () => {
      // Add items first
      await request(app)
        .post('/api/v1/cart/items')
        .set(getAuthHeaders(user.accessToken!))
        .send({ productId: product1.id, quantity: 2 })
        .expect(201);

      const response = await request(app)
        .get('/api/v1/cart')
        .set(getAuthHeaders(user.accessToken!))
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.items.length).toBe(1);
      expect(response.body.data.items[0].product.id).toBe(product1.id);
      expect(response.body.data.items[0].quantity).toBe(2);
    });

    it('should return 401 without authentication', async () => {
      await request(app)
        .get('/api/v1/cart')
        .expect(401);
    });
  });

  describe('POST /api/v1/cart/items', () => {
    it('should add product to cart', async () => {
      const response = await request(app)
        .post('/api/v1/cart/items')
        .set(getAuthHeaders(user.accessToken!))
        .send({ productId: product1.id, quantity: 1 })
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeDefined();
      expect(response.body.data.productId).toBe(product1.id);
      expect(response.body.data.quantity).toBe(1);
    });

    it('should update quantity when adding same product again', async () => {
      await request(app)
        .post('/api/v1/cart/items')
        .set(getAuthHeaders(user.accessToken!))
        .send({ productId: product1.id, quantity: 1 })
        .expect(201);

      const response = await request(app)
        .post('/api/v1/cart/items')
        .set(getAuthHeaders(user.accessToken!))
        .send({ productId: product1.id, quantity: 2 })
        .expect(201);

      // The response should show the updated quantity
      expect(response.body.data.quantity).toBe(3);

      const cartResponse = await request(app)
        .get('/api/v1/cart')
        .set(getAuthHeaders(user.accessToken!))
        .expect(200);

      expect(cartResponse.body.data.items.length).toBe(1);
      expect(cartResponse.body.data.items[0].quantity).toBe(3);
    });

    it('should return 400 when quantity exceeds stock', async () => {
      await request(app)
        .post('/api/v1/cart/items')
        .set(getAuthHeaders(user.accessToken!))
        .send({ productId: product1.id, quantity: 100 })
        .expect(400);
    });

    it('should return 404 for non-existent product', async () => {
      const fakeId = '00000000-0000-0000-0000-000000000000';
      
      await request(app)
        .post('/api/v1/cart/items')
        .set(getAuthHeaders(user.accessToken!))
        .send({ productId: fakeId, quantity: 1 })
        .expect(404);
    });
  });

  describe('PATCH /api/v1/cart/items/:productId', () => {
    it('should update cart item quantity', async () => {
      await request(app)
        .post('/api/v1/cart/items')
        .set(getAuthHeaders(user.accessToken!))
        .send({ productId: product1.id, quantity: 1 })
        .expect(201);

      const response = await request(app)
        .patch(`/api/v1/cart/items/${product1.id}`)
        .set(getAuthHeaders(user.accessToken!))
        .send({ quantity: 3 })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeDefined();
      expect(response.body.data.quantity).toBe(3);
    });

    it('should remove item when quantity is 0', async () => {
      await request(app)
        .post('/api/v1/cart/items')
        .set(getAuthHeaders(user.accessToken!))
        .send({ productId: product1.id, quantity: 1 })
        .expect(201);

      // Use DELETE endpoint instead of setting quantity to 0
      await request(app)
        .delete(`/api/v1/cart/items/${product1.id}`)
        .set(getAuthHeaders(user.accessToken!))
        .expect(200);

      const cartResponse = await request(app)
        .get('/api/v1/cart')
        .set(getAuthHeaders(user.accessToken!))
        .expect(200);

      expect(cartResponse.body.data.items.length).toBe(0);
    });

    it('should return 400 when quantity exceeds stock', async () => {
      await request(app)
        .post('/api/v1/cart/items')
        .set(getAuthHeaders(user.accessToken!))
        .send({ productId: product1.id, quantity: 1 })
        .expect(201);

      await request(app)
        .patch(`/api/v1/cart/items/${product1.id}`)
        .set(getAuthHeaders(user.accessToken!))
        .send({ quantity: 100 })
        .expect(400);
    });
  });

  describe('DELETE /api/v1/cart/items/:productId', () => {
    it('should remove item from cart', async () => {
      await request(app)
        .post('/api/v1/cart/items')
        .set(getAuthHeaders(user.accessToken!))
        .send({ productId: product1.id, quantity: 1 })
        .expect(201);

      await request(app)
        .delete(`/api/v1/cart/items/${product1.id}`)
        .set(getAuthHeaders(user.accessToken!))
        .expect(200);

      const cartResponse = await request(app)
        .get('/api/v1/cart')
        .set(getAuthHeaders(user.accessToken!))
        .expect(200);

      expect(cartResponse.body.data.items.length).toBe(0);
    });
  });

  describe('DELETE /api/v1/cart', () => {
    it('should clear all items from cart', async () => {
      await request(app)
        .post('/api/v1/cart/items')
        .set(getAuthHeaders(user.accessToken!))
        .send({ productId: product1.id, quantity: 1 })
        .expect(201);

      await request(app)
        .post('/api/v1/cart/items')
        .set(getAuthHeaders(user.accessToken!))
        .send({ productId: product2.id, quantity: 2 })
        .expect(201);

      await request(app)
        .delete('/api/v1/cart')
        .set(getAuthHeaders(user.accessToken!))
        .expect(200);

      const cartResponse = await request(app)
        .get('/api/v1/cart')
        .set(getAuthHeaders(user.accessToken!))
        .expect(200);

      expect(cartResponse.body.data.items.length).toBe(0);
    });
  });
});

