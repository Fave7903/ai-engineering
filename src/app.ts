import express from 'express';
import cors from 'cors';
import helmet from 'helmet';

import { config } from './lib/config';
import { logger } from './lib/logger';
import { errorHandler } from './middleware/error-handler';

const app = express();

// Security middleware
app.use(helmet());
app.use(cors());

// Body parsing
app.use(express.json());

// Request logging
app.use((req, res, next) => {
  logger.info({
    event: 'request:received',
    method: req.method,
    url: req.url,
    ip: req.ip,
  });

  next();
});

// Health check
app.get('/health', (_req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    environment: config.NODE_ENV,
  });
});

// Routes will be mounted here as the project grows.
// app.use('/api/v1/auth', authRoutes);
// app.use('/api/v1/documents', documentRoutes);
// app.use('/api/v1/chat', chatRoutes);

// Error handler must be last
app.use(errorHandler);

export { app };