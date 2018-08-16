const User = require('../models/User');

const userHasAcess = async (userId, grantCode, throwException = true) => {
  const access = await User.hasAccess(userId, grantCode);
  if (!access && throwException) { return 'Sin Acceso'; }
  return access;
};

module.exports = {
  userHasAcess,
};

