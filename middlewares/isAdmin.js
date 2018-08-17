const isAdmin = (req, res, next) => {
  if (req.userType !== 'admin') { return res.error('Acceso no autorizado'); }
  return next();
};

module.exports = isAdmin;
