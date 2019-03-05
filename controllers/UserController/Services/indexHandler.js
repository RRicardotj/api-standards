
const User = require('../../../models/User');
const UserController = require('./UserController');

/**
 * Definition: View all users
 * - summary: List of all users
 * - operationId: USR_VIEW
 * @param {Request} req
 * @param {Response} res
 * @returns {Array} instances of users
 */
const indexHandler = async (req, res) => {
  try {
    const userController = new UserController(User, req.userLanguage);
    const instances = await userController.listUsers();
    return res.json(instances);
  } catch (error) {
    throw error;
  }
};

module.exports = indexHandler;
