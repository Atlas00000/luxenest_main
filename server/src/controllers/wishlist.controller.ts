import { Response, NextFunction } from 'express';
import {
  getWishlist,
  addWishlistItem,
  removeWishlistItem,
  isInWishlist,
} from '../services/wishlist.service';
import { sendSuccess } from '../utils/api-response';
import { RequestWithUser } from '../types';

/**
 * Get user's wishlist
 */
export const getWishlistController = async (
  req: RequestWithUser,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.user!.id;
    const wishlist = await getWishlist(userId);
    sendSuccess(res, wishlist, 'Wishlist retrieved successfully');
  } catch (error) {
    next(error);
  }
};

/**
 * Add item to wishlist
 */
export const addWishlistItemController = async (
  req: RequestWithUser,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.user!.id;
    const { productId } = req.params;
    const wishlistItem = await addWishlistItem(userId, productId);
    sendSuccess(res, wishlistItem, 'Item added to wishlist successfully', 201);
  } catch (error) {
    next(error);
  }
};

/**
 * Remove item from wishlist
 */
export const removeWishlistItemController = async (
  req: RequestWithUser,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.user!.id;
    const { productId } = req.params;
    await removeWishlistItem(userId, productId);
    sendSuccess(res, null, 'Item removed from wishlist successfully');
  } catch (error) {
    next(error);
  }
};

/**
 * Check if product is in wishlist
 */
export const checkWishlistItemController = async (
  req: RequestWithUser,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.user!.id;
    const { productId } = req.params;
    const inWishlist = await isInWishlist(userId, productId);
    sendSuccess(res, { inWishlist }, 'Wishlist status retrieved successfully');
  } catch (error) {
    next(error);
  }
};

