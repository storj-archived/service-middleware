'use strict';

const expect = require('chai').expect;
const sinon = require('sinon');
const middlewares = require('../');
const errors = require('storj-service-error-types');
const authorize = middlewares.authorize;

describe('Authorize', function() {
  describe('middleware', function() {
    const sandbox = sinon.sandbox.create();

    afterEach(function() {
      sandbox.restore();
    });

    it('should give error if no user found', function (done) {
      const storage = {
        models: {
          User: {
            findById: sinon.stub().callsArgWith(1, new Error('Panic!!!'), undefined)
          }
        }
      };

      const req = {
        user: {
          _id: 'lott.dylan@gmail.com',
          role: 'admin'
        }
      };
      const res = {};
      const authMiddleware = authorize(storage)('admin');

      authMiddleware(req, res, function(err, user) {
        expect(err).to.be.instanceOf(Error);
        expect(err.code).to.equal(404);
        expect(user).to.be.undefined;
        expect(req.authorized).to.equal(false);
        done();
      });
    });

    it('should give error if user does not have permissions', function (done) {
      const user = {
        _id: 'dylan@storj.io',
        role: 'user'
      }

      const storage = {
        models: {
          User: {
            findById: sinon.stub().callsArgWith(1, null, user)
          }
        }
      }

      const req = {
        user: user
      };
      const res = {};

      const authMiddleware = authorize(storage)('admin');

      authMiddleware(req, res, function(err) {
        expect(err).to.be.instanceOf(Error);
        expect(req.authorized).to.equal(false);
        done();
      });
    });

    it('should pass next if user is found and has permissions', function (done) {
      const user = {
        _id: 'dylan@storj.io',
        role: 'admin'
      }

      const storage = {
        models: {
          User: {
            findById: sinon.stub().callsArgWith(1, null, user)
          }
        }
      }

      const req = {
        user: user
      };
      const res = {};

      const authMiddleware = authorize(storage)('admin');

      authMiddleware(req, res, function(err) {
        expect(err).to.equal(undefined);
        expect(req.authorized).to.equal(true);
        done();
      });
    });

    it('should default permissions to `user`', function (done) {
      const user = {
        _id: 'dylan@storj.io'
      }

      const storage = {
        models: {
          User: {
            findById: sinon.stub().callsArgWith(1, new Error('Panic!!!'))
          }
        }
      }

      const req = {
        user: user
      };
      const res = {};

      const authMiddleware = authorize(storage)('admin');

      authMiddleware(req, res, function(err) {
        expect(req.authorized).to.equal(false);
        expect(err).to.be.instanceOf(Error);
        done();
      });
    });

    it('should allow higher permissions to do lower level tasks', function (done) {
      const user = {
        _id: 'dylan@storj.io',
        role: 'moderator'
      }

      const storage = {
        models: {
          User: {
            findById: sinon.stub().callsArgWith(1, null, user)
          }
        }
      }

      const req = {
        user: user
      };
      const res = {};

      const authMiddleware = authorize(storage)('user');

      authMiddleware(req, res, function(err) {
        expect(req.authorized).to.equal(true);
        expect(err).to.be.undefined;
        done();
      });
    });

    it('should throw error if no role is passed to `authorize` middleware', function (done) {
      const user = {
        _id: 'dylan@storj.io',
        role: 'user'
      }

      const storage = {
        models: {
          User: {
            findById: sinon.stub().callsArgWith(1, null, user)
          }
        }
      }

      const req = {
        user: user
      };
      const res = {};

      const authMiddleware = authorize(storage)();

      authMiddleware(req, res, function(err, role) {
        expect(err).to.be.instanceOf(Error);
        expect(req.authorized).to.equal(false);
        done();
      });
    });
  });
});
