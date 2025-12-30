/**
 * Reviews API service
 */

import { apiGet, apiPost, apiPatch, ApiClientError } from './client';

export interface Review {
  id: string;
  productId: string;
  userId: string;
  user: {
    id: string;
    name: string;
    avatar: string | null;
  };
  rating: number;
  title: string;
  comment: string;
  helpful: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateReviewData {
  rating: number;
  title: string;
  comment: string;
}

export interface ReviewsResponse {
  reviews: Review[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

/**
 * Get reviews for a product
 */
export const getProductReviews = async (
  productId: string,
  page: number = 1,
  limit: number = 10
): Promise<ReviewsResponse> => {
  try {
    // Backend returns { success: true, data: Review[], meta: {...} }
    // apiGet extracts data, so we get Review[] directly, but we also need meta
    // We need to fetch the full response to get both data and meta
    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1';
    const url = `${API_URL}/products/${productId}/reviews?page=${page}&limit=${limit}`;
    
    // Get access token for authenticated requests
    const { tokenStorage } = await import('../utils/token-storage');
    const accessToken = tokenStorage.getAccessToken();
    
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };
    
    if (accessToken) {
      headers['Authorization'] = `Bearer ${accessToken}`;
    }
    
    const response = await fetch(url, {
      method: 'GET',
      headers,
      credentials: 'include',
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new ApiClientError(
        errorData.error || errorData.message || 'Failed to fetch reviews',
        response.status
      );
    }

    const result = await response.json();
    
    // Transform backend response { success: true, data: Review[], meta: {...} } to client format
    if (!result.success) {
      throw new ApiClientError(result.error || result.message || 'Failed to fetch reviews', response.status);
    }
    
    return {
      reviews: Array.isArray(result.data) ? result.data : [],
      meta: result.meta || { page, limit, total: 0, totalPages: 1 }
    };
  } catch (error) {
    if (error instanceof ApiClientError) {
      throw error;
    }
    throw new ApiClientError('Failed to fetch reviews');
  }
};

/**
 * Get user's review for a product
 */
export const getUserReview = async (productId: string): Promise<Review | null> => {
  try {
    return await apiGet<Review>(`/products/${productId}/reviews/me`);
  } catch (error) {
    if (error instanceof ApiClientError && error.statusCode === 404) {
      return null;
    }
    if (error instanceof ApiClientError) {
      throw error;
    }
    throw new ApiClientError('Failed to fetch user review');
  }
};

/**
 * Create review for a product
 */
export const createReview = async (productId: string, data: CreateReviewData): Promise<Review> => {
  try {
    return await apiPost<Review>(`/products/${productId}/reviews`, data);
  } catch (error) {
    if (error instanceof ApiClientError) {
      throw error;
    }
    throw new ApiClientError('Failed to create review');
  }
};

/**
 * Mark review as helpful
 */
export const markReviewHelpful = async (reviewId: string): Promise<Review> => {
  try {
    return await apiPatch<Review>(`/reviews/${reviewId}/helpful`);
  } catch (error) {
    if (error instanceof ApiClientError) {
      throw error;
    }
    throw new ApiClientError('Failed to mark review as helpful');
  }
};

