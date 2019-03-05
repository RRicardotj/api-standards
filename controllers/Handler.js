const CustomError = require('../common/CustomError');
const LITERALS = require('../utils/LITERALS');
const moment = require('moment-timezone');
const Validator = require('../common/validator');
const sequelize = require('../common/connection');

class Handler {
  constructor(model, lenguage = 'en') {
    // if (!model) { return null; }
    this.model = model;
    this.CustomError = CustomError;
    this.LITERALS = LITERALS;
    this.lenguage = lenguage;
    this.moment = moment;
    this.Validator = Validator;
    this.transaction = sequelize.transaction;

    this.getMessage = this.getMessage.bind(this);
    this.findById = this.findById.bind(this);
    this.findOne = this.findOne.bind(this);
    this.findAll = this.findAll.bind(this);
    this.create = this.create.bind(this);
    this.bulkCreate = this.bulkCreate.bind(this);
    this.update = this.update.bind(this);
    this.destroy = this.destroy.bind(this);
  }

  getMessage(LITERAL) {
    return this.LITERALS.getMessage(LITERAL, this.lenguage);
  }

  /**
   * Find by id
   * @param {Integer} id entity id
   * @param {Object} params sequelize configuration params
   * @returns {Promise} model findById
   */
  findById(id, params) {
    if (!this.model) {
      throw new this
        .CustomError(this.getMessage(this.LITERALS.NOT_MODEL), null, this.LITERALS.NOT_MODEL);
    }
    return this.model.findById(id, params);
  }

  /**
   * Find one
   * @param {Object} params sequelize configuration params
   * @returns {Promise} model findOne
   */
  findOne(params) {
    if (!this.model) {
      throw new this
        .CustomError(this.getMessage(this.LITERALS.NOT_MODEL), null, this.LITERALS.NOT_MODEL);
    }
    return this.model.findOne(params);
  }

  /**
   * Find all
   * @param {Object} params sequelize configuration params
   * @returns {Promise} model findAll
   */
  findAll(params) {
    if (!this.model) {
      throw new this
        .CustomError(this.getMessage(this.LITERALS.NOT_MODEL), null, this.LITERALS.NOT_MODEL);
    }
    return this.model.findAll(params);
  }

  /**
   * Create a instance
   * @param {Object} data data
   * @param {Object} params sequelize configuration params
   * @returns {Promise} model create
   */
  create(data, params) {
    if (!this.model) {
      throw new this
        .CustomError(this.getMessage(this.LITERALS.NOT_MODEL), null, this.LITERALS.NOT_MODEL);
    }

    return this.model.create(data, params);
  }

  /**
   * Create multiples instances
   * @param {Object} data data
   * @param {Object} params sequelize configuration params
   * @returns {Promise} model bulkCreate
   */
  bulkCreate(data, params) {
    if (!this.model) {
      throw new this
        .CustomError(this.getMessage(this.LITERALS.NOT_MODEL), null, this.LITERALS.NOT_MODEL);
    }

    return this.model.bulkCreate(data, params);
  }

  /**
   * Update entity
   * @param {Object} data data
   * @param {Object} params sequelize configuration params
   * @returns {Promise} model update
   */
  update(data, params) {
    if (!this.model) {
      throw new this
        .CustomError(this.getMessage(this.LITERALS.NOT_MODEL), null, this.LITERALS.NOT_MODEL);
    }

    return this.model.update(data, params);
  }

  /**
   * Create a destroy
   * @param {Object} params sequelize configuration params
   * @returns {Promise} model destroy
   */
  destroy(params) {
    if (!this.model) {
      throw new this
        .CustomError(this.getMessage(this.LITERALS.NOT_MODEL), null, this.LITERALS.NOT_MODEL);
    }

    return this.model.destroy(params);
  }
}


module.exports = Handler;

