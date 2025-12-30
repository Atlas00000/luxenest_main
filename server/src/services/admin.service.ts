import prisma from '../config/database';
import { getCache, setCache, CacheKeys, CACHE_TTL } from '../utils/cache.util';

/**
 * Get admin dashboard statistics
 */
export const getAdminStats = async (dateRange: string = '30d') => {
  // Try cache first
  const cacheKey = CacheKeys.adminStats(dateRange);
  const cached = await getCache(cacheKey);
  if (cached) {
    return cached;
  }

  // Calculate date range
  const now = new Date();
  let startDate: Date;

  switch (dateRange) {
    case '7d':
      startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      break;
    case '30d':
      startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      break;
    case '90d':
      startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
      break;
    case '1y':
      startDate = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
      break;
    default:
      startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  }

  // Get revenue (from orders)
  const orders = await prisma.order.findMany({
    where: {
      createdAt: { gte: startDate },
      status: { not: 'CANCELLED' },
    },
    select: {
      total: true,
      createdAt: true,
    },
  });

  const revenue = orders.reduce((sum, order) => sum + Number(order.total), 0);
  const orderCount = orders.length;

  // Get total users
  const totalUsers = await prisma.user.count();

  // Get new users in date range
  const newUsers = await prisma.user.count({
    where: {
      createdAt: { gte: startDate },
    },
  });

  // Get total products
  const totalProducts = await prisma.product.count();

  // Get low stock products (stock < 10)
  const lowStockProducts = await prisma.product.count({
    where: {
      stock: { lt: 10 },
    },
  });

  // Get total orders (all time)
  const totalOrders = await prisma.order.count({
    where: {
      status: { not: 'CANCELLED' },
    },
  });

  // Get orders by status
  const ordersByStatus = await prisma.order.groupBy({
    by: ['status'],
    _count: {
      id: true,
    },
  });

  // Calculate average order value
  const averageOrderValue = orderCount > 0 ? revenue / orderCount : 0;

  // Get revenue growth (compare with previous period)
  const previousStartDate = new Date(startDate.getTime() - (now.getTime() - startDate.getTime()));
  const previousOrders = await prisma.order.findMany({
    where: {
      createdAt: { gte: previousStartDate, lt: startDate },
      status: { not: 'CANCELLED' },
    },
    select: {
      total: true,
    },
  });

  const previousRevenue = previousOrders.reduce((sum, order) => sum + Number(order.total), 0);
  const revenueGrowth = previousRevenue > 0 
    ? ((revenue - previousRevenue) / previousRevenue) * 100 
    : 0;

  const stats = {
    revenue: {
      total: revenue,
      growth: revenueGrowth,
      averageOrderValue,
    },
    orders: {
      total: totalOrders,
      recent: orderCount,
      byStatus: ordersByStatus.reduce((acc, item) => {
        acc[item.status] = item._count.id;
        return acc;
      }, {} as Record<string, number>),
    },
    users: {
      total: totalUsers,
      new: newUsers,
    },
    products: {
      total: totalProducts,
      lowStock: lowStockProducts,
    },
  };

  // Cache stats (short TTL since stats change frequently)
  await setCache(cacheKey, stats, CACHE_TTL.SHORT);

  return stats;
};

/**
 * Get all orders for admin (with filters)
 */
export const getAdminOrders = async (
  page: number = 1,
  limit: number = 20,
  status?: string,
  startDate?: Date,
  endDate?: Date
) => {
  const skip = (page - 1) * limit;

  const where: any = {};

  if (status) {
    where.status = status;
  }

  if (startDate || endDate) {
    where.createdAt = {};
    if (startDate) {
      where.createdAt.gte = startDate;
    }
    if (endDate) {
      where.createdAt.lte = endDate;
    }
  }

  const [orders, total] = await Promise.all([
    prisma.order.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        items: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                images: true,
              },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit,
    }),
    prisma.order.count({ where }),
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
 * Get all users for admin
 */
export const getAdminUsers = async (page: number = 1, limit: number = 20, search?: string) => {
  const skip = (page - 1) * limit;

  const where: any = {};

  if (search) {
    where.OR = [
      { name: { contains: search, mode: 'insensitive' } },
      { email: { contains: search, mode: 'insensitive' } },
    ];
  }

  const [users, total] = await Promise.all([
    prisma.user.findMany({
      where,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        avatar: true,
        emailVerified: true,
        createdAt: true,
        _count: {
          select: {
            orders: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit,
    }),
    prisma.user.count({ where }),
  ]);

  const totalPages = Math.ceil(total / limit);

  return {
    users,
    meta: {
      page,
      limit,
      total,
      totalPages,
    },
  };
};

/**
 * Get all products for admin
 */
export const getAdminProducts = async (
  page: number = 1,
  limit: number = 20,
  search?: string,
  lowStock?: boolean
) => {
  const skip = (page - 1) * limit;

  const where: any = {};

  if (search) {
    where.OR = [
      { name: { contains: search, mode: 'insensitive' } },
      { description: { contains: search, mode: 'insensitive' } },
    ];
  }

  if (lowStock) {
    where.stock = { lt: 10 };
  }

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
        _count: {
          select: {
            reviews: true,
            cartItems: true,
            wishlistItems: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit,
    }),
    prisma.product.count({ where }),
  ]);

  const totalPages = Math.ceil(total / limit);

  return {
    products,
    meta: {
      page,
      limit,
      total,
      totalPages,
    },
  };
};

