import { Request, Response, NextFunction } from 'express';
import { ZodSchema, ZodError } from 'zod';
import { BadRequestError } from '../utils/api-error';

/**
 * Validate request body, query, or params against a Zod schema
 */
export const validate = (schema: ZodSchema) => {
  return (req: Request, _res: Response, next: NextFunction): void => {
    try {
      schema.parse({
        body: req.body,
        query: req.query,
        params: req.params,
      });
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const errorMessages = error.errors.map((err) => ({
          path: err.path.join('.'),
          message: err.message,
        }));
        
        throw new BadRequestError(
          `Validation error: ${errorMessages.map((e) => e.message).join(', ')}`
        );
      }
      next(error);
    }
  };
};

