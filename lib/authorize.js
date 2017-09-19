'use strict';

const errors = require('storj-service-error-types');

const getRole = function (checkRole) {
  if (!checkRole) {
    return new errors.NotImplementedError('Must specify a role');
  }

  let role;

  checkRole.toLowerCase();
  switch (checkRole) {
    case 'admin': role = 3000; break;
    case 'moderator': role = 2000; break;
    case 'user': role = 1000; break;
    default: role = null;
  }

  return role;
};

const authorize = function (storage) {
  return function (requiredRole) {
    const User = storage.models.User;

    return function (req, res, next) {
      req.authorized = false;

      User.findById(req.user._id, (err, user) => {
        if (err) {
          return next(new errors.NotFoundError(err));
        }

        if (role === null) {
          return next(new errors.BadRequestError('Must specify a role'));
        }

        if (!err && getRole(user.role) >= getRole(requiredRole)) {
          req.authorized = true;
          return next();
        }

        return next(new errors.NotAuthorizedError('Unauthorized'));
      });
    };
  }
};

module.exports = authorize;
