const UserController = require('./UserController');
const Session = require('../../../models/Session');

/**
 * Definition: View all user sessions
 * operationId: USR_SESS
 * @param {Request} req
 * @param {Response} res
 * @return {Object} { rows, page, totalPages }
 */
const getSessionsHandler = async (req, res) => {
  try {
    const userController = new UserController(Session, req.userLanguage);
    if (req.query.from) { req.query.from = `${req.query.from} 00:00:00`; }
    if (req.query.to) { req.query.to = `${req.query.to} 23:59:59`; }
    if (req.query.page < 1 || !req.query.page) { req.query.page = 1; }

    const offset = (req.query.page - 1) * 10;
    const response = await userController
      .getSessions(req.userId, req.query.from, req.query.to, offset);

    response.page = req.query.page;

    return res.json(response);
  } catch (error) {
    throw error;
  }
};

module.exports = getSessionsHandler;
