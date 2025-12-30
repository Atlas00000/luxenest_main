/**
 * Orders API service
 */

import { apiGet, apiPost, apiPatch, ApiClientError } from './client';

export interface ShippingAddress {
  fullName: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  phone?: string;
}

export interface OrderItem {
  id: string;
  orderId: string;
  productId: string;
  quantity: number;
  price: number;
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
  };
  createdAt: string;
}

export interface Order {
  id: string;
  userId: string;
  items: OrderItem[];
  subtotal: number;
  shipping: number;
  tax: number;
  total: number;
  shippingAddress: ShippingAddress;
  status: 'PENDING' | 'PROCESSING' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED';
  paymentMethod: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateOrderData {
  shippingAddress: ShippingAddress;
  paymentMethod: string;
}

export interface OrdersResponse {
  orders: Order[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

/**
 * Create order from cart
 */
export const createOrder = async (data: CreateOrderData): Promise<Order> => {
  try {
    return await apiPost<Order>('/orders', data);
  } catch (error) {
    if (error instanceof ApiClientError) {
      throw error;
    }
    throw new ApiClientError('Failed to create order');
  }
};

/**
 * Get user's orders
 */
export const getUserOrders = async (page: number = 1, limit: number = 10): Promise<OrdersResponse> => {
  try {
    return await apiGet<OrdersResponse>(`/orders?page=${page}&limit=${limit}`);
  } catch (error) {
    if (error instanceof ApiClientError) {
      throw error;
    }
    throw new ApiClientError('Failed to fetch orders');
  }
};

/**
 * Get single order by ID
 */
export const getOrderById = async (orderId: string): Promise<Order> => {
  try {
    return await apiGet<Order>(`/orders/${orderId}`);
  } catch (error) {
    if (error instanceof ApiClientError) {
      throw error;
    }
    throw new ApiClientError('Failed to fetch order');
  }
};

/**
 * Update order status (admin only)
 */
export const updateOrderStatus = async (orderId: string, status: string): Promise<Order> => {
  try {
    return await apiPatch<Order>(`/orders/${orderId}/status`, { status });
  } catch (error) {
    if (error instanceof ApiClientError) {
      throw error;
    }
    throw new ApiClientError('Failed to update order status');
  }
};

