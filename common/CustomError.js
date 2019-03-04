module.exports = class CustomError extends Error {
  constructor(LITERAL, status = 500) {
    super();
    this.LITERAL = LITERAL;
    this.status = status;
  }
};
