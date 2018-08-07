const express = require('express');

const router = express.Router();
const Validator = require('../common/validator');
const User = require('../models/User');
const ErrorLogic = require('../common/ErrorLogic');
const bcrypt = require('bcryptjs');
const randomstring = require('randomstring');
const withCatchAsync = require('../common/catchAsyncErrors');
const sequelize = require('../common/connection');
const Session = require('../models/Session');


/**
 * @return {Object} rules
 */
function getValidationRules(id) {
  return {
    rules: {
      name: 'required',
      email: `required|email|unique:users,email,${id}`,
      isEnabled: 'required|boolean',
    },
    messages: {},
  };
}

/**
 * @return {String} random string generated
 */
function getRandomPassword() {
  return randomstring.generate({ length: 6, charset: 'numeric' });
}

/**
 * Definition: View all users
 * - summary: List of all users
 * - operationId: USR_VIEW
 * @param {Request} req
 * @param {Response} res
 * @returns {Array} instances of users
 */
const indexHandler = async (req, res) => {
  const instances = await User.index();
  return res.json(instances);
};

/**
 * Definition: View all user sessions
 * operationId: USR_SESS
 * @param {Request} req
 * @param {Response} res
 * @return {Object} { rows, page, totalPages }
 */
const getSessions = async (req, res) => {
  if (req.query.from) { req.query.from = `${req.query.from} 00:00:00`; }
  if (req.query.to) { req.query.to = `${req.query.to} 23:59:59`; }
  if (req.query.page < 1 || !req.query.page) { req.query.page = 1; }

  const offset = (req.query.page - 1) * 10;
  const response = await sequelize.transaction(async (t) => {
    const instances = await Session
      .getSessions(req.params.id, req.query.from, req.query.to, true, 10, offset, t);

    const total = await Session.foundRows(t);
    const elements = total[0].total;
    let totalPages = Math.ceil(elements / 10);

    totalPages = (totalPages === 0 ? 1 : totalPages);

    return { rows: instances, page: req.query.page, totalPages };
  });
  return res.json(response);
};

/**
 * Definition: Store User
 * - operationId: USR_STO
 * @param {Request} req
 * @param {Response} res
 * @returns {Object} instance of user created
 */
const storeHandle = async (req, res) => {
  const data = req.only('name', 'email', 'isEnabled');

  const isValid = await Validator.validateAsync(data, getValidationRules());

  if (isValid !== true) { return res.errorValidation(isValid); }

  const user = await sequelize.transaction(async (t) => {
    const plainPassword = getRandomPassword();

    data.password = await bcrypt.hash(plainPassword, 10);

    let userInstance = await User.create(data, { transaction: t });

    userInstance = userInstance.toJSON();
    userInstance.message = `Contraseña: ${plainPassword}`;
    return userInstance;
  });
  return res.json({
    id: user.id,
    name: user.name,
    isEnabled: user.isEnabled,
    email: user.email,
    roles: 0,
    message: user.message,
  });
};

/**
 * Definition: Update user
 * - operationId: USR_UPD
 * @param {Request} req
 * @param {Response} res
 * @returns {Object} instance of user updated
 */
const updateHanlde = async (req, res) => {
  const data = req.only('name', 'email', 'isEnabled');

  const isValid = await Validator.validateAsync(data, getValidationRules(req.params.id));

  if (isValid !== true) { return res.errorValidation(isValid); }

  let instance = await User.findById(req.params.id);
  if (!instance) { throw new ErrorLogic('NOT_FOUND'); }


  instance = await instance.update(data);
  const item = instance.toJSON();

  item.roles = 0;
  item.id = instance.id;

  return res.send(item);
};

/**
 * Definition: Update password
 * - operationId: USR_CHNG_PSS
 * @param {Request} req
 * @param {Response} res
 * @returns {Object} res.json({ message: 'Nueva contraseña...' });
 */
const updatePassword = async (req, res) => {
  const instance = await User.findById(req.params.id);

  if (!instance) { throw new ErrorLogic('NOT_FOUND'); }

  const plainPassword = getRandomPassword();

  const hashedPassword = await bcrypt.hash(plainPassword, 10);

  await instance.update({ password: hashedPassword });

  return res.send({ message: `Nueva contraseña: ${plainPassword}` });
};

// Index
router.get('/', withCatchAsync(indexHandler));

router.get('/:id(\\d+)/sessions', withCatchAsync(getSessions));

// Store
router.post('/', withCatchAsync(storeHandle));

// Update
router.put('/:id(\\d+)/', withCatchAsync(updateHanlde));

// Update
router.put('/:id(\\d+)/password', withCatchAsync(updatePassword));

module.exports = router;
