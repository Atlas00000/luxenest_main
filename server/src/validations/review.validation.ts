import { z } from 'zod';

// Create review validation
export const createReviewSchema = z.object({
  body: z.object({
    rating: z.number().int().min(1, 'Rating must be at least 1').max(5, 'Rating must be at most 5'),
    title: z.string().min(3, 'Title must be at least 3 characters').max(200, 'Title must be less than 200 characters'),
    comment: z.string().min(10, 'Comment must be at least 10 characters').max(2000, 'Comment must be less than 2000 characters'),
  }),
});

// Product ID param validation
export const productIdParamSchema = z.object({
  params: z.object({
    id: z.string().uuid('Invalid product ID'),
  }),
});

// Review ID param validation
export const reviewIdParamSchema = z.object({
  params: z.object({
    id: z.string().uuid('Invalid review ID'),
  }),
});

// Get reviews query validation
export const getReviewsQuerySchema = z.object({
  query: z.object({
    page: z.string().optional().transform((val) => (val ? parseInt(val, 10) : 1)),
    limit: z.string().optional().transform((val) => (val ? parseInt(val, 10) : 10)),
  }),
});

