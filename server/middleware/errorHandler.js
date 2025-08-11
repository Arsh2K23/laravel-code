export function errorHandler(err, req, res, next) {
  console.error('Error:', err);

  // Default error
  let error = {
    message: 'Internal Server Error',
    status: 500
  };

  // Validation errors
  if (err.name === 'ValidationError') {
    error.message = err.message;
    error.status = 400;
    error.details = err.details;
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    error.message = 'Invalid token';
    error.status = 401;
  }

  if (err.name === 'TokenExpiredError') {
    error.message = 'Token expired';
    error.status = 401;
  }

  // Database errors
  if (err.code === 'SQLITE_CONSTRAINT_UNIQUE') {
    error.message = 'Duplicate entry';
    error.status = 409;
  }

  // Custom errors
  if (err.status) {
    error.status = err.status;
    error.message = err.message;
  }

  res.status(error.status).json({
    success: false,
    message: error.message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
    ...(error.details && { details: error.details })
  });
}

export class AppError extends Error {
  constructor(message, status = 500) {
    super(message);
    this.status = status;
    this.name = 'AppError';
  }
}