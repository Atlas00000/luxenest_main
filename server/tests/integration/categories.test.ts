import request from 'supertest';
import app from '../../src/app';
import { testPrisma } from '../helpers/test-db';
import { getAuthHeaders, registerTestUser } from '../helpers/test-auth';
import { createCategory, createCategoryFixture } from '../fixtures/categories.fixture';
import { createProduct } from '../fixtures/products.fixture';

describe('Categories API', () => {
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
  });

  describe('GET /api/v1/categories', () => {
    it('should get all categories', async () => {
      await createCategory();
      await createCategory();
      await createCategory();

      const response = await request(app)
        .get('/api/v1/categories')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.data.length).toBeGreaterThanOrEqual(3);
    });

    it('should get featured categories only', async () => {
      await createCategory({ featured: true });
      await createCategory({ featured: true });
      await createCategory({ featured: false });

      const response = await request(app)
        .get('/api/v1/categories')
        .query({ featured: 'true' })
        .expect(200);

      expect(response.body.success).toBe(true);
      response.body.data.forEach((category: any) => {
        expect(category.featured).toBe(true);
      });
    });

    it('should include product counts', async () => {
      const category = await createCategory();
      await createProduct(category.id);
      await createProduct(category.id);

      const response = await request(app)
        .get('/api/v1/categories')
        .expect(200);

      expect(response.body.success).toBe(true);
      const foundCategory = response.body.data.find((c: any) => c.id === category.id);
      expect(foundCategory).toBeDefined();
      expect(foundCategory._count.products).toBe(2);
    });
  });

  describe('GET /api/v1/categories/:id', () => {
    it('should get category by ID', async () => {
      const category = await createCategory();

      const response = await request(app)
        .get(`/api/v1/categories/${category.id}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.id).toBe(category.id);
      expect(response.body.data.name).toBe(category.name);
    });

    it('should return 404 for non-existent category', async () => {
      const fakeId = '00000000-0000-0000-0000-000000000000';
      
      await request(app)
        .get(`/api/v1/categories/${fakeId}`)
        .expect(404);
    });
  });

  describe('GET /api/v1/categories/slug/:slug', () => {
    it('should get category by slug', async () => {
      const category = await createCategory({ slug: 'test-category-slug' });

      const response = await request(app)
        .get(`/api/v1/categories/slug/${category.slug}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.slug).toBe(category.slug);
    });

    it('should return 404 for non-existent slug', async () => {
      await request(app)
        .get('/api/v1/categories/slug/non-existent-slug')
        .expect(404);
    });
  });

  describe('POST /api/v1/categories (Admin)', () => {
    it('should create a category as admin', async () => {
      const categoryData = createCategoryFixture();

      const response = await request(app)
        .post('/api/v1/categories')
        .set(getAuthHeaders(adminUser.accessToken!))
        .send(categoryData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.id).toBeDefined();
      expect(response.body.data.name).toBe(categoryData.name);
      expect(response.body.data.slug).toBe(categoryData.slug);
    });

    it('should return 403 for regular user', async () => {
      const categoryData = createCategoryFixture();

      const response = await request(app)
        .post('/api/v1/categories')
        .set(getAuthHeaders(regularUser.accessToken!))
        .send(categoryData);

      // Should be 403 (Forbidden) not 401 (Unauthorized)
      expect(response.status).toBe(403);
    });
  });

  describe('PATCH /api/v1/categories/:id (Admin)', () => {
    it('should update a category as admin', async () => {
      const category = await createCategory();

      const response = await request(app)
        .patch(`/api/v1/categories/${category.id}`)
        .set(getAuthHeaders(adminUser.accessToken!))
        .send({ name: 'Updated Category Name', featured: true })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.name).toBe('Updated Category Name');
      expect(response.body.data.featured).toBe(true);
    });

    it('should return 403 for regular user', async () => {
      const category = await createCategory();

      await request(app)
        .patch(`/api/v1/categories/${category.id}`)
        .set(getAuthHeaders(regularUser.accessToken!))
        .send({ name: 'Updated Name' })
        .expect(403);
    });
  });

  describe('DELETE /api/v1/categories/:id (Admin)', () => {
    it('should delete a category as admin', async () => {
      const category = await createCategory();

      await request(app)
        .delete(`/api/v1/categories/${category.id}`)
        .set(getAuthHeaders(adminUser.accessToken!))
        .expect(200);

      // Verify category is deleted
      const deletedCategory = await testPrisma.category.findUnique({
        where: { id: category.id }
      });
      expect(deletedCategory).toBeNull();
    });

    it('should return 400 or 409 when deleting category with products', async () => {
      const category = await createCategory();
      await createProduct(category.id);

      const response = await request(app)
        .delete(`/api/v1/categories/${category.id}`)
        .set(getAuthHeaders(adminUser.accessToken!));

      // Accept either 400 or 409 as valid error responses
      expect([400, 409]).toContain(response.status);
      expect(response.body.success).toBe(false);
    });

    it('should return 403 for regular user', async () => {
      const category = await createCategory();

      await request(app)
        .delete(`/api/v1/categories/${category.id}`)
        .set(getAuthHeaders(regularUser.accessToken!))
        .expect(403);
    });
  });
});

