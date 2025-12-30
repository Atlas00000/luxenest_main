import { z } from 'zod';

// Create category validation
export const createCategorySchema = z.object({
  body: z.object({
    name: z.string().min(2, 'Name must be at least 2 characters').max(100, 'Name must be less than 100 characters'),
    description: z.string().optional(),
    image: z.string().url('Invalid image URL'),
    slug: z.string().min(2, 'Slug must be at least 2 characters').max(100, 'Slug must be less than 100 characters').regex(
      /^[a-z0-9-]+$/,
      'Slug can only contain lowercase letters, numbers, and hyphens'
    ),
    featured: z.boolean().optional(),
  }),
});

// Update category validation
export const updateCategorySchema = z.object({
  body: z.object({
    name: z.string().min(2).max(100).optional(),
    description: z.string().optional(),
    image: z.string().url().optional(),
    slug: z.string().min(2).max(100).regex(/^[a-z0-9-]+$/).optional(),
    featured: z.boolean().optional(),
  }),
});

// Category ID param validation
export const categoryIdSchema = z.object({
  params: z.object({
    id: z.string().uuid('Invalid category ID'),
  }),
});

// Category slug param validation
export const categorySlugSchema = z.object({
  params: z.object({
    slug: z.string().min(1, 'Slug is required'),
  }),
});

