import { Request, Response, NextFunction } from 'express';
import {
  getAdminStats,
  getAdminOrders,
  getAdminUsers,
  getAdminProducts,
} from '../services/admin.service';
import { sendSuccess, sendPaginated } from '../utils/api-response';

/**
 * Get admin dashboard statistics
 */
export const getAdminStatsController = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const dateRange = (req.query.dateRange as string) || '30d';
    const stats = await getAdminStats(dateRange);
    sendSuccess(res, stats, 'Admin statistics retrieved successfully');
  } catch (error) {
    next(error);
  }
};

/**
 * Get all orders for admin
 */
export const getAdminOrdersController = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const page = req.query.page ? Number(req.query.page) : 1;
    const limit = req.query.limit ? Number(req.query.limit) : 20;
    const status = req.query.status as string | undefined;
    const startDate = req.query.startDate ? new Date(req.query.startDate as string) : undefined;
    const endDate = req.query.endDate ? new Date(req.query.endDate as string) : undefined;

    const result = await getAdminOrders(page, limit, status, startDate, endDate);
    sendPaginated(res, result.orders, result.meta, 'Orders retrieved successfully');
  } catch (error) {
    next(error);
  }
};

/**
 * Get all users for admin
 */
export const getAdminUsersController = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const page = req.query.page ? Number(req.query.page) : 1;
    const limit = req.query.limit ? Number(req.query.limit) : 20;
    const search = req.query.search as string | undefined;

    const result = await getAdminUsers(page, limit, search);
    sendPaginated(res, result.users, result.meta, 'Users retrieved successfully');
  } catch (error) {
    next(error);
  }
};

/**
 * Get all products for admin
 */
export const getAdminProductsController = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const page = req.query.page ? Number(req.query.page) : 1;
    const limit = req.query.limit ? Number(req.query.limit) : 20;
    const search = req.query.search as string | undefined;
    const lowStock = req.query.lowStock === 'true';

    const result = await getAdminProducts(page, limit, search, lowStock);
    sendPaginated(res, result.products, result.meta, 'Products retrieved successfully');
  } catch (error) {
    next(error);
  }
};

