import { Request, Response, NextFunction } from 'express';
import { getRooms, getRoomById } from '../services/room.service';
import { sendSuccess } from '../utils/api-response';

/**
 * Get all rooms
 */
export const getRoomsController = async (
  _req: unknown,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const rooms = await getRooms();
    sendSuccess(res, rooms, 'Rooms retrieved successfully');
  } catch (error) {
    next(error);
  }
};

/**
 * Get single room by ID
 */
export const getRoomByIdController = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    const room = await getRoomById(id);
    sendSuccess(res, room, 'Room retrieved successfully');
  } catch (error) {
    next(error);
  }
};

