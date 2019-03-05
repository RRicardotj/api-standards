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
 * Definition: Update user
 * - operationId: USR_UPD
 * @param {Request} req
 * @param {Response} res
 * @returns {Object} instance of user updated
 */
const updateHandle = async (req, res) => {
  try {
    const data = req.only('name', 'email', 'isEnabled');

    const isValid = await Validator.validateAsync(data, getValidationRules(req.params.id));

    if (isValid !== true) { return res.errorValidation(isValid); }

    const userController = new UserController(User, req.userLanguage);

    const instance = await userController
      .updateUser(req.params.id, data.name, data.email, data.isEnabled);

    return res.send(instance);
  } catch (error) {
    throw error;
  }
};

module.exports = updateHandle;
