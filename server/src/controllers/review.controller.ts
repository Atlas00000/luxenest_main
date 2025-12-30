import { Request, Response, NextFunction } from 'express';
import {
  getProductReviews,
  createReview,
  markReviewHelpful,
  getUserReview,
} from '../services/review.service';
import { sendSuccess, sendPaginated } from '../utils/api-response';
import { RequestWithUser } from '../types';

/**
 * Get reviews for a product
 */
export const getProductReviewsController = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    const page = req.query.page ? Number(req.query.page) : 1;
    const limit = req.query.limit ? Number(req.query.limit) : 10;

    const result = await getProductReviews(id, page, limit);
    sendPaginated(res, result.reviews, result.meta, 'Reviews retrieved successfully');
  } catch (error) {
    next(error);
  }
};

/**
 * Create review for a product
 */
export const createReviewController = async (
  req: RequestWithUser,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.user!.id;
    const { id } = req.params;
    const review = await createReview(userId, id, req.body);
    sendSuccess(res, review, 'Review created successfully', 201);
  } catch (error) {
    next(error);
  }
};

/**
 * Mark review as helpful
 */
export const markReviewHelpfulController = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    const review = await markReviewHelpful(id);
    sendSuccess(res, review, 'Review marked as helpful');
  } catch (error) {
    next(error);
  }
};

/**
 * Get user's review for a product
 */
export const getUserReviewController = async (
  req: RequestWithUser,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.user!.id;
    const { id } = req.params;
    const review = await getUserReview(userId, id);
    sendSuccess(res, review, 'User review retrieved successfully');
  } catch (error) {
    next(error);
  }
};

