const CustomError = require('../common/CustomError');

module.exports = class Handler {
  constructor(model) {
    if (!model) { return null; }
    this.model = model;
    this.CustomError = CustomError;
  }
};
