const ACL = require('../common/ACL');

const grant = code => async (req, res, next) => {
  const result = await ACL.userHasAcess(req.userId, code);
  if (!result) { return res.error('Acceso no autorizado'); }
  return next();
};

module.exports = grant;
