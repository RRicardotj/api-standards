
const User = require('../../../models/User');
const Browser = require('browser-detect');
const AuthController = require('./AuthController');

/**
 * Definition: Login
 * - operationId: AUTH_SIGNIN
 * @param {Request} req
 * @param {Response} res
 * @returns {Object} res.json({ name, email, token });
 */
const singInHandler = async (req, res) => {
  try {
    const browserDetails = {
      browser: Browser(req.headers['user-agent']),
      ipAddress: (req.headers['x-forwarded-for'] || '').split(',')[0] || req.connection.remoteAddress,
    };

    const { email, password } = req.body;

    const authController = new AuthController(User, req.query.lenguage);
    const response = await authController.signIn(email, password, browserDetails);

    return res.json(response);
  } catch (error) {
    throw error;
  }
};

module.exports = singInHandler;
