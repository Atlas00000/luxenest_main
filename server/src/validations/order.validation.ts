import { z } from 'zod';

// Shipping address validation
const shippingAddressSchema = z.object({
  fullName: z.string().min(2, 'Full name must be at least 2 characters').max(100, 'Full name must be less than 100 characters'),
  address: z.string().min(5, 'Address must be at least 5 characters').max(200, 'Address must be less than 200 characters'),
  city: z.string().min(2, 'City must be at least 2 characters').max(100, 'City must be less than 100 characters'),
  state: z.string().min(2, 'State must be at least 2 characters').max(100, 'State must be less than 100 characters'),
  zipCode: z.string().min(5, 'Zip code must be at least 5 characters').max(10, 'Zip code must be less than 10 characters'),
  country: z.string().min(2, 'Country must be at least 2 characters').max(100, 'Country must be less than 100 characters'),
  phone: z.string().optional(),
});

// Create order validation
export const createOrderSchema = z.object({
  body: z.object({
    shippingAddress: shippingAddressSchema,
    paymentMethod: z.string().min(1, 'Payment method is required'),
  }),
});

// Update order status validation
export const updateOrderStatusSchema = z.object({
  body: z.object({
    status: z.enum(['PENDING', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED'], {
      errorMap: () => ({ message: 'Invalid order status' }),
    }),
  }),
});

// Order ID param validation
export const orderIdParamSchema = z.object({
  params: z.object({
    id: z.string().uuid('Invalid order ID'),
  }),
});

// Get orders query validation
export const getOrdersQuerySchema = z.object({
  query: z.object({
    page: z.string().optional().transform((val) => (val ? parseInt(val, 10) : 1)),
    limit: z.string().optional().transform((val) => (val ? parseInt(val, 10) : 10)),
  }),
});

