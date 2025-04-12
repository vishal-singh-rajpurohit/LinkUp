class ApiError extends Error {
  constructor(statusCode, message, errors = [], stack = "", data) {
    super(message);
    this.statusCode = statusCode;
    this.message = message;
    this.stack = stack;
    this.errors = errors;
    this.success = false;

    if (stack) {
      this.stack = stack;
    } else {
      Error.captureStackTrace(this, this.constructor);
    }
  }
}


module.exports = ApiError;