/**
 * Cart API service
 */

import { apiGet, apiPost, apiPatch, apiDelete, ApiClientError } from './client';

export interface CartItem {
  id: string;
  cartId: string;
  productId: string;
  quantity: number;
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
    stock: number;
    rating: number;
    reviewsCount: number;
  };
  createdAt: string;
  updatedAt: string;
}

export interface Cart {
  id: string;
  userId: string;
  items: CartItem[];
  updatedAt: string;
}

export interface AddCartItemData {
  productId: string;
  quantity: number;
}

export interface UpdateCartItemData {
  quantity: number;
}

/**
 * Get user's cart
 */
export const getCart = async (): Promise<Cart> => {
  try {
    return await apiGet<Cart>('/cart');
  } catch (error) {
    if (error instanceof ApiClientError) {
      throw error;
    }
    throw new ApiClientError('Failed to fetch cart');
  }
};

/**
 * Add item to cart
 */
export const addCartItem = async (data: AddCartItemData): Promise<CartItem> => {
  try {
    return await apiPost<CartItem>('/cart/items', data);
  } catch (error) {
    if (error instanceof ApiClientError) {
      throw error;
    }
    throw new ApiClientError('Failed to add item to cart');
  }
};

/**
 * Update cart item quantity
 */
export const updateCartItem = async (productId: string, data: UpdateCartItemData): Promise<CartItem> => {
  try {
    return await apiPatch<CartItem>(`/cart/items/${productId}`, data);
  } catch (error) {
    if (error instanceof ApiClientError) {
      throw error;
    }
    throw new ApiClientError('Failed to update cart item');
  }
};

/**
 * Remove item from cart
 */
export const removeCartItem = async (productId: string): Promise<void> => {
  try {
    await apiDelete(`/cart/items/${productId}`);
  } catch (error) {
    if (error instanceof ApiClientError) {
      throw error;
    }
    throw new ApiClientError('Failed to remove item from cart');
  }
};

/**
 * Clear cart
 */
export const clearCart = async (): Promise<void> => {
  try {
    await apiDelete('/cart');
  } catch (error) {
    if (error instanceof ApiClientError) {
      throw error;
    }
    throw new ApiClientError('Failed to clear cart');
  }
};

