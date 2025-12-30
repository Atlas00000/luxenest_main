/**
 * Rooms API service
 */

import { apiGet, ApiClientError } from './client';

export interface RoomProduct {
  id: string;
  roomId: string;
  productId: string;
  position: {
    x: number;
    y: number;
  };
  product: {
    id: string;
    name: string;
    description: string;
    price: number;
    images: string[];
    category?: {
      id: string;
      name: string;
      slug: string;
    };
  };
}

export interface Room {
  id: string;
  name: string;
  description: string;
  image: string;
  products: RoomProduct[];
  createdAt: string;
  updatedAt: string;
}

/**
 * Get all rooms
 */
export const getRooms = async (): Promise<Room[]> => {
  try {
    return await apiGet<Room[]>('/rooms');
  } catch (error) {
    if (error instanceof ApiClientError) {
      throw error;
    }
    throw new ApiClientError('Failed to fetch rooms');
  }
};

/**
 * Get single room by ID
 */
export const getRoomById = async (id: string): Promise<Room> => {
  try {
    return await apiGet<Room>(`/rooms/${id}`);
  } catch (error) {
    if (error instanceof ApiClientError) {
      throw error;
    }
    throw new ApiClientError('Failed to fetch room');
  }
};

