'use strict';

const errors = require('storj-service-error-types');

const getRole = function (checkRole) {
  let role;

  checkRole.toLowerCase();
  switch (checkRole) {
    case 'admin': role = 3000; break;
    case 'moderator': role = 2000; break;
    case 'user': role = 1000; break;
    default: role = 1000;
  }

  return role;
};

const authorize = function (storage) {
  return function (requiredRole) {
    const User = storage.models.User;

    return function (req, res, next) {
      User.findById(req.user._id, (err, user) => {
        console.log('middleware err: ', err);
        console.log('middleware user: ', user);

        if (err) {
          return next(new errors.NotFoundError(err));
        }

        console.log(getRole(user.role));
        console.log(getRole(requiredRole));

        if (getRole(user.role) >= getRole(requiredRole)) {
          return next();
        }

        return next(new errors.NotAuthorizedError('Unauthorized'));
      });
    };
  }
};

module.exports = authorize;
