import request from 'supertest';
import app from '../../src/app';
import { testPrisma } from '../helpers/test-db';
import { registerTestUser, getAuthHeaders } from '../helpers/test-auth';

describe('Users API', () => {
  let user: any;

  beforeEach(async () => {
    await testPrisma.user.deleteMany();
    user = await registerTestUser();
  });

  describe('GET /api/v1/users/me', () => {
    it('should get current user profile', async () => {
      const response = await request(app)
        .get('/api/v1/users/me')
        .set(getAuthHeaders(user.accessToken!))
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.id).toBe(user.id);
      expect(response.body.data.email).toBe(user.email);
      expect(response.body.data.name).toBe(user.name);
    });

    it('should return 401 without authentication', async () => {
      await request(app)
        .get('/api/v1/users/me')
        .expect(401);
    });
  });

  describe('PATCH /api/v1/users/me', () => {
    it('should update user profile', async () => {
      const response = await request(app)
        .patch('/api/v1/users/me')
        .set(getAuthHeaders(user.accessToken!))
        .send({
          name: 'Updated Name',
          avatar: 'https://example.com/avatar.jpg'
        })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.name).toBe('Updated Name');
      expect(response.body.data.avatar).toBe('https://example.com/avatar.jpg');
    });

    it('should update only provided fields', async () => {
      const response = await request(app)
        .patch('/api/v1/users/me')
        .set(getAuthHeaders(user.accessToken!))
        .send({
          name: 'New Name'
        })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.name).toBe('New Name');
      expect(response.body.data.email).toBe(user.email); // Email should remain unchanged
    });
  });

  describe('PATCH /api/v1/users/me/password', () => {
    it('should change user password', async () => {
      const response = await request(app)
        .patch('/api/v1/users/me/password')
        .set(getAuthHeaders(user.accessToken!))
        .send({
          currentPassword: user.password,
          newPassword: 'NewPassword123!'
        })
        .expect(200);

      expect(response.body.success).toBe(true);

      // Verify new password works
      const loginResponse = await request(app)
        .post('/api/v1/auth/login')
        .send({
          email: user.email,
          password: 'NewPassword123!'
        })
        .expect(200);

      expect(loginResponse.body.success).toBe(true);
    });

    it('should return 401 for wrong current password', async () => {
      await request(app)
        .patch('/api/v1/users/me/password')
        .set(getAuthHeaders(user.accessToken!))
        .send({
          currentPassword: 'WrongPassword123!',
          newPassword: 'NewPassword123!'
        })
        .expect(401);
    });

    it('should return 400 for invalid new password', async () => {
      await request(app)
        .patch('/api/v1/users/me/password')
        .set(getAuthHeaders(user.accessToken!))
        .send({
          currentPassword: user.password,
          newPassword: 'weak' // Too weak
        })
        .expect(400);
    });
  });
});

