import { Request, Response, NextFunction } from 'express';
import { AppError } from '../lib/errors';
import { logger } from '../lib/logger'; 

export function errorHandler(
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
) {
  // Operational error: we created this intentionally
  if (err instanceof AppError) {
    logger.warn({
      code: err.code,
      message: err.message,
      details: err.details,
    });
    
    return res.status(err.statusCode).json({
      success: false,
      error: {
        code: err.isOperational ? err.code : 500,
        message: err.isOperational ? err.message : 'Internal server error',
        ...(err.details && err.isOperational && { details: err.details }),
      },
    });
  }

 // Programming error: this is a bug
  logger.error({
    message: 'Unhandled error',
    errorMessage: err instanceof Error ? err.message : String(err),
    stack: err instanceof Error ? err.stack : undefined,
  });
  
  return res.status(500).json({
    success: false,
    error: {
      code: 'INTERNAL_ERROR',
      message: 'An unexpected error occurred',
    },
  });
}