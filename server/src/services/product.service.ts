import prisma from '../config/database';
import { NotFoundError, BadRequestError } from '../utils/api-error';
import { PaginationParams, PaginationMeta } from '../types';
import { getCache, setCache, deleteCache, deleteCachePattern, CacheKeys, CACHE_TTL } from '../utils/cache.util';

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

export interface UpdateProductData extends Partial<CreateProductData> {}

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
}

export interface ProductSortOptions {
  sortBy?: 'name' | 'price' | 'rating' | 'createdAt' | 'reviewsCount';
  sortOrder?: 'asc' | 'desc';
}

/**
 * Get products with filtering, sorting, and pagination
 */
export const getProducts = async (
  filters: ProductFilters = {},
  sortOptions: ProductSortOptions = {},
  pagination: PaginationParams = {}
) => {
  const page = pagination.page || 1;
  const limit = pagination.limit || 20;
  const skip = (page - 1) * limit;

  // Generate cache key
  const cacheKey = CacheKeys.products(
    JSON.stringify({ filters, sortOptions, pagination })
  );

  // Try to get from cache
  const cached = await getCache<{ products: any[]; meta: PaginationMeta }>(cacheKey);
  if (cached) {
    return cached;
  }

  // Build where clause
  const where: any = {};

  if (filters.categoryId) {
    where.categoryId = filters.categoryId;
  }

  if (filters.minPrice !== undefined || filters.maxPrice !== undefined) {
    where.price = {};
    if (filters.minPrice !== undefined) {
      where.price.gte = filters.minPrice;
    }
    if (filters.maxPrice !== undefined) {
      where.price.lte = filters.maxPrice;
    }
  }

  if (filters.inStock) {
    where.stock = { gt: 0 };
  }

  if (filters.sustainable) {
    where.sustainabilityScore = { gte: 4 };
  }

  if (filters.featured !== undefined) {
    where.featured = filters.featured;
  }

  if (filters.isNew !== undefined) {
    where.isNew = filters.isNew;
  }

  if (filters.onSale !== undefined) {
    where.onSale = filters.onSale;
  }

  if (filters.search) {
    where.OR = [
      { name: { contains: filters.search, mode: 'insensitive' } },
      { description: { contains: filters.search, mode: 'insensitive' } },
      { tags: { hasSome: [filters.search] } },
    ];
  }

  // Build orderBy clause
  const orderBy: any = {};
  const sortBy = sortOptions.sortBy || 'createdAt';
  const sortOrder = sortOptions.sortOrder || 'desc';

  if (sortBy === 'price') {
    orderBy.price = sortOrder;
  } else if (sortBy === 'rating') {
    orderBy.rating = sortOrder;
  } else if (sortBy === 'reviewsCount') {
    orderBy.reviewsCount = sortOrder;
  } else if (sortBy === 'name') {
    orderBy.name = sortOrder;
  } else {
    orderBy.createdAt = sortOrder;
  }

  // Execute query
  const [products, total] = await Promise.all([
    prisma.product.findMany({
      where,
      include: {
        category: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
      },
      orderBy,
      skip,
      take: limit,
    }),
    prisma.product.count({ where }),
  ]);

  const totalPages = Math.ceil(total / limit);

  const result = {
    products,
    meta: {
      page,
      limit,
      total,
      totalPages,
    },
  };

  // Cache result (shorter TTL for filtered results)
  await setCache(cacheKey, result, CACHE_TTL.SHORT);

  return result;
};

/**
 * Get single product by ID
 */
