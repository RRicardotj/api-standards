const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Session = require('../models/Session');
const moment = require('moment-timezone');

const jwtAuth = (req, res, next) => {
  if (req.path === '/' || req.path === '/auth/signin') {
    return next();
  }

  let token = req.headers.authorization || req.query.token;

  if (!token) { return res.error('TOKEN_NOT_PROVIDED', 403, req.path); }

  token = token.split(' ');

  jwt.verify(
    (token.length > 1 ? token[1] : token[0]),
    process.env.KEY_APP, async (err, decoded) => {
      if (err) {
        console.log(err.message); // eslint-disable-line
        return res.error('TOKEN_INVALID', 403, req.path);
      }

      if (decoded.type === 'admin') {
        const instance = await User.findOne({ where: { id: decoded.user }, attributes: ['isEnabled'] }).catch(res.handleReject.bind(res));
        if (instance.isEnabled) {
          req.userId = decoded.user;
          req.sessionId = decoded.session;
          req.userType = decoded.type;
          await Session.update({ updatedAt: moment.tz(new Date(), process.env.TZ).format('YYYY-MM-DD HH:mm:ss') }, { where: { id: req.sessionId } });
          return next();
        }

        return res.error('Usuario desactivado', 403, req.path);
      }

      if (decoded.type !== 'admin') {
        return res.error('Usuario ivalido', 403, req.path);
      }

      return res.error('Usuario ivalido', 403, req.path);
    },
  );
  return undefined;
};

module.exports = jwtAuth;
