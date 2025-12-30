/**
 * Products API service
 */

import { apiGet, apiPost, apiPatch, apiDelete, ApiClientError } from './client';
import { tokenStorage } from '../utils/token-storage';

// Re-export Category type from categories API
export type { Category } from './categories';

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  images: string[];
  categoryId: string;
  category?: {
    id: string;
    name: string;
    slug: string;
  };
  tags: string[];
  rating: number;
  reviewsCount: number;
  stock: number;
  featured: boolean;
  isNew: boolean;
  onSale: boolean;
  discount: number | null;
  sustainabilityScore: number | null;
  colors: string[];
  sizes: string[];
  materials: string[];
  createdAt: string;
  updatedAt: string;
}

export interface ProductFilters {
  categoryId?: string;
  minPrice?: number;
  maxPrice?: number;
  inStock?: boolean;
  sustainable?: boolean;
  featured?: boolean;
  isNew?: boolean;
  onSale?: boolean;
  search?: string;
  sortBy?: 'name' | 'price' | 'rating' | 'createdAt' | 'reviewsCount';
  sortOrder?: 'asc' | 'desc';
  page?: number;
  limit?: number;
}

export interface ProductsResponse {
  products: Product[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface CreateProductData {
  name: string;
  description: string;
  price: number;
  images: string[];
  categoryId: string;
  tags?: string[];
  stock: number;
  featured?: boolean;
  isNew?: boolean;
  onSale?: boolean;
  discount?: number;
  sustainabilityScore?: number;
  colors?: string[];
  sizes?: string[];
  materials?: string[];
}

/**
 * Get products with filtering, sorting, and pagination
 */
export const getProducts = async (filters?: ProductFilters): Promise<ProductsResponse> => {
  try {
    // Build query string
    const params = new URLSearchParams();
    
    if (filters?.page) params.append('page', filters.page.toString());
    if (filters?.limit) params.append('limit', filters.limit.toString());
    if (filters?.categoryId) params.append('categoryId', filters.categoryId);
    if (filters?.minPrice) params.append('minPrice', filters.minPrice.toString());
    if (filters?.maxPrice) params.append('maxPrice', filters.maxPrice.toString());
    if (filters?.inStock) params.append('inStock', 'true');
    if (filters?.sustainable) params.append('sustainable', 'true');
    if (filters?.featured) params.append('featured', 'true');
    if (filters?.isNew) params.append('isNew', 'true');
    if (filters?.onSale) params.append('onSale', 'true');
    if (filters?.search) params.append('search', filters.search);
    if (filters?.sortBy) params.append('sortBy', filters.sortBy);
    if (filters?.sortOrder) params.append('sortOrder', filters.sortOrder);

    const queryString = params.toString();
    const endpoint = `/products${queryString ? `?${queryString}` : ''}`;
    
    // Backend returns { success: true, data: Product[], meta: {...} }
    // We need to fetch the full response to get both data and meta
    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1';
    const url = `${API_URL}${endpoint}`;
    
    // Get access token for authenticated requests
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
        errorData.error || errorData.message || 'Failed to fetch products',
        response.status
      );
    }

    const result = await response.json();
    
    // Transform backend response { success: true, data: Product[], meta: {...} } to client format
    if (!result.success) {
      throw new ApiClientError(result.error || result.message || 'Failed to fetch products', response.status);
    }
    
    return {
      products: Array.isArray(result.data) ? result.data : [],
      meta: result.meta || { page: 1, limit: 20, total: 0, totalPages: 1 }
    };
  } catch (error) {
    if (error instanceof ApiClientError) {
      throw error;
    }
    throw new ApiClientError('Failed to fetch products');
  }
};

/**
 * Get single product by ID
 */
export const getProductById = async (id: string): Promise<Product> => {
  try {
    return await apiGet<Product>(`/products/${id}`);
  } catch (error) {
    if (error instanceof ApiClientError) {
      throw error;
    }
    throw new ApiClientError('Failed to fetch product');
  }
};

/**
 * Get featured products
 */
export const getFeaturedProducts = async (limit: number = 8): Promise<Product[]> => {
  try {
    return await apiGet<Product[]>(`/products/featured?limit=${limit}`);
  } catch (error) {
    if (error instanceof ApiClientError) {
      throw error;
    }
    throw new ApiClientError('Failed to fetch featured products');
  }
};

/**
 * Get new products
 */
export const getNewProducts = async (limit: number = 8): Promise<Product[]> => {
  try {
    return await apiGet<Product[]>(`/products/new?limit=${limit}`);
  } catch (error) {
    if (error instanceof ApiClientError) {
      throw error;
    }
    throw new ApiClientError('Failed to fetch new products');
  }
};

/**
 * Get sale products
 */
export const getSaleProducts = async (limit: number = 8): Promise<Product[]> => {
  try {
    return await apiGet<Product[]>(`/products/sale?limit=${limit}`);
  } catch (error) {
    if (error instanceof ApiClientError) {
      throw error;
    }
    throw new ApiClientError('Failed to fetch sale products');
  }
};

/**
 * Create product (admin only)
 */
export const createProduct = async (data: CreateProductData): Promise<Product> => {
  try {
    return await apiPost<Product>('/products', data);
  } catch (error) {
    if (error instanceof ApiClientError) {
      throw error;
    }
    throw new ApiClientError('Failed to create product');
  }
};

/**
 * Update product (admin only)
 */
export const updateProduct = async (id: string, data: Partial<CreateProductData>): Promise<Product> => {
  try {
    return await apiPatch<Product>(`/products/${id}`, data);
  } catch (error) {
    if (error instanceof ApiClientError) {
      throw error;
    }
    throw new ApiClientError('Failed to update product');
  }
};

/**
 * Delete product (admin only)
 */
export const deleteProduct = async (id: string): Promise<void> => {
  try {
    await apiDelete(`/products/${id}`);
  } catch (error) {
    if (error instanceof ApiClientError) {
      throw error;
    }
    throw new ApiClientError('Failed to delete product');
  }
};

