import request from 'supertest';
import app from '../../src/app';
import { testPrisma } from '../helpers/test-db';
import { registerTestUser, getAuthHeaders } from '../helpers/test-auth';
import { createCategory } from '../fixtures/categories.fixture';
import { createProduct } from '../fixtures/products.fixture';

describe('Reviews API', () => {
  let user: any;
  let category: any;
  let product: any;

  beforeEach(async () => {
    await testPrisma.user.deleteMany();
    await testPrisma.product.deleteMany();
    await testPrisma.category.deleteMany();
    await testPrisma.review.deleteMany();

    // Create user
    user = await registerTestUser();

    // Create category and product
    category = await createCategory();
    product = await createProduct(category.id);
  });

  describe('GET /api/v1/products/:id/reviews', () => {
    it('should get reviews for a product', async () => {
      // Create a review first
      await testPrisma.review.create({
        data: {
          productId: product.id,
          userId: user.id,
          rating: 5,
          title: 'Great product!',
          comment: 'I love this product.'
        }
      });

      const response = await request(app)
        .get(`/api/v1/products/${product.id}/reviews`)
        .query({ page: 1, limit: 20 })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeDefined();
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.data.length).toBeGreaterThan(0);
      expect(response.body.meta).toBeDefined();
    });

    it('should return empty array for product with no reviews', async () => {
      const response = await request(app)
        .get(`/api/v1/products/${product.id}/reviews`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.data.length).toBe(0);
    });
  });

  describe('GET /api/v1/products/:id/reviews/me', () => {
    it('should get user\'s review for a product', async () => {
      // Create a review
      await testPrisma.review.create({
        data: {
          productId: product.id,
          userId: user.id,
          rating: 5,
          title: 'Great product!',
          comment: 'I love this product.'
        }
      });

      const response = await request(app)
        .get(`/api/v1/products/${product.id}/reviews/me`)
        .set(getAuthHeaders(user.accessToken!))
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.rating).toBe(5);
      expect(response.body.data.user.id).toBe(user.id);
    });

    it('should return 404 when user has not reviewed', async () => {
      await request(app)
        .get(`/api/v1/products/${product.id}/reviews/me`)
        .set(getAuthHeaders(user.accessToken!))
        .expect(404);
    });
  });

  describe('POST /api/v1/products/:id/reviews', () => {
    it('should create a review', async () => {
      const response = await request(app)
        .post(`/api/v1/products/${product.id}/reviews`)
        .set(getAuthHeaders(user.accessToken!))
        .send({
          rating: 5,
          title: 'Excellent product!',
          comment: 'This product exceeded my expectations.'
        })
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.rating).toBe(5);
      expect(response.body.data.title).toBe('Excellent product!');
    });

    it('should return 409 when user already reviewed', async () => {
      await request(app)
        .post(`/api/v1/products/${product.id}/reviews`)
        .set(getAuthHeaders(user.accessToken!))
        .send({
          rating: 5,
          title: 'First review',
          comment: 'First comment'
        })
        .expect(201);

      await request(app)
        .post(`/api/v1/products/${product.id}/reviews`)
        .set(getAuthHeaders(user.accessToken!))
        .send({
          rating: 4,
          title: 'Second review',
          comment: 'Second comment'
        })
        .expect(409);
    });

    it('should return 400 for invalid rating', async () => {
      await request(app)
        .post(`/api/v1/products/${product.id}/reviews`)
        .set(getAuthHeaders(user.accessToken!))
        .send({
          rating: 10, // Invalid: should be 1-5
          title: 'Review',
          comment: 'Comment'
        })
        .expect(400);
    });

    it('should update product rating after review', async () => {
      // Create review
      await request(app)
        .post(`/api/v1/products/${product.id}/reviews`)
        .set(getAuthHeaders(user.accessToken!))
        .send({
          rating: 5,
          title: 'Great!',
          comment: 'This is a great product comment with at least 10 characters'
        })
        .expect(201);

      // Check product rating was updated
      const updatedProduct = await testPrisma.product.findUnique({
        where: { id: product.id }
      });

      expect(updatedProduct?.rating).toBe(5);
      expect(updatedProduct?.reviewsCount).toBe(1);
    });
  });

  describe('PATCH /api/v1/reviews/:id/helpful', () => {
    it('should mark review as helpful', async () => {
      const review = await testPrisma.review.create({
        data: {
          productId: product.id,
          userId: user.id,
          rating: 5,
          title: 'Great product!',
          comment: 'I love this product.'
        }
      });

      const response = await request(app)
        .patch(`/api/v1/reviews/${review.id}/helpful`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.helpful).toBe(1);
    });

    it('should increment helpful count on multiple calls', async () => {
      const review = await testPrisma.review.create({
        data: {
          productId: product.id,
          userId: user.id,
          rating: 5,
          title: 'Great product!',
          comment: 'I love this product.'
        }
      });

      await request(app)
        .patch(`/api/v1/reviews/${review.id}/helpful`)
        .expect(200);

      const response = await request(app)
        .patch(`/api/v1/reviews/${review.id}/helpful`)
        .expect(200);

      expect(response.body.data.helpful).toBe(2);
    });
  });
});