export const getProductById = async (id: string) => {
  // Try cache first
  const cacheKey = CacheKeys.product(id);
  const cached = await getCache(cacheKey);
  if (cached) {
    return cached;
  }

  const product = await prisma.product.findUnique({
    where: { id },
    include: {
      category: {
        select: {
          id: true,
          name: true,
          slug: true,
          description: true,
        },
      },
      reviews: {
        take: 5,
        orderBy: { createdAt: 'desc' },
        include: {
          user: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      },
    },
  });

  if (!product) {
    throw new NotFoundError('Product not found');
  }

  // Cache product
  await setCache(cacheKey, product, CACHE_TTL.MEDIUM);

  return product;
};

/**
 * Create new product (admin only)
 */
export const createProduct = async (data: CreateProductData) => {
  // Validate category exists
  const category = await prisma.category.findUnique({
    where: { id: data.categoryId },
  });

  if (!category) {
    throw new NotFoundError('Category not found');
  }

  // Validate price
  if (data.price < 0) {
    throw new BadRequestError('Price cannot be negative');
  }

  // Validate stock
  if (data.stock < 0) {
    throw new BadRequestError('Stock cannot be negative');
  }

  // Validate discount
  if (data.discount !== undefined) {
    if (data.discount < 0 || data.discount > 100) {
      throw new BadRequestError('Discount must be between 0 and 100');
    }
  }

  // Validate sustainability score
  if (data.sustainabilityScore !== undefined) {
    if (data.sustainabilityScore < 0 || data.sustainabilityScore > 5) {
      throw new BadRequestError('Sustainability score must be between 0 and 5');
    }
  }

  const product = await prisma.product.create({
    data: {
      name: data.name,
      description: data.description,
      price: data.price,
      images: data.images,
      categoryId: data.categoryId,
      tags: data.tags || [],
      stock: data.stock,
      featured: data.featured || false,
      isNew: data.isNew || false,
      onSale: data.onSale || false,
      discount: data.discount || null,
      sustainabilityScore: data.sustainabilityScore || null,
      colors: data.colors || [],
      sizes: data.sizes || [],
      materials: data.materials || [],
    },
    include: {
      category: {
        select: {
          id: true,
          name: true,
          slug: true,
        },
      },
    },
  });

  // Invalidate product caches
  await deleteCachePattern('products:*');
  await deleteCachePattern('product:*');

  return product;
};

/**
 * Update product (admin only)
 */
export const updateProduct = async (id: string, data: UpdateProductData) => {
  // Check if product exists
  const existingProduct = await prisma.product.findUnique({
    where: { id },
  });

  if (!existingProduct) {
    throw new NotFoundError('Product not found');
  }

  // Validate category if provided
  if (data.categoryId) {
    const category = await prisma.category.findUnique({
      where: { id: data.categoryId },
    });

    if (!category) {
      throw new NotFoundError('Category not found');
    }
  }

  // Validate price if provided
  if (data.price !== undefined && data.price < 0) {
    throw new BadRequestError('Price cannot be negative');
  }

  // Validate stock if provided
  if (data.stock !== undefined && data.stock < 0) {
    throw new BadRequestError('Stock cannot be negative');
  }

  // Validate discount if provided
  if (data.discount !== undefined) {
    if (data.discount < 0 || data.discount > 100) {
      throw new BadRequestError('Discount must be between 0 and 100');
    }
  }

  // Validate sustainability score if provided
  if (data.sustainabilityScore !== undefined) {
    if (data.sustainabilityScore < 0 || data.sustainabilityScore > 5) {
      throw new BadRequestError('Sustainability score must be between 0 and 5');
    }
  }

  const product = await prisma.product.update({
    where: { id },
    data: {
      ...(data.name && { name: data.name }),
      ...(data.description && { description: data.description }),
      ...(data.price !== undefined && { price: data.price }),
      ...(data.images && { images: data.images }),
      ...(data.categoryId && { categoryId: data.categoryId }),
      ...(data.tags && { tags: data.tags }),
      ...(data.stock !== undefined && { stock: data.stock }),
      ...(data.featured !== undefined && { featured: data.featured }),
      ...(data.isNew !== undefined && { isNew: data.isNew }),
      ...(data.onSale !== undefined && { onSale: data.onSale }),
      ...(data.discount !== undefined && { discount: data.discount }),
      ...(data.sustainabilityScore !== undefined && { sustainabilityScore: data.sustainabilityScore }),
      ...(data.colors && { colors: data.colors }),
      ...(data.sizes && { sizes: data.sizes }),
      ...(data.materials && { materials: data.materials }),
    },
    include: {
      category: {
        select: {
          id: true,
          name: true,
          slug: true,
        },
      },
    },
  });

  // Invalidate product caches
  await deleteCache(CacheKeys.product(id));
  await deleteCachePattern('products:*');

  return product;
};

/**
 * Delete product (admin only)
 */
export const deleteProduct = async (id: string): Promise<void> => {
  const product = await prisma.product.findUnique({
    where: { id },
  });

  if (!product) {
    throw new NotFoundError('Product not found');
  }

  await prisma.product.delete({
    where: { id },
  });

  // Invalidate product caches
  await deleteCache(CacheKeys.product(id));
  await deleteCachePattern('products:*');
};

/**
 * Get featured products
 */
export const getFeaturedProducts = async (limit: number = 8) => {
  const cacheKey = CacheKeys.featuredProducts();
  const cached = await getCache(cacheKey);
  if (cached) {
    return cached;
  }

  const products = await prisma.product.findMany({
    where: { featured: true },
    include: {
      category: {
        select: {
          id: true,
          name: true,
          slug: true,
        },
      },
    },
    orderBy: { createdAt: 'desc' },
    take: limit,
  });

  await setCache(cacheKey, products, CACHE_TTL.MEDIUM);
  return products;
};

/**
 * Get new products
 */
export const getNewProducts = async (limit: number = 8) => {
  const cacheKey = CacheKeys.newProducts();
  const cached = await getCache(cacheKey);
  if (cached) {
    return cached;
  }

  const products = await prisma.product.findMany({
    where: { isNew: true },
    include: {
      category: {
        select: {
          id: true,
          name: true,
          slug: true,
        },
      },
    },
    orderBy: { createdAt: 'desc' },
    take: limit,
  });

  await setCache(cacheKey, products, CACHE_TTL.MEDIUM);
  return products;
};

/**
 * Get products on sale
 */
export const getSaleProducts = async (limit: number = 8) => {
  const cacheKey = CacheKeys.saleProducts();
  const cached = await getCache(cacheKey);
  if (cached) {
    return cached;
  }

  const products = await prisma.product.findMany({
    where: { onSale: true },
    include: {
      category: {
        select: {
          id: true,
          name: true,
          slug: true,
        },
      },
    },
    orderBy: { discount: 'desc' },
    take: limit,
  });

  await setCache(cacheKey, products, CACHE_TTL.MEDIUM);
  return products;
};

