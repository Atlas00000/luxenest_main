import { z } from 'zod';

// Add cart item validation
export const addCartItemSchema = z.object({
  body: z.object({
    productId: z.string().uuid('Invalid product ID'),
    quantity: z.number().int().min(1, 'Quantity must be at least 1').max(10, 'Maximum quantity is 10'),
  }),
});

// Update cart item validation
export const updateCartItemSchema = z.object({
  body: z.object({
    quantity: z.number().int().min(1, 'Quantity must be at least 1').max(10, 'Maximum quantity is 10'),
  }),
});

// Product ID param validation
export const productIdParamSchema = z.object({
  params: z.object({
    productId: z.string().uuid('Invalid product ID'),
  }),
});

