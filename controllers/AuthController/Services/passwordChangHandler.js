const User = require('../../../models/User');
const Validator = require('../../../common/validator');
const AuthController = require('./AuthController');


/**
 * @return {Object} rules
 */
function getValidationRules() {
  return {
    titles: {},
    rules: {
      currentPassword: 'required|min:5',
      newPassword: 'required|confirmed',
    },
    messages: {
      'confirmed.newPassword': 'La confirmación de la nueva contraseña no coincide.',
      'min.currentPassword': 'El campo debe contener el menos 6 caracteres.',
    },
  };
}


/**
 * Definition: Change Password
 * - operationId: AUTH_CHNG_PSS
 * @param {Request} req
 * @param {Response} res
 * @returns {Object} res.json({ message: 'Contraseña Modificada' });
 */
const passwordChangeHandler = async (req, res) => {
  try {
    const data = req.only('currentPassword', 'newPassword', 'newPasswordConfirmation');

    data.newPassword_confirmation = data.newPasswordConfirmation;

    const isValid = await Validator.validateAsync(data, getValidationRules());

    if (isValid !== true) { return res.errorValidation(isValid); }

    const authController = new AuthController(User, req.userLanguage);

    const response = await authController
      .passwordChange(req.userId, data.currentPassword, data.newPassword);

    return res.json(response);
  } catch (error) {
    throw error;
  }
};

module.exports = passwordChangeHandler;
