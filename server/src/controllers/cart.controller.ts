import { Response, NextFunction } from 'express';
import {
  getCart,
  addCartItem,
  updateCartItem,
  removeCartItem,
  clearCart,
} from '../services/cart.service';
import { sendSuccess } from '../utils/api-response';
import { RequestWithUser } from '../types';

/**
 * Get user's cart
 */
export const getCartController = async (
  req: RequestWithUser,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.user!.id;
    const cart = await getCart(userId);
    sendSuccess(res, cart, 'Cart retrieved successfully');
  } catch (error) {
    next(error);
  }
};

/**
 * Add item to cart
 */
export const addCartItemController = async (
  req: RequestWithUser,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.user!.id;
    const cartItem = await addCartItem(userId, req.body);
    sendSuccess(res, cartItem, 'Item added to cart successfully', 201);
  } catch (error) {
    next(error);
  }
};

/**
 * Update cart item quantity
 */
export const updateCartItemController = async (
  req: RequestWithUser,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.user!.id;
    const { productId } = req.params;
    const cartItem = await updateCartItem(userId, productId, req.body);
    sendSuccess(res, cartItem, 'Cart item updated successfully');
  } catch (error) {
    next(error);
  }
};

/**
 * Remove item from cart
 */
export const removeCartItemController = async (
  req: RequestWithUser,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.user!.id;
    const { productId } = req.params;
    await removeCartItem(userId, productId);
    sendSuccess(res, null, 'Item removed from cart successfully');
  } catch (error) {
    next(error);
  }
};

/**
 * Clear cart
 */
export const clearCartController = async (
  req: RequestWithUser,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.user!.id;
    await clearCart(userId);
    sendSuccess(res, null, 'Cart cleared successfully');
  } catch (error) {
    next(error);
  }
};

