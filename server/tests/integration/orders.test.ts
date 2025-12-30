import request from 'supertest';
import app from '../../src/app';
import { testPrisma } from '../helpers/test-db';
import { registerTestUser, getAuthHeaders } from '../helpers/test-auth';
import { createCategory } from '../fixtures/categories.fixture';
import { createProduct } from '../fixtures/products.fixture';

describe('Orders API', () => {
  let user: any;
  let adminUser: any;
  let category: any;
  let product1: any;

  beforeEach(async () => {
    await testPrisma.user.deleteMany();
    await testPrisma.product.deleteMany();
    await testPrisma.category.deleteMany();
    await testPrisma.orderItem.deleteMany();
    await testPrisma.order.deleteMany();
    await testPrisma.cartItem.deleteMany();
    await testPrisma.cart.deleteMany();

    // Create user
    user = await registerTestUser();

    // Create admin user via API
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

    // Create category and products
    category = await createCategory();
    product1 = await createProduct(category.id, { stock: 10, price: 99.99 });
  });

  describe('POST /api/v1/orders', () => {
    it('should create order from cart', async () => {
      // Add items to cart
      await request(app)
        .post('/api/v1/cart/items')
        .set(getAuthHeaders(user.accessToken!))
        .send({ productId: product1.id, quantity: 2 })
        .expect(201);

      const response = await request(app)
        .post('/api/v1/orders')
        .set(getAuthHeaders(user.accessToken!))
        .send({
          shippingAddress: {
            fullName: 'John Doe',
            address: '123 Main St',
            city: 'New York',
            state: 'NY',
            zipCode: '10001',
            country: 'USA'
          },
          paymentMethod: 'credit_card'
        })
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.id).toBeDefined();
      expect(response.body.data.items.length).toBe(1);
      expect(response.body.data.subtotal).toBeDefined();
      expect(response.body.data.shipping).toBeDefined();
      expect(response.body.data.tax).toBeDefined();
      expect(response.body.data.total).toBeDefined();
      expect(response.body.data.status).toBe('PENDING');
    });

    it('should clear cart after creating order', async () => {
      // Add items to cart
      await request(app)
        .post('/api/v1/cart/items')
        .set(getAuthHeaders(user.accessToken!))
        .send({ productId: product1.id, quantity: 1 })
        .expect(201);

      await request(app)
        .post('/api/v1/orders')
        .set(getAuthHeaders(user.accessToken!))
        .send({
          shippingAddress: {
            fullName: 'John Doe',
            address: '123 Main St',
            city: 'New York',
            state: 'NY',
            zipCode: '10001',
            country: 'USA'
          },
          paymentMethod: 'credit_card'
        })
        .expect(201);

      // Verify cart is empty
      const cartResponse = await request(app)
        .get('/api/v1/cart')
        .set(getAuthHeaders(user.accessToken!))
        .expect(200);

      expect(cartResponse.body.data.items.length).toBe(0);
    });

    it('should return 400 when cart is empty', async () => {
      await request(app)
        .post('/api/v1/orders')
        .set(getAuthHeaders(user.accessToken!))
        .send({
          shippingAddress: {
            fullName: 'John Doe',
            address: '123 Main St',
            city: 'New York',
            state: 'NY',
            zipCode: '10001',
            country: 'USA'
          },
          paymentMethod: 'credit_card'
        })
        .expect(400);
    });

    it('should return 400 when product is out of stock', async () => {
      // Add more items than available stock
      await request(app)
        .post('/api/v1/cart/items')
        .set(getAuthHeaders(user.accessToken!))
        .send({ productId: product1.id, quantity: 100 })
        .expect(400);
    });

    it('should return 401 without authentication', async () => {
      await request(app)
        .post('/api/v1/orders')
        .send({
          shippingAddress: {
            fullName: 'John Doe',
            address: '123 Main St',
            city: 'New York',
            state: 'NY',
            zipCode: '10001',
            country: 'USA'
          },
          paymentMethod: 'credit_card'
        })
        .expect(401);
    });
  });

  describe('GET /api/v1/orders', () => {
    it('should get user orders with pagination', async () => {
      // Create an order first
      await request(app)
        .post('/api/v1/cart/items')
        .set(getAuthHeaders(user.accessToken!))
        .send({ productId: product1.id, quantity: 1 })
        .expect(201);

      await request(app)
        .post('/api/v1/orders')
        .set(getAuthHeaders(user.accessToken!))
        .send({
          shippingAddress: {
            fullName: 'John Doe',
            address: '123 Main St',
            city: 'New York',
            state: 'NY',
            zipCode: '10001',
            country: 'USA'
          },
          paymentMethod: 'credit_card'
        })
        .expect(201);

      const response = await request(app)
        .get('/api/v1/orders')
        .set(getAuthHeaders(user.accessToken!))
        .query({ page: 1, limit: 20 })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeDefined();
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.data.length).toBeGreaterThan(0);
      expect(response.body.meta).toBeDefined();
    });

    it('should filter orders by status', async () => {
      // Create orders with different statuses
      await request(app)
        .post('/api/v1/cart/items')
        .set(getAuthHeaders(user.accessToken!))
        .send({ productId: product1.id, quantity: 1 })
        .expect(201);

      await request(app)
        .post('/api/v1/orders')
        .set(getAuthHeaders(user.accessToken!))
        .send({
          shippingAddress: {
            fullName: 'John Doe',
            address: '123 Main St',
            city: 'New York',
            state: 'NY',
            zipCode: '10001',
            country: 'USA'
          },
          paymentMethod: 'credit_card'
        })
        .expect(201);

      const response = await request(app)
        .get('/api/v1/orders')
        .set(getAuthHeaders(user.accessToken!))
        .query({ status: 'PENDING' })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
      response.body.data.forEach((order: any) => {
        expect(order.status).toBe('PENDING');
      });
    });
  });

  describe('GET /api/v1/orders/:id', () => {
    it('should get order by ID', async () => {
      // Create an order
      await request(app)
        .post('/api/v1/cart/items')
        .set(getAuthHeaders(user.accessToken!))
        .send({ productId: product1.id, quantity: 1 })
        .expect(201);

      const orderResponse = await request(app)
        .post('/api/v1/orders')
        .set(getAuthHeaders(user.accessToken!))
        .send({
          shippingAddress: {
            fullName: 'John Doe',
            address: '123 Main St',
            city: 'New York',
            state: 'NY',
            zipCode: '10001',
            country: 'USA'
          },
          paymentMethod: 'credit_card'
        })
        .expect(201);

      const orderId = orderResponse.body.data.id;

      const response = await request(app)
        .get(`/api/v1/orders/${orderId}`)
        .set(getAuthHeaders(user.accessToken!))
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.id).toBe(orderId);
      expect(response.body.data.items).toBeDefined();
    });

    it('should return 404 for non-existent order', async () => {
      const fakeId = '00000000-0000-0000-0000-000000000000';
      
      await request(app)
        .get(`/api/v1/orders/${fakeId}`)
        .set(getAuthHeaders(user.accessToken!))
        .expect(404);
    });
  });

  describe('PATCH /api/v1/orders/:id/status (Admin)', () => {
    it('should update order status as admin', async () => {
      // Create order
      await request(app)
        .post('/api/v1/cart/items')
        .set(getAuthHeaders(user.accessToken!))
        .send({ productId: product1.id, quantity: 1 })
        .expect(201);

      const orderResponse = await request(app)
        .post('/api/v1/orders')
        .set(getAuthHeaders(user.accessToken!))
        .send({
          shippingAddress: {
            fullName: 'John Doe',
            address: '123 Main St',
            city: 'New York',
            state: 'NY',
            zipCode: '10001',
            country: 'USA'
          },
          paymentMethod: 'credit_card'
        })
        .expect(201);

      const orderId = orderResponse.body.data.id;

      const adminToken = adminUser.accessToken;

      const response = await request(app)
        .patch(`/api/v1/orders/${orderId}/status`)
        .set(getAuthHeaders(adminToken))
        .send({ status: 'SHIPPED' })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.status).toBe('SHIPPED');
    });

    it('should return 403 for regular user', async () => {
      // Create order
      await request(app)
        .post('/api/v1/cart/items')
        .set(getAuthHeaders(user.accessToken!))
        .send({ productId: product1.id, quantity: 1 })
        .expect(201);

      const orderResponse = await request(app)
        .post('/api/v1/orders')
        .set(getAuthHeaders(user.accessToken!))
        .send({
          shippingAddress: {
            fullName: 'John Doe',
            address: '123 Main St',
            city: 'New York',
            state: 'NY',
            zipCode: '10001',
            country: 'USA'
          },
          paymentMethod: 'credit_card'
        })
        .expect(201);

      const orderId = orderResponse.body.data.id;

      await request(app)
        .patch(`/api/v1/orders/${orderId}/status`)
        .set(getAuthHeaders(user.accessToken!))
        .send({ status: 'SHIPPED' })
        .expect(403);
    });
  });
});

