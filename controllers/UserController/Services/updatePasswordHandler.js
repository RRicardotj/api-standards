const User = require('../../../models/User');
const UserController = require('./UserController');

/**
 * Definition: Update password
 * - operationId: USR_CHNG_PSS
 * @param {Request} req
 * @param {Response} res
 * @returns {Object} res.json({ message: 'Nueva contraseña...' });
 */
const updatePasswordHandler = async (req, res) => {
  try {
    const userController = new UserController(User, req.userLanguage);

    const user = await userController.updatePassword(req.params.id);

    return res.send({ message: `Nueva contraseña: ${user.plainPassword}` });
  } catch (error) {
    throw error;
  }
};

module.exports = updatePasswordHandler;
