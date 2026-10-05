import express from 'express';
import cors from 'cors';
import helmet from 'helmet';

import { config } from './lib/config';
import { logger } from './lib/logger';
import { errorHandler } from './middleware/error-handler';
import './events/auth.events';
import './events/admin.events';
import adminRoutes from './routes/admin';
import authRoutes from './routes/auth';
import documentRoutes from './routes/documents';
import conversationRoutes from './routes/conversations';
import swaggerUi from 'swagger-ui-express';
import { swaggerSpec } from './config/swagger';

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

// Serve Swagger UI
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Also serve the raw JSON spec (useful for code generators)
app.get('/api-docs.json', (req, res) => {
  res.json(swaggerSpec);
});

app.use(
  '/api/v1/auth',
  authRoutes,
);

app.use(
  '/api/v1/admin',
  adminRoutes,
);

app.use(
  '/api/v1/documents',
  documentRoutes,
);

app.use(
  '/api/v1/conversations', 
  conversationRoutes
);

// Health check
app.get('/health', (_req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    environment: config.NODE_ENV,
  });
});

// 404 handler for unknown routes
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: { 
      code: 'NOT_FOUND', 
      message: `Route ${req.path} not found` 
    },
  });
});

// Global error handler (MUST be last)
app.use(errorHandler);

export { app };