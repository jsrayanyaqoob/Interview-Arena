const { logger } = require('../utils/logger');

/**
 * 404 handler for unknown routes
 */
const notFoundHandler = (req, res, next) => {
  res.status(404).json({
    error: 'Resource not found',
    message: `The requested endpoint ${req.method} ${req.originalUrl} does not exist.`,
  });
};

/**
 * Global error handler
 */
const errorHandler = (err, req, res, next) => {
  logger.error('Unhandled error:', {
    message: err.message,
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
    url: req.originalUrl,
    method: req.method,
  });

  // Prisma errors
  if (err.code && err.code.startsWith('P')) {
    return handlePrismaError(err, res);
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError') {
    return res.status(401).json({
      error: 'Invalid or expired token.',
      code: err.name === 'TokenExpiredError' ? 'TOKEN_EXPIRED' : 'INVALID_TOKEN',
    });
  }

  // Validation errors
  if (err.name === 'ValidationError') {
    return res.status(400).json({
      error: 'Validation error',
      details: err.details || err.message,
    });
  }

  // Default error
  const statusCode = err.statusCode || 500;
  res.status(statusCode).json({
    error: err.message || 'Internal server error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
};

/**
 * Handle Prisma-specific errors
 */
const handlePrismaError = (err, res) => {
  switch (err.code) {
    case 'P2002':
      return res.status(409).json({
        error: 'A record with this value already exists.',
        field: err.meta?.target,
      });
    case 'P2025':
      return res.status(404).json({
        error: 'Record not found.',
      });
    case 'P2003':
      return res.status(400).json({
        error: 'Referenced record does not exist.',
      });
    case 'P2014':
      return res.status(400).json({
        error: 'Invalid relation constraint.',
      });
    default:
      return res.status(500).json({
        error: 'Database error occurred.',
        code: err.code,
      });
  }
};

module.exports = { notFoundHandler, errorHandler };
