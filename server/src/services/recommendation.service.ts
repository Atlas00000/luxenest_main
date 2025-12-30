import prisma from '../config/database';
import { NotFoundError } from '../utils/api-error';

/**
 * Get product recommendations based on category and similar products
 */
export const getProductRecommendations = async (productId: string, limit: number = 8) => {
  // Get the product
  const product = await prisma.product.findUnique({
    where: { id: productId },
    include: {
      category: true,
    },
  });

  if (!product) {
    throw new NotFoundError('Product not found');
  }

  // Get products from the same category
  const sameCategoryProducts = await prisma.product.findMany({
    where: {
      categoryId: product.categoryId,
      id: { not: productId },
      stock: { gt: 0 },
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
    orderBy: [
      { featured: 'desc' },
      { rating: 'desc' },
      { reviewsCount: 'desc' },
    ],
    take: limit,
  });

  // If we don't have enough products from the same category, get featured products
  if (sameCategoryProducts.length < limit) {
    const featuredProducts = await prisma.product.findMany({
      where: {
        id: { not: productId },
        featured: true,
        stock: { gt: 0 },
        categoryId: { not: product.categoryId }, // Don't include same category
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
      orderBy: [
        { rating: 'desc' },
        { reviewsCount: 'desc' },
      ],
      take: limit - sameCategoryProducts.length,
    });

    return [...sameCategoryProducts, ...featuredProducts];
  }

  return sameCategoryProducts;
};

/**
 * Get recommendations based on user's purchase history (for future implementation)
 */
export const getUserRecommendations = async (userId: string, limit: number = 8) => {
  // Get user's order history
  const orders = await prisma.order.findMany({
    where: {
      userId,
      status: { not: 'CANCELLED' },
    },
    include: {
      items: {
        include: {
          product: {
            include: {
              category: true,
            },
          },
        },
      },
    },
    take: 10,
    orderBy: {
      createdAt: 'desc',
    },
  });

  // Extract categories from purchased products
  const purchasedCategories = new Set<string>();
  orders.forEach((order) => {
    order.items.forEach((item) => {
      purchasedCategories.add(item.product.categoryId);
    });
  });

  // Get products from purchased categories
  const recommendations = await prisma.product.findMany({
    where: {
      categoryId: { in: Array.from(purchasedCategories) },
      stock: { gt: 0 },
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
    orderBy: [
      { featured: 'desc' },
      { rating: 'desc' },
      { reviewsCount: 'desc' },
    ],
    take: limit,
  });

  // If not enough recommendations, add featured products
  if (recommendations.length < limit) {
    const featuredProducts = await prisma.product.findMany({
      where: {
        featured: true,
        stock: { gt: 0 },
        categoryId: { notIn: Array.from(purchasedCategories) },
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
      orderBy: [
        { rating: 'desc' },
        { reviewsCount: 'desc' },
      ],
      take: limit - recommendations.length,
    });

    return [...recommendations, ...featuredProducts];
  }

  return recommendations;
};

/**
 * Get trending products (based on reviews and sales)
 */
export const getTrendingProducts = async (limit: number = 8) => {
  return prisma.product.findMany({
    where: {
      stock: { gt: 0 },
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
    orderBy: [
      { reviewsCount: 'desc' },
      { rating: 'desc' },
      { createdAt: 'desc' },
    ],
    take: limit,
  });
};

