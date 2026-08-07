/**
 * Simple error type that carries an HTTP status code and a
 * client-safe message. Used across the backend so the error
 * handler can respond consistently.
 */
class AppError extends Error {
  constructor(statusCode, message) {
    super(message);
    this.statusCode = statusCode;
    this.expose = true; // safe to show `message` to the client
  }
}

module.exports = AppError;
