const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../../../models/User');
const ErrorLogic = require('../../../common/ErrorLogic');
const Session = require('../../../models/Session');
const Browser = require('browser-detect');
const moment = require('moment-timezone');

/**
 * Definition: Login
 * - operationId: AUTH_SIGNIN
 * @param {Request} req
 * @param {Response} res
 * @returns {Object} res.json({ name, email, token });
 */
const singInHandler = async (req, res) => {
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

const signInController = async (email, password, browser) => {
  const user = await User.findOne({
    where: { email },
    attributes: ['id', 'email', 'password', 'isEnabled', 'name'],
  });

  if (!user) { throw new ErrorLogic('Credenciales inválidas'); }

  if (!user.isEnabled) { throw new ErrorLogic('Usuario desactivado'); }

  const isValid = await bcrypt.compare(password, user.password);

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

exports.singInHandler = singInHandler;
