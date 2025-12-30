import prisma from '../config/database';
import { NotFoundError } from '../utils/api-error';

/**
 * Get all rooms
 */
export const getRooms = async () => {
  return prisma.room.findMany({
    orderBy: { name: 'asc' },
  });
};

/**
 * Get single room by ID
 */
export const getRoomById = async (id: string) => {
  const room = await prisma.room.findUnique({
    where: { id },
  });

  if (!room) {
    throw new NotFoundError('Room not found');
  }

  return room;
};

