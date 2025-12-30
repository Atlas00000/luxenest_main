import prisma from '../config/database';
import { NotFoundError, BadRequestError, ConflictError } from '../utils/api-error';

export interface CreateReviewData {
  rating: number;
  title: string;
  comment: string;
}

/**
 * Get reviews for a product
 */
export const getProductReviews = async (productId: string, page: number = 1, limit: number = 10) => {
  // Validate product exists
  const product = await prisma.product.findUnique({
    where: { id: productId },
  });

  if (!product) {
    throw new NotFoundError('Product not found');
  }

  const skip = (page - 1) * limit;

  const [reviews, total] = await Promise.all([
    prisma.review.findMany({
      where: { productId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            avatar: true,
          },
        },
      },
      orderBy: [
        { helpful: 'desc' },
        { createdAt: 'desc' },
      ],
      skip,
      take: limit,
    }),
    prisma.review.count({
      where: { productId },
    }),
  ]);

  const totalPages = Math.ceil(total / limit);

  return {
    reviews,
    meta: {
      page,
      limit,
      total,
      totalPages,
    },
  };
};

/**
 * Create review for a product
 */
export const createReview = async (userId: string, productId: string, data: CreateReviewData) => {
  // Validate product exists
  const product = await prisma.product.findUnique({
    where: { id: productId },
  });

  if (!product) {
    throw new NotFoundError('Product not found');
  }

  // Check if user already reviewed this product
  const existingReview = await prisma.review.findUnique({
    where: {
      productId_userId: {
        productId,
        userId,
      },
    },
  });

  if (existingReview) {
    throw new ConflictError('You have already reviewed this product');
  }

  // Validate rating
  if (data.rating < 1 || data.rating > 5) {
    throw new BadRequestError('Rating must be between 1 and 5');
  }

  // Create review
  const review = await prisma.review.create({
    data: {
      productId,
      userId,
      rating: data.rating,
      title: data.title,
      comment: data.comment,
    },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          avatar: true,
        },
      },
    },
  });

  // Update product rating and review count
  await updateProductRating(productId);

  return review;
};

/**
 * Update product rating based on all reviews
 */
const updateProductRating = async (productId: string) => {
  const reviews = await prisma.review.findMany({
    where: { productId },
    select: { rating: true },
  });

  if (reviews.length === 0) {
    await prisma.product.update({
      where: { id: productId },
      data: {
        rating: 0,
        reviewsCount: 0,
      },
    });
    return;
  }

  const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);
  const averageRating = totalRating / reviews.length;

  await prisma.product.update({
    where: { id: productId },
    data: {
      rating: Math.round(averageRating * 10) / 10, // Round to 1 decimal place
      reviewsCount: reviews.length,
    },
  });
};

/**
 * Mark review as helpful
 */
export const markReviewHelpful = async (reviewId: string) => {
  const review = await prisma.review.findUnique({
    where: { id: reviewId },
  });

  if (!review) {
    throw new NotFoundError('Review not found');
  }

  const updatedReview = await prisma.review.update({
    where: { id: reviewId },
    data: {
      helpful: {
        increment: 1,
      },
    },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          avatar: true,
        },
      },
    },
  });

  return updatedReview;
};

/**
 * Get user's review for a product
 */
export const getUserReview = async (userId: string, productId: string) => {
  const review = await prisma.review.findUnique({
    where: {
      productId_userId: {
        productId,
        userId,
      },
    },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          avatar: true,
        },
      },
    },
  });

  if (!review) {
    throw new NotFoundError('Review not found');
  }

  return review;
};

