import request from 'supertest';
import app from '../../src/app';
import { testPrisma } from '../helpers/test-db';

describe('Rooms API', () => {
  beforeEach(async () => {
    await testPrisma.room.deleteMany();
  });

  describe('GET /api/v1/rooms', () => {
    it('should get all rooms', async () => {
      // Create a room
      await testPrisma.room.create({
        data: {
          name: 'Modern Living Room',
          description: 'A contemporary living space',
          image: '/images/room.jpg',
          hotspots: [
            { x: 25, y: 45, productId: '00000000-0000-0000-0000-000000000000' }
          ]
        }
      });

      const response = await request(app)
        .get('/api/v1/rooms')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.data.length).toBeGreaterThan(0);
    });

    it('should return empty array when no rooms exist', async () => {
      const response = await request(app)
        .get('/api/v1/rooms')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.length).toBe(0);
    });
  });

  describe('GET /api/v1/rooms/:id', () => {
    it('should get room by ID', async () => {
      const room = await testPrisma.room.create({
        data: {
          name: 'Modern Living Room',
          description: 'A contemporary living space',
          image: '/images/room.jpg',
          hotspots: [
            { x: 25, y: 45, productId: '00000000-0000-0000-0000-000000000000' }
          ]
        }
      });

      const response = await request(app)
        .get(`/api/v1/rooms/${room.id}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.id).toBe(room.id);
      expect(response.body.data.name).toBe(room.name);
      expect(response.body.data.hotspots).toBeDefined();
    });

    it('should return 404 for non-existent room', async () => {
      const fakeId = '00000000-0000-0000-0000-000000000000';
      
      await request(app)
        .get(`/api/v1/rooms/${fakeId}`)
        .expect(404);
    });
  });
});

