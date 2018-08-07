const express = require('express');

const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Validator = require('../common/validator');
const ErrorLogic = require('../common/ErrorLogic');
const withCatchAsync = require('../common/catchAsyncErrors');
const Session = require('../models/Session');
const Browser = require('browser-detect');
const moment = require('moment-timezone');

/**
 * @return {Object} rules
 */
function getValidationRules() {
  return {
    titles: {},
    rules: {
      currentPassword: 'required|min:6',
      newPassword: 'required|confirmed',
    },
    messages: {
      'confirmed.newPassword': 'La confirmación de la nueva contraseña no coincide.',
      'min.currentPassword': 'El campo debe contener el menos 6 caracteres.',
    },
  };
}

/**
 * Definition: Login
 * - operationId: AUTH_SIGNIN
 * @param {Request} req
 * @param {Response} res
 * @returns {Object} res.json({ name, email, token });
 */
const singIn = async (req, res) => {
  const user = await User.findOne({
    where: { email: req.body.email },
    attributes: ['id', 'email', 'password', 'isEnabled', 'name'],
  });

  if (!user) { throw new ErrorLogic('Credenciales inválidas'); }

  if (!user.isEnabled) { throw new ErrorLogic('Usuario desactivado'); }

  const isValid = await bcrypt.compare(req.body.password, user.password);

  if (!isValid) { throw new ErrorLogic('Credenciales inválidas'); }

  const browser = Browser(req.headers['user-agent']);

  const sessionData = {
    browser: `${browser.name} ${browser.version}`,
    userId: user.id,
    ipAddress: (req.headers['x-forwarded-for'] || '').split(',')[0] || req.connection.remoteAddress,
    createdAt: moment.tz(new Date(), process.env.TZ).format('YYYY-MM-DD HH:mm:ss'),
    updatedAt: moment.tz(new Date(), process.env.TZ).format('YYYY-MM-DD HH:mm:ss'),
  };

  const session = await Session.create(sessionData);

  const token = jwt.sign({ user: user.id, session: session.id, type: 'admin' }, process.env.KEY_APP, { expiresIn: '12h' });

  return res.json({ user: user.name, email: user.email, token });
};

/**
 * Definition: Change Password
 * - operationId: AUTH_CHNG_PSS
 * @param {Request} req
 * @param {Response} res
 * @returns {Object} res.json({ message: 'Contraseña Modificada' });
 */
const passwordChange = async (req, res) => {
  const data = req.only('currentPassword', 'newPassword', 'newPassword_confirmation');

  let user = null;
  if (req.userType === 'admin') {
    user = await User.findOne({
      where: { id: req.userId },
      attributes: ['id', 'password', 'email'],
    });
  }

  const isValid = await Validator.validateAsync(data, getValidationRules());

  if (isValid !== true) { return res.errorValidation(isValid); }

  const isValidPassword = await bcrypt.compare(req.body.currentPassword, user.password);

  if (!isValidPassword) { throw new ErrorLogic('Credenciales inválidas'); }

  const hashedPassword = await bcrypt.hash(data.newPassword, 10);

  await user.update({ password: hashedPassword });

  return res.json({ message: 'Contraseña modificada' });
};

const checkHandler = async (req, res) => {
  res.json({ isValid: true });
};

// Signin
router.post('/signin', withCatchAsync(singIn));

// Change Password
router.post('/password', withCatchAsync(passwordChange));

// Check token
router.get('/check', withCatchAsync(checkHandler));

module.exports = router;
