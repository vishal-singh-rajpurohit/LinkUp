class ApiError extends Error {
  constructor(statusCode, message, data, errors = [], stack = "") {
    super(message);
    this.statusCode = statusCode;
    this.message = message;
    this.stack = stack;
    this.errors = errors;
    this.data = data || {};
    this.success = false;

    if (stack) {
      this.stack = stack;
    } else {
      Error.captureStackTrace(this, this.constructor);
    }
  }
}


module.exports = ApiError;