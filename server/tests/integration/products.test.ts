import request from 'supertest';
import app from '../../src/app';
import { testPrisma } from '../helpers/test-db';
import { getAuthHeaders, registerTestUser } from '../helpers/test-auth';
import { createCategory } from '../fixtures/categories.fixture';
import { createProduct, createProductFixture } from '../fixtures/products.fixture';

describe('Products API', () => {
  let category: any;
  let adminUser: any;
  let regularUser: any;

  beforeEach(async () => {
    await testPrisma.user.deleteMany();
    await testPrisma.product.deleteMany();
    await testPrisma.category.deleteMany();

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

    adminUser = {
      ...adminResponse.body.data.user,
      password: adminData.password,
      accessToken: adminResponse.body.data.accessToken,
      refreshToken: adminResponse.body.data.refreshToken
    };

    // Login as admin to get fresh token
    const adminLogin = await request(app)
      .post('/api/v1/auth/login')
      .send({ email: adminData.email, password: adminData.password })
      .expect(200);
    
    adminUser.accessToken = adminLogin.body.data.accessToken;

    // Create regular user
    regularUser = await registerTestUser();

    // Create category
    category = await createCategory();
  });

  describe('GET /api/v1/products', () => {
    it('should get all products with pagination', async () => {
      // Create some products
      await createProduct(category.id);
      await createProduct(category.id);
      await createProduct(category.id);

      const response = await request(app)
        .get('/api/v1/products')
        .query({ page: 1, limit: 20 })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeDefined();
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.meta).toBeDefined();
      expect(response.body.meta.page).toBe(1);
      expect(response.body.meta.limit).toBe(20);
    });

    it('should filter products by category', async () => {
      const category2 = await createCategory();
      await createProduct(category.id);
      await createProduct(category2.id);

      const response = await request(app)
        .get('/api/v1/products')
        .query({ categoryId: category.id })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.length).toBeGreaterThan(0);
      response.body.data.forEach((product: any) => {
        expect(product.category.id).toBe(category.id);
      });
    });

    it('should filter products by price range', async () => {
      await createProduct(category.id, { price: 50 });
      await createProduct(category.id, { price: 150 });
      await createProduct(category.id, { price: 250 });

      const response = await request(app)
        .get('/api/v1/products')
        .query({ minPrice: 100, maxPrice: 200 })
        .expect(200);

      expect(response.body.success).toBe(true);
      response.body.data.forEach((product: any) => {
        const price = parseFloat(product.price);
        expect(price).toBeGreaterThanOrEqual(100);
        expect(price).toBeLessThanOrEqual(200);
      });
    });

    it('should filter featured products', async () => {
      await createProduct(category.id, { featured: true });
      await createProduct(category.id, { featured: false });

      const response = await request(app)
        .get('/api/v1/products')
        .query({ featured: 'true' })
        .expect(200);

      expect(response.body.success).toBe(true);
      response.body.data.forEach((product: any) => {
        expect(product.featured).toBe(true);
      });
    });

    it('should sort products by price', async () => {
      await createProduct(category.id, { price: 300 });
      await createProduct(category.id, { price: 100 });
      await createProduct(category.id, { price: 200 });

      const response = await request(app)
        .get('/api/v1/products')
        .query({ sortBy: 'price', sortOrder: 'asc' })
        .expect(200);

      expect(response.body.success).toBe(true);
      const prices = response.body.data.map((p: any) => parseFloat(p.price));
      expect(prices).toEqual([...prices].sort((a, b) => a - b));
    });

    it('should search products by name', async () => {
      await createProduct(category.id, { name: 'Luxury Chair' });
      await createProduct(category.id, { name: 'Modern Table' });
      await createProduct(category.id, { name: 'Comfort Sofa' });

      const response = await request(app)
        .get('/api/v1/products')
        .query({ search: 'Chair' })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.length).toBeGreaterThan(0);
      expect(response.body.data[0].name).toContain('Chair');
    });
  });

  describe('GET /api/v1/products/:id', () => {
    it('should get product by ID', async () => {
      const product = await createProduct(category.id);

      const response = await request(app)
        .get(`/api/v1/products/${product.id}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.id).toBe(product.id);
      expect(response.body.data.name).toBe(product.name);
      expect(response.body.data.category).toBeDefined();
    });

    it('should return 404 for non-existent product', async () => {
      const fakeId = '00000000-0000-0000-0000-000000000000';
      
      await request(app)
        .get(`/api/v1/products/${fakeId}`)
        .expect(404);
    });
  });

  describe('GET /api/v1/products/featured', () => {
    it('should get featured products', async () => {
      await createProduct(category.id, { featured: true });
      await createProduct(category.id, { featured: true });
      await createProduct(category.id, { featured: false });

      const response = await request(app)
        .get('/api/v1/products/featured')
        .query({ limit: 10 })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
      response.body.data.forEach((product: any) => {
        expect(product.featured).toBe(true);
      });
    });
  });

  describe('GET /api/v1/products/new', () => {
    it('should get new products', async () => {
      await createProduct(category.id, { isNew: true });
      await createProduct(category.id, { isNew: true });

      const response = await request(app)
        .get('/api/v1/products/new')
        .query({ limit: 10 })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
      response.body.data.forEach((product: any) => {
        expect(product.isNew).toBe(true);
      });
    });
  });

  describe('GET /api/v1/products/sale', () => {
    it('should get sale products', async () => {
      await createProduct(category.id, { onSale: true });
      await createProduct(category.id, { onSale: true });

      const response = await request(app)
        .get('/api/v1/products/sale')
        .query({ limit: 10 })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
      response.body.data.forEach((product: any) => {
        expect(product.onSale).toBe(true);
      });
    });
  });

  describe('POST /api/v1/products (Admin)', () => {
    it('should create a product as admin', async () => {
      const productData = {
        ...createProductFixture(),
        categoryId: category.id
      };

      const response = await request(app)
        .post('/api/v1/products')
        .set(getAuthHeaders(adminUser.accessToken!))
        .send(productData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.id).toBeDefined();
      expect(response.body.data.name).toBe(productData.name);
    });

    it('should return 403 for regular user', async () => {
      const productData = {
        ...createProductFixture(),
        categoryId: category.id
      };

      // First verify the token is valid by checking it's not 401
      const response = await request(app)
        .post('/api/v1/products')
        .set(getAuthHeaders(regularUser.accessToken!))
        .send(productData);

      // Should be 403 (Forbidden) not 401 (Unauthorized)
      expect(response.status).toBe(403);
    });

    it('should return 401 without authentication', async () => {
      const productData = {
        ...createProductFixture(),
        categoryId: category.id
      };

      await request(app)
        .post('/api/v1/products')
        .send(productData)
        .expect(401);
    });
  });

  describe('PATCH /api/v1/products/:id (Admin)', () => {
    it('should update a product as admin', async () => {
      const product = await createProduct(category.id);

      const response = await request(app)
        .patch(`/api/v1/products/${product.id}`)
        .set(getAuthHeaders(adminUser.accessToken!))
        .send({ name: 'Updated Product Name', price: 199.99 })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.name).toBe('Updated Product Name');
    });

    it('should return 403 for regular user', async () => {
      const product = await createProduct(category.id);

      await request(app)
        .patch(`/api/v1/products/${product.id}`)
        .set(getAuthHeaders(regularUser.accessToken!))
        .send({ name: 'Updated Name' })
        .expect(403);
    });
  });

  describe('DELETE /api/v1/products/:id (Admin)', () => {
    it('should delete a product as admin', async () => {
      const product = await createProduct(category.id);

      await request(app)
        .delete(`/api/v1/products/${product.id}`)
        .set(getAuthHeaders(adminUser.accessToken!))
        .expect(200);

      // Verify product is deleted
      const deletedProduct = await testPrisma.product.findUnique({
        where: { id: product.id }
      });
      expect(deletedProduct).toBeNull();
    });

    it('should return 403 for regular user', async () => {
      const product = await createProduct(category.id);

      await request(app)
        .delete(`/api/v1/products/${product.id}`)
        .set(getAuthHeaders(regularUser.accessToken!))
        .expect(403);
    });
  });
});

