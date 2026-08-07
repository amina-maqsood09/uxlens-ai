const AppError = require('../utils/appError');

/** 404 handler — unknown routes. */
function notFoundHandler(req, res, next) {
  next(new AppError(404, `Route not found: ${req.method} ${req.originalUrl}`));
}

/**
 * Central error handler.
 * Errors created with AppError (statusCode + expose) are shown verbatim;
 * anything else (unexpected crashes) returns a generic 500 message.
 */
// eslint-disable-next-line no-unused-vars
function errorHandler(err, req, res, next) {
  const status = err.statusCode || 500;
  const message = err.expose ? err.message : 'Something went wrong on our end. Please try again.';

  if (status >= 500) {
    console.error(`[${new Date().toISOString()}]`, err);
  }

  res.status(status).json({ error: message });
}

module.exports = { notFoundHandler, errorHandler };
