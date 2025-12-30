import prisma from '../config/database';
import { NotFoundError, BadRequestError } from '../utils/api-error';

export interface AddCartItemData {
  productId: string;
  quantity: number;
}

export interface UpdateCartItemData {
  quantity: number;
}

/**
 * Get user's cart
 */
export const getCart = async (userId: string) => {
  let cart = await prisma.cart.findUnique({
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
          createdAt: 'asc',
        },
      },
    },
  });

  // Create cart if it doesn't exist
  if (!cart) {
    cart = await prisma.cart.create({
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
          createdAt: 'asc',
          },
        },
      },
    });
  }

  return cart;
};

/**
 * Add item to cart
 */
export const addCartItem = async (userId: string, data: AddCartItemData) => {
  // Validate product exists
  const product = await prisma.product.findUnique({
    where: { id: data.productId },
  });

  if (!product) {
    throw new NotFoundError('Product not found');
  }

  // Validate stock
  if (product.stock < data.quantity) {
    throw new BadRequestError(`Only ${product.stock} items available in stock`);
  }

  // Validate quantity
  if (data.quantity <= 0) {
    throw new BadRequestError('Quantity must be greater than 0');
  }

  if (data.quantity > 10) {
    throw new BadRequestError('Maximum quantity per item is 10');
  }

  // Get or create cart
  let cart = await prisma.cart.findUnique({
    where: { userId },
  });

  if (!cart) {
    cart = await prisma.cart.create({
      data: {
        userId,
      },
    });
  }

  // Check if item already exists in cart
  const existingItem = await prisma.cartItem.findUnique({
    where: {
      cartId_productId: {
        cartId: cart.id,
        productId: data.productId,
      },
    },
  });

  if (existingItem) {
    // Update quantity
    const newQuantity = existingItem.quantity + data.quantity;

    // Validate stock for new quantity
    if (product.stock < newQuantity) {
      throw new BadRequestError(`Only ${product.stock} items available in stock`);
    }

    if (newQuantity > 10) {
      throw new BadRequestError('Maximum quantity per item is 10');
    }

    const updatedItem = await prisma.cartItem.update({
      where: {
        id: existingItem.id,
      },
      data: {
        quantity: newQuantity,
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

    return updatedItem;
  }

  // Create new cart item
  const cartItem = await prisma.cartItem.create({
    data: {
      cartId: cart.id,
      productId: data.productId,
      quantity: data.quantity,
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

  return cartItem;
};

/**
 * Update cart item quantity
 */
export const updateCartItem = async (
  userId: string,
  productId: string,
  data: UpdateCartItemData
) => {
  // Validate quantity
  if (data.quantity <= 0) {
    throw new BadRequestError('Quantity must be greater than 0');
  }

  if (data.quantity > 10) {
    throw new BadRequestError('Maximum quantity per item is 10');
  }

  // Get cart
  const cart = await prisma.cart.findUnique({
    where: { userId },
  });

  if (!cart) {
    throw new NotFoundError('Cart not found');
  }

  // Get cart item
  const cartItem = await prisma.cartItem.findUnique({
    where: {
      cartId_productId: {
        cartId: cart.id,
        productId,
      },
    },
    include: {
      product: true,
    },
  });

  if (!cartItem) {
    throw new NotFoundError('Cart item not found');
  }

  // Validate stock
  if (cartItem.product.stock < data.quantity) {
    throw new BadRequestError(`Only ${cartItem.product.stock} items available in stock`);
  }

  // Update quantity
  const updatedItem = await prisma.cartItem.update({
    where: {
      id: cartItem.id,
    },
    data: {
      quantity: data.quantity,
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

  return updatedItem;
};

/**
 * Remove item from cart
 */
export const removeCartItem = async (userId: string, productId: string): Promise<void> => {
  // Get cart
  const cart = await prisma.cart.findUnique({
    where: { userId },
  });

  if (!cart) {
    throw new NotFoundError('Cart not found');
  }

  // Get cart item
  const cartItem = await prisma.cartItem.findUnique({
    where: {
      cartId_productId: {
        cartId: cart.id,
        productId,
      },
    },
  });

  if (!cartItem) {
    throw new NotFoundError('Cart item not found');
  }

  // Delete cart item
  await prisma.cartItem.delete({
    where: {
      id: cartItem.id,
    },
  });
};

/**
 * Clear cart
 */
export const clearCart = async (userId: string): Promise<void> => {
  // Get cart
  const cart = await prisma.cart.findUnique({
    where: { userId },
  });

  if (!cart) {
    return; // Cart doesn't exist, nothing to clear
  }

  // Delete all cart items
  await prisma.cartItem.deleteMany({
    where: {
      cartId: cart.id,
    },
  });
};

