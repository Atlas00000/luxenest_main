import { Response, NextFunction } from 'express';
import {
  createOrder,
  getUserOrders,
  getOrderById,
  updateOrderStatus,
} from '../services/order.service';
import { sendSuccess, sendPaginated } from '../utils/api-response';
import { RequestWithUser } from '../types';

/**
 * Create order from cart
 */
export const createOrderController = async (
  req: RequestWithUser,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.user!.id;
    const order = await createOrder(userId, req.body);
    sendSuccess(res, order, 'Order created successfully', 201);
  } catch (error) {
    next(error);
  }
};

/**
 * Get user's orders
 */
export const getUserOrdersController = async (
  req: RequestWithUser,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.user!.id;
    const page = req.query.page ? Number(req.query.page) : 1;
    const limit = req.query.limit ? Number(req.query.limit) : 10;

    const result = await getUserOrders(userId, page, limit);
    sendPaginated(res, result.orders, result.meta, 'Orders retrieved successfully');
  } catch (error) {
    next(error);
  }
};

/**
 * Get single order by ID
 */
export const getOrderByIdController = async (
  req: RequestWithUser,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.user!.id;
    const { id } = req.params;
    const order = await getOrderById(userId, id);
    sendSuccess(res, order, 'Order retrieved successfully');
  } catch (error) {
    next(error);
  }
};

/**
 * Update order status (admin only)
 */
export const updateOrderStatusController = async (
  req: RequestWithUser,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const order = await updateOrderStatus(id, status);
    sendSuccess(res, order, 'Order status updated successfully');
  } catch (error) {
    next(error);
  }
};

