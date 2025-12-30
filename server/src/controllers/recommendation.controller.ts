import { Request, Response, NextFunction } from 'express';
import {
  getProductRecommendations,
  getUserRecommendations,
  getTrendingProducts,
} from '../services/recommendation.service';
import { sendSuccess } from '../utils/api-response';
import { RequestWithUser } from '../types';

/**
 * Get product recommendations
 */
export const getProductRecommendationsController = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 8;
    const recommendations = await getProductRecommendations(id, limit);
    sendSuccess(res, recommendations, 'Recommendations retrieved successfully');
  } catch (error) {
    next(error);
  }
};

/**
 * Get user recommendations
 */
export const getUserRecommendationsController = async (
  req: RequestWithUser,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.user!.id;
    const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 8;
    const recommendations = await getUserRecommendations(userId, limit);
    sendSuccess(res, recommendations, 'User recommendations retrieved successfully');
  } catch (error) {
    next(error);
  }
};

/**
 * Get trending products
 */
export const getTrendingProductsController = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 8;
    const products = await getTrendingProducts(limit);
    sendSuccess(res, products, 'Trending products retrieved successfully');
  } catch (error) {
    next(error);
  }
};

