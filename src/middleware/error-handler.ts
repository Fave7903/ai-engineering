import { ErrorRequestHandler } from 'express';
import { logger } from '../lib/logger';

export const errorHandler: ErrorRequestHandler = (
  err,
  req,
  res,
  _next,
) => {
  logger.error({
    event: 'request:error',
    method: req.method,
    url: req.originalUrl,
    error: err instanceof Error ? err.message : err,
  });

  res.status(500).json({
    status: 'error',
    message: 'Internal server error',
  });
};