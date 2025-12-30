import { z } from 'zod';

// Get products query validation
export const getProductsQuerySchema = z.object({
  query: z.object({
    page: z.string().optional().transform((val) => (val ? parseInt(val, 10) : 1)),
    limit: z.string().optional().transform((val) => (val ? parseInt(val, 10) : 20)),
    categoryId: z.string().uuid().optional(),
    minPrice: z.string().optional().transform((val) => (val ? parseFloat(val) : undefined)),
    maxPrice: z.string().optional().transform((val) => (val ? parseFloat(val) : undefined)),
    inStock: z.string().optional().transform((val) => val === 'true'),
    sustainable: z.string().optional().transform((val) => val === 'true'),
    featured: z.string().optional().transform((val) => val === 'true'),
    isNew: z.string().optional().transform((val) => val === 'true'),
    onSale: z.string().optional().transform((val) => val === 'true'),
    search: z.string().optional(),
    sortBy: z.enum(['name', 'price', 'rating', 'createdAt', 'reviewsCount']).optional(),
    sortOrder: z.enum(['asc', 'desc']).optional(),
  }),
});

// Create product validation
export const createProductSchema = z.object({
  body: z.object({
    name: z.string().min(2, 'Name must be at least 2 characters').max(200, 'Name must be less than 200 characters'),
    description: z.string().min(10, 'Description must be at least 10 characters'),
    price: z.number().positive('Price must be positive'),
    images: z.array(z.string().url('Invalid image URL')).min(1, 'At least one image is required'),
    categoryId: z.string().uuid('Invalid category ID'),
    tags: z.array(z.string()).optional(),
    stock: z.number().int().min(0, 'Stock cannot be negative'),
    featured: z.boolean().optional(),
    isNew: z.boolean().optional(),
    onSale: z.boolean().optional(),
    discount: z.number().int().min(0).max(100).optional(),
    sustainabilityScore: z.number().int().min(0).max(5).optional(),
    colors: z.array(z.string()).optional(),
    sizes: z.array(z.string()).optional(),
    materials: z.array(z.string()).optional(),
  }),
});

// Update product validation
export const updateProductSchema = z.object({
  body: z.object({
    name: z.string().min(2).max(200).optional(),
    description: z.string().min(10).optional(),
    price: z.number().positive().optional(),
    images: z.array(z.string().url()).min(1).optional(),
    categoryId: z.string().uuid().optional(),
    tags: z.array(z.string()).optional(),
    stock: z.number().int().min(0).optional(),
    featured: z.boolean().optional(),
    isNew: z.boolean().optional(),
    onSale: z.boolean().optional(),
    discount: z.number().int().min(0).max(100).optional(),
    sustainabilityScore: z.number().int().min(0).max(5).optional(),
    colors: z.array(z.string()).optional(),
    sizes: z.array(z.string()).optional(),
    materials: z.array(z.string()).optional(),
  }),
});

// Product ID param validation
export const productIdSchema = z.object({
  params: z.object({
    id: z.string().uuid('Invalid product ID'),
  }),
});

