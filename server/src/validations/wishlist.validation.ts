import { z } from 'zod';

// Product ID param validation
export const productIdParamSchema = z.object({
  params: z.object({
    productId: z.string().uuid('Invalid product ID'),
  }),
});

