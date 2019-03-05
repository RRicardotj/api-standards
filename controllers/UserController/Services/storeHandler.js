const User = require('../../../models/User');
const Validator = require('../../../common/validator');
const UserController = require('./UserController');

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
 * Definition: Store User
 * - operationId: USR_STO
 * @param {Request} req
 * @param {Response} res
 * @returns {Object} instance of user created
 */
const storeHandle = async (req, res) => {
  try {
    const userController = new UserController(User, req.userLanguage);

    const data = req.only('name', 'email', 'isEnabled');

    const isValid = await Validator.validateAsync(data, getValidationRules());

    if (isValid !== true) { return res.errorValidation(isValid); }

    const user = await userController.storeUser(data.name, data.email, data.isEnabled);
    return res.json({
      id: user.id,
      name: user.name,
      isEnabled: user.isEnabled,
      email: user.email,
      roles: 0,
      message: `Contraseña: ${user.plainPassword}`,
    });
  } catch (error) {
    throw error;
  }
};

module.exports = storeHandle;
