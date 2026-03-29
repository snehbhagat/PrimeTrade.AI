const { sendError } = require('../utils/response');

const authorizeRoles = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return sendError(res, 403, 'Access denied: insufficient permissions');
    }
    next();
  };
};

module.exports = { authorizeRoles };