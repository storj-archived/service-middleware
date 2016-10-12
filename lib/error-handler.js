/**
 * @module storj-bridge/server/middleware/error-handler
 */

'use strict';

module.exports = function ErrorHandlerFactory(options) {
  var log = options.logger || console;

  return function errorhandler(err, req, res, next) {
    if (err) {
      log.error('request error: %s', err.message);
      log.error(err.stack);

      var statusCode = err.code ? (err.code > 500 ? 400 : err.code) : 500;
      return res.status(statusCode).send({ error: err.message });
    }

    next();
  }
};
