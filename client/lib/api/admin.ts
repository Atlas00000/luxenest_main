/**
 * Admin API service
 */

import { apiGet, ApiClientError } from './client';

export interface AdminStats {
  revenue: {
    total: number;
    growth: number;
    averageOrderValue: number;
  };
  orders: {
    total: number;
    recent: number;
    byStatus: Record<string, number>;
  };
  users: {
    total: number;
    new: number;
  };
  products: {
    total: number;
    lowStock: number;
  };
}

export interface AdminOrder {
  id: string;
  userId: string;
  user: {
    id: string;
    name: string;
    email: string;
  };
  items: any[];
  subtotal: number;
  shipping: number;
  tax: number;
  total: number;
  status: string;
  createdAt: string;
}

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: string;
  avatar: string | null;
  emailVerified: boolean;
  createdAt: string;
  _count: {
    orders: number;
  };
}

export interface AdminProduct {
  id: string;
  name: string;
  description: string;
  price: number;
  images: string[];
  stock: number;
  category: {
    id: string;
    name: string;
    slug: string;
  };
  _count: {
    reviews: number;
    cartItems: number;
    wishlistItems: number;
  };
}

export interface AdminResponse<T> {
  data: T[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

/**
 * Get admin dashboard statistics
 */
export const getAdminStats = async (dateRange: string = '30d'): Promise<AdminStats> => {
  try {
    return await apiGet<AdminStats>(`/admin/stats?dateRange=${dateRange}`);
  } catch (error) {
    if (error instanceof ApiClientError) {
      throw error;
    }
    throw new ApiClientError('Failed to fetch admin statistics');
  }
};

/**
 * Get all orders for admin
 */
export const getAdminOrders = async (
  page: number = 1,
  limit: number = 20,
  status?: string,
  startDate?: string,
  endDate?: string
): Promise<AdminResponse<AdminOrder>> => {
  try {
    const params = new URLSearchParams();
    params.append('page', page.toString());
    params.append('limit', limit.toString());
    if (status) params.append('status', status);
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);

    return await apiGet<AdminResponse<AdminOrder>>(`/admin/orders?${params.toString()}`);
  } catch (error) {
    if (error instanceof ApiClientError) {
      throw error;
    }
    throw new ApiClientError('Failed to fetch orders');
  }
};

/**
 * Get all users for admin
 */
export const getAdminUsers = async (
  page: number = 1,
  limit: number = 20,
  search?: string
): Promise<AdminResponse<AdminUser>> => {
  try {
    const params = new URLSearchParams();
    params.append('page', page.toString());
    params.append('limit', limit.toString());
    if (search) params.append('search', search);

    return await apiGet<AdminResponse<AdminUser>>(`/admin/users?${params.toString()}`);
  } catch (error) {
    if (error instanceof ApiClientError) {
      throw error;
    }
    throw new ApiClientError('Failed to fetch users');
  }
};

/**
 * Get all products for admin
 */
export const getAdminProducts = async (
  page: number = 1,
  limit: number = 20,
  search?: string,
  lowStock?: boolean
): Promise<AdminResponse<AdminProduct>> => {
  try {
    const params = new URLSearchParams();
    params.append('page', page.toString());
    params.append('limit', limit.toString());
    if (search) params.append('search', search);
    if (lowStock) params.append('lowStock', 'true');

    return await apiGet<AdminResponse<AdminProduct>>(`/admin/products?${params.toString()}`);
  } catch (error) {
    if (error instanceof ApiClientError) {
      throw error;
    }
    throw new ApiClientError('Failed to fetch products');
  }
};

