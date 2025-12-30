import { Request, Response, NextFunction } from 'express';
import {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  getFeaturedProducts,
  getNewProducts,
  getSaleProducts,
} from '../services/product.service';
import { sendSuccess, sendPaginated } from '../utils/api-response';

/**
 * Get products with filtering, sorting, and pagination
 */
export const getProductsController = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const {
      page,
      limit,
      categoryId,
      minPrice,
      maxPrice,
      inStock,
      sustainable,
      featured,
      isNew,
      onSale,
      search,
      sortBy,
      sortOrder,
    } = req.query;

    const filters = {
      ...(categoryId && { categoryId: categoryId as string }),
      ...(minPrice && { minPrice: typeof minPrice === 'string' ? parseFloat(minPrice) : Number(minPrice) }),
      ...(maxPrice && { maxPrice: typeof maxPrice === 'string' ? parseFloat(maxPrice) : Number(maxPrice) }),
      ...(inStock && { inStock: inStock === 'true' }),
      ...(sustainable && { sustainable: sustainable === 'true' }),
      ...(featured !== undefined && { featured: featured === 'true' }),
      ...(isNew !== undefined && { isNew: isNew === 'true' }),
      ...(onSale !== undefined && { onSale: onSale === 'true' }),
      ...(search && { search: search as string }),
    };

    const sortOptions = {
      ...(sortBy && { sortBy: sortBy as any }),
      ...(sortOrder && { sortOrder: sortOrder as 'asc' | 'desc' }),
    };

    const pagination = {
      page: page ? Number(page) : 1,
      limit: limit ? Number(limit) : 20,
    };

    const result = await getProducts(filters, sortOptions, pagination);

    sendPaginated(res, result.products, result.meta, 'Products retrieved successfully');
  } catch (error) {
    next(error);
  }
};

/**
 * Get single product by ID
 */
export const getProductByIdController = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    const product = await getProductById(id);
    sendSuccess(res, product, 'Product retrieved successfully');
  } catch (error) {
    next(error);
  }
};

/**
 * Create new product (admin only)
 */
export const createProductController = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const product = await createProduct(req.body);
    sendSuccess(res, product, 'Product created successfully', 201);
  } catch (error) {
    next(error);
  }
};

/**
 * Update product (admin only)
 */
export const updateProductController = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    const product = await updateProduct(id, req.body);
    sendSuccess(res, product, 'Product updated successfully');
  } catch (error) {
    next(error);
  }
};

/**
 * Delete product (admin only)
 */
export const deleteProductController = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    await deleteProduct(id);
    sendSuccess(res, null, 'Product deleted successfully');
  } catch (error) {
    next(error);
  }
};

/**
 * Get featured products
 */
export const getFeaturedProductsController = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 8;
    const products = await getFeaturedProducts(limit);
    sendSuccess(res, products, 'Featured products retrieved successfully');
  } catch (error) {
    next(error);
  }
};

/**
 * Get new products
 */
export const getNewProductsController = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 8;
    const products = await getNewProducts(limit);
    sendSuccess(res, products, 'New products retrieved successfully');
  } catch (error) {
    next(error);
  }
};

/**
 * Get sale products
 */
export const getSaleProductsController = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 8;
    const products = await getSaleProducts(limit);
    sendSuccess(res, products, 'Sale products retrieved successfully');
  } catch (error) {
    next(error);
  }
};

