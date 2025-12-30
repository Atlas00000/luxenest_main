import { Request, Response, NextFunction } from 'express';
import {
  getCategories,
  getCategoryById,
  getCategoryBySlug,
  createCategory,
  updateCategory,
  deleteCategory,
} from '../services/category.service';
import { sendSuccess } from '../utils/api-response';

/**
 * Get all categories
 */
export const getCategoriesController = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const featuredOnly = req.query.featured === 'true';
    const categories = await getCategories(featuredOnly);
    sendSuccess(res, categories, 'Categories retrieved successfully');
  } catch (error) {
    next(error);
  }
};

/**
 * Get single category by ID
 */
export const getCategoryByIdController = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    const category = await getCategoryById(id);
    sendSuccess(res, category, 'Category retrieved successfully');
  } catch (error) {
    next(error);
  }
};

/**
 * Get category by slug
 */
export const getCategoryBySlugController = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { slug } = req.params;
    const category = await getCategoryBySlug(slug);
    sendSuccess(res, category, 'Category retrieved successfully');
  } catch (error) {
    next(error);
  }
};

/**
 * Create new category (admin only)
 */
export const createCategoryController = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const category = await createCategory(req.body);
    sendSuccess(res, category, 'Category created successfully', 201);
  } catch (error) {
    next(error);
  }
};

/**
 * Update category (admin only)
 */
export const updateCategoryController = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    const category = await updateCategory(id, req.body);
    sendSuccess(res, category, 'Category updated successfully');
  } catch (error) {
    next(error);
  }
};

/**
 * Delete category (admin only)
 */
export const deleteCategoryController = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    await deleteCategory(id);
    sendSuccess(res, null, 'Category deleted successfully');
  } catch (error) {
    next(error);
  }
};

