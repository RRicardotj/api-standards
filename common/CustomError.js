module.exports = class CustomError extends Error {
  constructor(message, status = 500, code) {
    super();
    this.message = message;
    this.status = status;
    this.code = code;
  }
};
