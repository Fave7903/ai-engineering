import { Request, Response, NextFunction } from 'express';
import { z, ZodError } from 'zod'; // Make sure ZodError is imported

export function validate(schema: z.ZodSchema) {
  return (req: Request, res: Response, next: NextFunction) => {
    const result = schema.safeParse({
      body: req.body,
      query: req.query,
      params: req.params,
    });

    if (!result.success) {
      // Use result.error.issues or cast explicitly to ZodError
      const errors = (result.error as ZodError).issues.map(err => ({
        field: err.path.slice(1).join('.'), // Remove 'body'/'query' prefix
        message: err.message,
      }));

      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Request validation failed',
          details: errors,
        }
      });
    }

    // Replace req properties with validated (and transformed) data
    // Cast result.data so TypeScript knows it might contain these Express properties
    // Replace req properties with validated (and transformed) data
    const validatedData = result.data as { body?: any; query?: any; params?: any };

    if (validatedData.body) {
      req.body = validatedData.body;
    }
    if (validatedData.query) {
      Object.assign(req.query, validatedData.query);
    }
    if (validatedData.params) {
      Object.assign(req.params, validatedData.params);
    }
    
    next();
  };
}
