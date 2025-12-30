import prisma from '../config/database';
import { NotFoundError, ConflictError } from '../utils/api-error';
import { getCache, setCache, deleteCache, deleteCachePattern, CacheKeys, CACHE_TTL } from '../utils/cache.util';

export interface CreateCategoryData {
  name: string;
  description?: string;
  image: string;
  slug: string;
  featured?: boolean;
}

export interface UpdateCategoryData extends Partial<CreateCategoryData> {}

/**
 * Get all categories
 */
export const getCategories = async (featuredOnly: boolean = false) => {
  const cacheKey = CacheKeys.categories(featuredOnly);
  const cached = await getCache(cacheKey);
  if (cached) {
    return cached;
  }

  const where = featuredOnly ? { featured: true } : {};
  
  const categories = await prisma.category.findMany({
    where,
    orderBy: { name: 'asc' },
    include: {
      _count: {
        select: { products: true },
      },
    },
  });

  await setCache(cacheKey, categories, CACHE_TTL.LONG);
  return categories;
};

/**
 * Get single category by ID
 */
export const getCategoryById = async (id: string) => {
  const cacheKey = CacheKeys.category(id);
  const cached = await getCache(cacheKey);
  if (cached) {
    return cached;
  }

  const category = await prisma.category.findUnique({
    where: { id },
    include: {
      _count: {
        select: { products: true },
      },
    },
  });

  if (!category) {
    throw new NotFoundError('Category not found');
  }

  await setCache(cacheKey, category, CACHE_TTL.LONG);
  return category;
};

/**
 * Get category by slug
 */
export const getCategoryBySlug = async (slug: string) => {
  const cacheKey = CacheKeys.categoryBySlug(slug);
  const cached = await getCache(cacheKey);
  if (cached) {
    return cached;
  }

  const category = await prisma.category.findUnique({
    where: { slug },
    include: {
      _count: {
        select: { products: true },
      },
    },
  });

  if (!category) {
    throw new NotFoundError('Category not found');
  }

  await setCache(cacheKey, category, CACHE_TTL.LONG);
  return category;
};

/**
 * Create new category (admin only)
 */
export const createCategory = async (data: CreateCategoryData) => {
  // Check if category with same name exists
  const existingCategory = await prisma.category.findUnique({
    where: { name: data.name },
  });

  if (existingCategory) {
    throw new ConflictError('Category with this name already exists');
  }

  // Check if category with same slug exists
  const existingSlug = await prisma.category.findUnique({
    where: { slug: data.slug.toLowerCase() },
  });

  if (existingSlug) {
    throw new ConflictError('Category with this slug already exists');
  }

  const category = await prisma.category.create({
    data: {
      name: data.name,
      description: data.description,
      image: data.image,
      slug: data.slug.toLowerCase(),
      featured: data.featured || false,
    },
  });

  // Invalidate category caches
  await deleteCachePattern('categories:*');
  await deleteCachePattern('category:*');

  return category;
};

/**
 * Update category (admin only)
 */
export const updateCategory = async (id: string, data: UpdateCategoryData) => {
  const existingCategory = await prisma.category.findUnique({
    where: { id },
  });

  if (!existingCategory) {
    throw new NotFoundError('Category not found');
  }

  // Check for name conflict if name is being updated
  if (data.name && data.name !== existingCategory.name) {
    const nameConflict = await prisma.category.findUnique({
      where: { name: data.name },
    });

    if (nameConflict) {
      throw new ConflictError('Category with this name already exists');
    }
  }

  // Check for slug conflict if slug is being updated
  if (data.slug && data.slug !== existingCategory.slug) {
    const slugConflict = await prisma.category.findUnique({
      where: { slug: data.slug.toLowerCase() },
    });

    if (slugConflict) {
      throw new ConflictError('Category with this slug already exists');
    }
  }

  const category = await prisma.category.update({
    where: { id },
    data: {
      ...(data.name && { name: data.name }),
      ...(data.description !== undefined && { description: data.description }),
      ...(data.image && { image: data.image }),
      ...(data.slug && { slug: data.slug.toLowerCase() }),
      ...(data.featured !== undefined && { featured: data.featured }),
    },
  });

  // Invalidate category caches
  await deleteCache(CacheKeys.category(id));
  await deleteCachePattern('categories:*');

  return category;
};

/**
 * Delete category (admin only)
 */
export const deleteCategory = async (id: string): Promise<void> => {
  const category = await prisma.category.findUnique({
    where: { id },
    include: {
      _count: {
        select: { products: true },
      },
    },
  });

  if (!category) {
    throw new NotFoundError('Category not found');
  }

  // Check if category has products
  if (category._count.products > 0) {
    throw new ConflictError('Cannot delete category with existing products');
  }

  await prisma.category.delete({
    where: { id },
  });

  // Invalidate category caches
  await deleteCache(CacheKeys.category(id));
  await deleteCachePattern('categories:*');
};

