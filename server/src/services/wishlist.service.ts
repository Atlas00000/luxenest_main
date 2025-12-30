import prisma from '../config/database';
import { NotFoundError, ConflictError } from '../utils/api-error';

/**
 * Get user's wishlist
 */
export const getWishlist = async (userId: string) => {
  let wishlist = await prisma.wishlist.findUnique({
    where: { userId },
    include: {
      items: {
        include: {
          product: {
            include: {
              category: {
                select: {
                  id: true,
                  name: true,
                  slug: true,
                },
              },
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
      },
    },
  });

  // Create wishlist if it doesn't exist
  if (!wishlist) {
    wishlist = await prisma.wishlist.create({
      data: {
        userId,
      },
      include: {
        items: {
          include: {
            product: {
              include: {
                category: {
                  select: {
                    id: true,
                    name: true,
                    slug: true,
                  },
                },
              },
            },
          },
        orderBy: {
          createdAt: 'desc',
          },
        },
      },
    });
  }

  return wishlist;
};

/**
 * Add item to wishlist
 */
export const addWishlistItem = async (userId: string, productId: string) => {
  // Validate product exists
  const product = await prisma.product.findUnique({
    where: { id: productId },
  });

  if (!product) {
    throw new NotFoundError('Product not found');
  }

  // Get or create wishlist
  let wishlist = await prisma.wishlist.findUnique({
    where: { userId },
  });

  if (!wishlist) {
    wishlist = await prisma.wishlist.create({
      data: {
        userId,
      },
    });
  }

  // Check if item already exists in wishlist
  const existingItem = await prisma.wishlistItem.findUnique({
    where: {
      wishlistId_productId: {
        wishlistId: wishlist.id,
        productId,
      },
    },
  });

  if (existingItem) {
    throw new ConflictError('Product already in wishlist');
  }

  // Create wishlist item
  const wishlistItem = await prisma.wishlistItem.create({
    data: {
      wishlistId: wishlist.id,
      productId,
    },
    include: {
      product: {
        include: {
          category: {
            select: {
              id: true,
              name: true,
              slug: true,
            },
          },
        },
      },
    },
  });

  return wishlistItem;
};

/**
 * Remove item from wishlist
 */
export const removeWishlistItem = async (userId: string, productId: string): Promise<void> => {
  // Get wishlist
  const wishlist = await prisma.wishlist.findUnique({
    where: { userId },
  });

  if (!wishlist) {
    throw new NotFoundError('Wishlist not found');
  }

  // Get wishlist item
  const wishlistItem = await prisma.wishlistItem.findUnique({
    where: {
      wishlistId_productId: {
        wishlistId: wishlist.id,
        productId,
      },
    },
  });

  if (!wishlistItem) {
    throw new NotFoundError('Wishlist item not found');
  }

  // Delete wishlist item
  await prisma.wishlistItem.delete({
    where: {
      id: wishlistItem.id,
    },
  });
};

/**
 * Check if product is in wishlist
 */
export const isInWishlist = async (userId: string, productId: string): Promise<boolean> => {
  const wishlist = await prisma.wishlist.findUnique({
    where: { userId },
  });

  if (!wishlist) {
    return false;
  }

  const item = await prisma.wishlistItem.findUnique({
    where: {
      wishlistId_productId: {
        wishlistId: wishlist.id,
        productId,
      },
    },
  });

  return !!item;
};

