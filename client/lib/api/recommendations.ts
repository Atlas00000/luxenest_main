/**
 * Recommendations API service
 */

import { apiGet, ApiClientError } from './client';
import type { Product } from './products';

/**
 * Get product recommendations
 */
export const getProductRecommendations = async (productId: string, limit: number = 8): Promise<Product[]> => {
  try {
    return await apiGet<Product[]>(`/products/${productId}/recommendations?limit=${limit}`);
  } catch (error) {
    if (error instanceof ApiClientError) {
      throw error;
    }
    throw new ApiClientError('Failed to fetch recommendations');
  }
};

/**
 * Get user recommendations
 */
export const getUserRecommendations = async (limit: number = 8): Promise<Product[]> => {
  try {
    return await apiGet<Product[]>(`/user/recommendations?limit=${limit}`);
  } catch (error) {
    if (error instanceof ApiClientError) {
      throw error;
    }
    throw new ApiClientError('Failed to fetch user recommendations');
  }
};

/**
 * Get trending products
 */
export const getTrendingProducts = async (limit: number = 8): Promise<Product[]> => {
  try {
    return await apiGet<Product[]>(`/trending?limit=${limit}`);
  } catch (error) {
    if (error instanceof ApiClientError) {
      throw error;
    }
    throw new ApiClientError('Failed to fetch trending products');
  }
};

