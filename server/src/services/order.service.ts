import prisma from '../config/database';
import { NotFoundError, BadRequestError } from '../utils/api-error';
import { getCart, clearCart } from './cart.service';

export interface ShippingAddress {
  fullName: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  phone?: string;
}

export interface CreateOrderData {
  shippingAddress: ShippingAddress;
  paymentMethod: string;
}

const TAX_RATE = 0.08; // 8% tax rate
const FREE_SHIPPING_THRESHOLD = 100; // Free shipping over $100
const STANDARD_SHIPPING_COST = 10; // Standard shipping cost

/**
 * Calculate shipping cost
 */
export const calculateShipping = (subtotal: number): number => {
  if (subtotal >= FREE_SHIPPING_THRESHOLD) {
    return 0;
  }
  return STANDARD_SHIPPING_COST;
};

/**
 * Calculate tax
 */
export const calculateTax = (subtotal: number, shipping: number): number => {
  return (subtotal + shipping) * TAX_RATE;
};

/**
 * Create order from cart
 */
export const createOrder = async (userId: string, data: CreateOrderData) => {
  // Get user's cart
  const cart = await getCart(userId);

  if (!cart || cart.items.length === 0) {
    throw new BadRequestError('Cart is empty');
  }

  // Validate all products are still available
  for (const item of cart.items) {
    if (item.product.stock < item.quantity) {
      throw new BadRequestError(
        `Insufficient stock for ${item.product.name}. Only ${item.product.stock} available.`
      );
    }
  }

  // Calculate totals
  let subtotal = 0;
  const orderItems = [];

  for (const cartItem of cart.items) {
    const productPrice = Number(cartItem.product.price);
    const discount = cartItem.product.discount || 0;
    const finalPrice = cartItem.product.onSale && discount > 0
      ? productPrice * (1 - discount / 100)
      : productPrice;

    const itemTotal = finalPrice * cartItem.quantity;
    subtotal += itemTotal;

    orderItems.push({
      productId: cartItem.productId,
      quantity: cartItem.quantity,
      price: finalPrice,
    });
  }

  const shipping = calculateShipping(subtotal);
  const tax = calculateTax(subtotal, shipping);
  const total = subtotal + shipping + tax;

  // Create order
  const order = await prisma.order.create({
    data: {
      userId,
      subtotal,
      shipping,
      tax,
      total,
      shippingAddress: data.shippingAddress as any,
      paymentMethod: data.paymentMethod,
      status: 'PENDING',
      items: {
        create: orderItems,
      },
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
      },
    },
  });

  // Update product stock
  for (const cartItem of cart.items) {
    await prisma.product.update({
      where: { id: cartItem.productId },
      data: {
        stock: {
          decrement: cartItem.quantity,
        },
      },
    });
  }

  // Clear cart
  await clearCart(userId);

  return order;
};

/**
 * Get user's orders
 */
export const getUserOrders = async (userId: string, page: number = 1, limit: number = 10) => {
  const skip = (page - 1) * limit;

  const [orders, total] = await Promise.all([
    prisma.order.findMany({
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
        },
      },
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit,
    }),
    prisma.order.count({
      where: { userId },
    }),
  ]);

  const totalPages = Math.ceil(total / limit);

  return {
    orders,
    meta: {
      page,
      limit,
      total,
      totalPages,
    },
  };
};

/**
 * Get single order by ID
 */
export const getOrderById = async (userId: string, orderId: string) => {
  const order = await prisma.order.findUnique({
    where: { id: orderId },
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
      },
    },
  });

  if (!order) {
    throw new NotFoundError('Order not found');
  }

  // Verify order belongs to user (unless admin)
  if (order.userId !== userId) {
    throw new NotFoundError('Order not found');
  }

  return order;
};

/**
 * Update order status (admin only)
 */
export const updateOrderStatus = async (orderId: string, status: string) => {
  const validStatuses = ['PENDING', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED'];

  if (!validStatuses.includes(status)) {
    throw new BadRequestError(`Invalid status. Must be one of: ${validStatuses.join(', ')}`);
  }

  const order = await prisma.order.findUnique({
    where: { id: orderId },
  });

  if (!order) {
    throw new NotFoundError('Order not found');
  }

  // If cancelling, restore product stock
  if (status === 'CANCELLED' && order.status !== 'CANCELLED') {
    const orderItems = await prisma.orderItem.findMany({
      where: { orderId },
    });

    for (const item of orderItems) {
      await prisma.product.update({
        where: { id: item.productId },
        data: {
          stock: {
            increment: item.quantity,
          },
        },
      });
    }
  }

  const updatedOrder = await prisma.order.update({
    where: { id: orderId },
    data: { status: status as any },
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
      },
    },
  });

  return updatedOrder;
};

