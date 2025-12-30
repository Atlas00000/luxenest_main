/**
 * Categories API service
 */

import { apiGet, apiPost, apiPatch, apiDelete, ApiClientError } from './client';

export interface Category {
  id: string;
  name: string;
  description: string | null;
  image: string;
  slug: string;
  featured: boolean;
  createdAt: string;
  updatedAt: string;
  _count?: {
    products: number;
  };
}

export interface CreateCategoryData {
  name: string;
  description?: string;
  image: string;
  slug: string;
  featured?: boolean;
}

/**
 * Get all categories
 */
export const getCategories = async (featuredOnly: boolean = false): Promise<Category[]> => {
  try {
    const endpoint = featuredOnly ? '/categories?featured=true' : '/categories';
    return await apiGet<Category[]>(endpoint);
  } catch (error) {
    if (error instanceof ApiClientError) {
      throw error;
    }
    throw new ApiClientError('Failed to fetch categories');
  }
};

/**
 * Get single category by ID
 */
export const getCategoryById = async (id: string): Promise<Category> => {
  try {
    return await apiGet<Category>(`/categories/${id}`);
  } catch (error) {
    if (error instanceof ApiClientError) {
      throw error;
    }
    throw new ApiClientError('Failed to fetch category');
  }
};

/**
 * Get category by slug
 */
export const getCategoryBySlug = async (slug: string): Promise<Category> => {
  try {
    return await apiGet<Category>(`/categories/slug/${slug}`);
  } catch (error) {
    if (error instanceof ApiClientError) {
      throw error;
    }
    throw new ApiClientError('Failed to fetch category');
  }
};

/**
 * Create category (admin only)
 */
export const createCategory = async (data: CreateCategoryData): Promise<Category> => {
  try {
    return await apiPost<Category>('/categories', data);
  } catch (error) {
    if (error instanceof ApiClientError) {
      throw error;
    }
    throw new ApiClientError('Failed to create category');
  }
};

/**
 * Update category (admin only)
 */
export const updateCategory = async (id: string, data: Partial<CreateCategoryData>): Promise<Category> => {
  try {
    return await apiPatch<Category>(`/categories/${id}`, data);
  } catch (error) {
    if (error instanceof ApiClientError) {
      throw error;
    }
    throw new ApiClientError('Failed to update category');
  }
};

/**
 * Delete category (admin only)
 */
export const deleteCategory = async (id: string): Promise<void> => {
  try {
    await apiDelete(`/categories/${id}`);
  } catch (error) {
    if (error instanceof ApiClientError) {
      throw error;
    }
    throw new ApiClientError('Failed to delete category');
  }
};

