/**
 * Wishlist API service
 */

import { apiGet, apiPost, apiDelete, ApiClientError } from './client';

export interface WishlistItem {
  id: string;
  wishlistId: string;
  productId: string;
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
    featured: boolean;
    isNew: boolean;
    onSale: boolean;
    discount: number | null;
    sustainabilityScore: number | null;
  };
  createdAt: string;
}

export interface Wishlist {
  id: string;
  userId: string;
  items: WishlistItem[];
  updatedAt: string;
}

/**
 * Get user's wishlist
 */
export const getWishlist = async (): Promise<Wishlist> => {
  try {
    return await apiGet<Wishlist>('/wishlist');
  } catch (error) {
    if (error instanceof ApiClientError) {
      throw error;
    }
    throw new ApiClientError('Failed to fetch wishlist');
  }
};

/**
 * Add item to wishlist
 */
export const addWishlistItem = async (productId: string): Promise<WishlistItem> => {
  try {
    return await apiPost<WishlistItem>(`/wishlist/items/${productId}`);
  } catch (error) {
    if (error instanceof ApiClientError) {
      throw error;
    }
    throw new ApiClientError('Failed to add item to wishlist');
  }
};

/**
 * Remove item from wishlist
 */
export const removeWishlistItem = async (productId: string): Promise<void> => {
  try {
    await apiDelete(`/wishlist/items/${productId}`);
  } catch (error) {
    if (error instanceof ApiClientError) {
      throw error;
    }
    throw new ApiClientError('Failed to remove item from wishlist');
  }
};

/**
 * Check if product is in wishlist
 */
export const isInWishlist = async (productId: string): Promise<boolean> => {
  try {
    const response = await apiGet<{ inWishlist: boolean }>(`/wishlist/items/${productId}/check`);
    return response.inWishlist;
  } catch (error) {
    if (error instanceof ApiClientError) {
      throw error;
    }
    return false;
  }
};

