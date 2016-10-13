'use strict';

const expect = require('chai').expect;
const sinon = require('sinon');

const middlewares = require('..');
const errors = require('storj-service-error-types');

describe('Authenticate', function() {
  describe('middleware', function() {
    var sandbox = sinon.sandbox.create();
    afterEach(function() {
      sandbox.restore();
    });
    it('will return raw body middleware as first item', function() {
      var storage = {};
      var authenticate = middlewares.authenticate(storage);
      expect(authenticate[0]).to.equal(require('../lib/rawbody'));
    });
    it('will call basic authentication method when type is BASIC', function(done) {
      var req = {};
      var res = {};
      var storage = {};
      sandbox.stub(middlewares.authenticate, '_detectStrategy').returns('BASIC');
      sandbox.stub(middlewares.authenticate, '_basic').callsArg(3);
      var authenticate = middlewares.authenticate(storage)[1];
      authenticate(req, res, function() {
        expect(middlewares.authenticate._basic.callCount).to.equal(1);
        done();
      });
    });
    it('will call ecdsa authentication method when type is ECDSA', function(done) {
      var req = {};
      var res = {};
      var storage = {};
      sandbox.stub(middlewares.authenticate, '_detectStrategy').returns('ECDSA');
      sandbox.stub(middlewares.authenticate, '_ecdsa').callsArg(3);
      var authenticate = middlewares.authenticate(storage)[1];
      authenticate(req, res, function() {
        expect(middlewares.authenticate._ecdsa.callCount).to.equal(1);
        done();
      });
    });
    it('will give not authorized error when type is NONE', function(done) {
      var req = {};
      var res = {};
      var storage = {};
      sandbox.stub(middlewares.authenticate, '_detectStrategy').returns('NONE');
      var authenticate = middlewares.authenticate(storage)[1];
      authenticate(req, res, function(err) {
        expect(err).to.be.instanceOf(errors.NotAuthorizedError);
        done();
      });
    });
    it('will give not authorized error when type is unknown', function(done) {
      var req = {};
      var res = {};
      var storage = {};
      sandbox.stub(middlewares.authenticate, '_detectStrategy').returns(undefined);
      var authenticate = middlewares.authenticate(storage)[1];
      authenticate(req, res, function(err) {
        expect(err).to.be.instanceOf(errors.NotAuthorizedError);
        done();
      });
    });
  });
  describe('#_basic', function() {
    var sandbox = sinon.sandbox.create();
    afterEach(function() {
      sandbox.restore();
    });
    it('will set user property on req', function(done) {
      var req = {
        headers: {
          'authorization': 'Basic QWxhZGRpbjpPcGVuU2VzYW1l'
        }
      };
      var res = {};
      var user = {
        activated: true
      };
      var storage = {
        models: {
          User: {
            lookup: sinon.stub().callsArgWith(2, null, user)
          }
        }
      };
      middlewares.authenticate._basic(storage, req, res, function(err) {
        if (err) {
          return done(err);
        }
        expect(req.user).to.equal(user);
        done();
      });
    });
    it('will give error if user not activated', function(done) {
      var req = {
        headers: {
          'authorization': 'Basic QWxhZGRpbjpPcGVuU2VzYW1l'
        }
      };
      var res = {};
      var user = {
        activated: false
      };
      var storage = {
        models: {
          User: {
            lookup: sinon.stub().callsArgWith(2, null, user)
          }
        }
      };
      middlewares.authenticate._basic(storage, req, res, function(err) {
        expect(err).to.be.instanceOf(errors.NotAuthorizedError);
        done();
      });
    });
    it('will give error from lookup', function(done) {
      var req = {
        headers: {
          'authorization': 'Basic QWxhZGRpbjpPcGVuU2VzYW1l'
        }
      };
      var res = {};
      var storage = {
        models: {
          User: {
            lookup: sinon.stub().callsArgWith(2, new Error('test'))
          }
        }
      };
      middlewares.authenticate._basic(storage, req, res, function(err) {
        expect(err.message).to.equal('test');
        done();
      });
    });
  });
  describe('#_ecdsa', function() {
    var sandbox = sinon.sandbox.create();
    afterEach(function() {
      sandbox.restore();
    });
    it('will give not authorized error with invalid signature', function(done) {
      sandbox.stub(middlewares.authenticate, '_verifySignature').returns(false);
      var req = {
        header: sinon.stub().returns('pubkey')
      };
      var res = {};
      var storage = {};
      middlewares.authenticate._ecdsa(storage, req, res, function(err) {
        expect(err).to.be.instanceOf(errors.NotAuthorizedError);
        done();
      });
    });
    it('will give error if public key not found', function(done) {
      sandbox.stub(middlewares.authenticate, '_verifySignature').returns(true);
      var req = {
        header: sinon.stub().returns('pubkey')
      };
      var res = {};
      var storage = {
        models: {
          PublicKey: {
            findOne: sinon.stub().returns({
              exec: sinon.stub().callsArgWith(0, null, undefined)
            })
          }
        }
      };
      middlewares.authenticate._ecdsa(storage, req, res, function(err) {
        expect(err).to.be.instanceOf(errors.NotAuthorizedError);
        done();
      });
    });
    it('will give error from publickey findOne', function(done) {
      sandbox.stub(middlewares.authenticate, '_verifySignature').returns(true);
      var req = {
        header: sinon.stub().returns('pubkey')
      };
      var res = {};
      var storage = {
        models: {
          PublicKey: {
            findOne: sinon.stub().returns({
              exec: sinon.stub().callsArgWith(0, new Error('test'))
            })
          }
        }
      };
      middlewares.authenticate._ecdsa(storage, req, res, function(err) {
        expect(err).to.be.instanceOf(Error);
        done();
      });
    });
    it('will give error if user not found', function(done) {
      sandbox.stub(middlewares.authenticate, '_verifySignature').returns(true);
      var req = {
        header: sinon.stub().returns('pubkey')
      };
      var res = {};
      var pubkey = {
        user: 'userId'
      };
      var storage = {
        models: {
          PublicKey: {
            findOne: sinon.stub().returns({
              exec: sinon.stub().callsArgWith(0, null, pubkey)
            })
          },
          User: {
            findOne: sinon.stub().callsArgWith(1, null, undefined)
          }
        }
      };
      middlewares.authenticate._ecdsa(storage, req, res, function(err) {
        expect(err).to.be.instanceOf(errors.NotAuthorizedError);
        done();
      });
    });
    it('will give an error from user findOne', function(done) {
      sandbox.stub(middlewares.authenticate, '_verifySignature').returns(true);
      var req = {
        header: sinon.stub().returns('pubkey')
      };
      var res = {};
      var pubkey = {
        user: 'userId'
      };
      var storage = {
        models: {
          PublicKey: {
            findOne: sinon.stub().returns({
              exec: sinon.stub().callsArgWith(0, null, pubkey)
            })
          },
          User: {
            findOne: sinon.stub().callsArgWith(1, new Error('test'))
          }
        }
      };
      middlewares.authenticate._ecdsa(storage, req, res, function(err) {
        expect(err).to.be.instanceOf(Error);
        done();
      });
    });
    it('will give error if user is not activated', function(done) {
      sandbox.stub(middlewares.authenticate, '_verifySignature').returns(true);
      var req = {
        header: sinon.stub().returns('pubkey')
      };
      var res = {};
      var user = {
        activated: false
      };
      var pubkey = {
        user: 'userId'
      };
      var storage = {
        models: {
          PublicKey: {
            findOne: sinon.stub().returns({
              exec: sinon.stub().callsArgWith(0, null, pubkey)
            })
          },
          User: {
            findOne: sinon.stub().callsArgWith(1, null, user)
          }
        }
      };
      middlewares.authenticate._ecdsa(storage, req, res, function(err) {
        expect(err).to.be.instanceOf(errors.NotAuthorizedError);
        done();
      });
    });
    it('will give error if nonce already used', function(done) {
      sandbox.stub(middlewares.authenticate, '_verifySignature').returns(true);
      var req = {
        header: sinon.stub().returns('pubkey')
      };
      var res = {};
      var user = {
        activated: true
      };
      var pubkey = {
        user: 'userId'
      };
      function UserNonce(options) {
        this.user = options.id;
        this.nonce = options.nonce
      }
      var err = new Error('Duplicate key');
      err.code = '11000';
      UserNonce.prototype.save = sinon.stub().callsArgWith(0, err);
      var storage = {
        models: {
          PublicKey: {
            findOne: sinon.stub().returns({
              exec: sinon.stub().callsArgWith(0, null, pubkey)
            })
          },
          User: {
            findOne: sinon.stub().callsArgWith(1, null, user)
          },
          UserNonce: UserNonce
        }
      };
      middlewares.authenticate._ecdsa(storage, req, res, function(err) {
        expect(err).to.be.instanceOf(errors.NotAuthorizedError);
        done();
      });
    });
    it('will add user and pubkey to req', function(done) {
      sandbox.stub(middlewares.authenticate, '_verifySignature').returns(true);
      var req = {
        header: sinon.stub().returns('pubkey')
      };
      var res = {};
      var user = {
        activated: true
      };
      var pubkey = {
        user: 'userId'
      };
      function UserNonce(options) {
        this.user = options.id;
        this.nonce = options.nonce
      }
      UserNonce.prototype.save = sinon.stub().callsArg(0);
      var storage = {
        models: {
          PublicKey: {
            findOne: sinon.stub().returns({
              exec: sinon.stub().callsArgWith(0, null, pubkey)
            })
          },
          User: {
            findOne: sinon.stub().callsArgWith(1, null, user)
          },
          UserNonce: UserNonce
        }
      };
      middlewares.authenticate._ecdsa(storage, req, res, function(err) {
        if (err) {
          return done(err);
        }
        expect(req.user).to.equal(user);
        expect(req.pubkey).to.equal(pubkey);
        done();
      });
    });
  });
  describe('#_detectStrategy', function() {
    it('will return BASIC for basic auth', function() {
      var req = {
        headers: {
          'authorization': 'Basic QWxhZGRpbjpPcGVuU2VzYW1l'
        },
        header: sinon.stub()
      };
      var strategy = middlewares.authenticate._detectStrategy(req);
      expect(strategy).to.equal('BASIC');
    });
    it('will return ECDSA with x-pubkey and x-signature headers', function() {
      var req = {
        headers: {},
        header: sinon.stub()
      };
      req.header.onFirstCall().returns('signature');
      req.header.onSecondCall().returns('pubkey');
      var strategy = middlewares.authenticate._detectStrategy(req);
      expect(strategy).to.equal('ECDSA');
    });
    it('will return BASIC with basic auth and x-pubkey and x-signature', function() {
      var req = {
        headers: {
          'authorization': 'Basic QWxhZGRpbjpPcGVuU2VzYW1l'
        },
        header: sinon.stub()
      };
      req.header.onFirstCall().returns('signature');
      req.header.onSecondCall().returns('pubkey');
      var strategy = middlewares.authenticate._detectStrategy(req);
      expect(strategy).to.equal('BASIC');
    });
    it('will return NONE', function() {
      var req = {
        headers: {},
        header: sinon.stub()
      };
      var strategy = middlewares.authenticate._detectStrategy(req);
      expect(strategy).to.equal('NONE');
    });
  });
  describe('#_getParams', function() {
    ['POST', 'PATCH', 'PUT'].forEach(function(method) {
      it('will return body with method ' + method, function() {
        var req = {
          method: method,
          body: {
            hello: 'world'
          }
        };
        var params = middlewares.authenticate._getParams(req);
        expect(params).to.deep.equal({
          hello: 'world'
        });
      });
    });
    ['GET', 'DELETE', 'OPTIONS'].forEach(function(method) {
      it('will return params from query args for method ' + method, function() {
        var req = {
          method: method,
          query: {
            hello: 'world'
          }
        };
        var params = middlewares.authenticate._getParams(req);
        expect(params).to.deep.equal({
          hello: 'world'
        });
      });
    });
  });
  describe('#_getPayload', function() {
    ['POST', 'PATCH', 'PUT'].forEach(function(method) {
      it('will return rawbody for method ' + method, function() {
        var req = {
          method: method,
          rawbody: 'rawbody'
        };
        var payload = middlewares.authenticate._getPayload(req);
        expect(payload).to.equal('rawbody');
      });
    });

    ['GET', 'DELETE', 'OPTIONS'].forEach(function(method) {
      it('will return query args for method ' + method, function() {
        var req = {
          method: method,
          url: '?hello=world'
        }
        var payload = middlewares.authenticate._getPayload(req);
        expect(payload).to.equal('hello=world');
      });
    });
    it('will return empty string for other method', function() {
      var req = {
        method: 'HEAD'
      }
      var payload = middlewares.authenticate._getPayload(req);
      expect(payload).to.equal('');
    });
  });
  describe('#_getHash', function() {
    var sandbox = sinon.sandbox.create();
    afterEach(function() {
      sandbox.restore();
    });
    it('will get hash from req', function() {
      sandbox.stub(middlewares.authenticate, '_getPayload').returns('hello=world');
      var req = {
        method: 'GET',
        path: '/'
      }
      var hash = middlewares.authenticate._getHash(req);
      expect(hash).to.equal('622f645b4a0030e87e0419b19950d9bc1cb3202c12cd7819a1c40141edc75b6e');
    });
  });
  describe('#_verifySignature', function() {
    var sandbox = sinon.sandbox.create();
    afterEach(function() {
      sandbox.restore();
    });
    it('will verify signature as true', function() {
      var hash = new Buffer('86e663b4892a64c45e804874d59436fbddce2557d1005a2908755fe9e5827636', 'hex');
      var signature = '30450221009c0bdfd7dca49c71ae46d1b74511a509442ebbb1987cfe546ab760866edff59302' +
          '200948ec9027b630c50d8300a12d32a9e54185c2cb5aa4f657bde46e982d595d22';
      var pubkey = '03b3e8d348e97fe395e76532ae6436472d9ae0c38b39484c789314ac4ee8712ec4';
      sandbox.stub(middlewares.authenticate, '_getHash').returns(hash);
      var req = {
        method: 'GET',
        path: '/info',
        header: sinon.stub()
      };
      req.header.onFirstCall().returns(signature);
      req.header.onSecondCall().returns(pubkey);
      expect(middlewares.authenticate._verifySignature(req)).to.equal(true);
    });
    it('will verify signature as false', function() {
      var hash = new Buffer('86e663b4892a64c45e804874d59436fbddce2557d1005a2908755fe9e5827636', 'hex');
      var signature = '30450221009c0bdfd7dca49c71ae46d1b74511a509442ebbb1987cfe546ab760866edff59302' +
          '200948ec9027b630c50d8300a12d32a9e54185c2cb5aa4f657bde46e982d595d11';
      var pubkey = '03b3e8d348e97fe395e76532ae6436472d9ae0c38b39484c789314ac4ee8712ec4';
      sandbox.stub(middlewares.authenticate, '_getHash').returns(hash);
      var req = {
        method: 'GET',
        path: '/info',
        header: sinon.stub()
      };
      req.header.onFirstCall().returns(signature);
      req.header.onSecondCall().returns(pubkey);
      expect(middlewares.authenticate._verifySignature(req)).to.equal(false);
    });
    it('will verify as false with invalid signature and public key', function() {
      var hash = new Buffer('86e663b4892a64c45e804874d59436fbddce2557d1005a2908755fe9e5827636', 'hex');
      var signature = '30450221009c0bdfd7dca49c71ae46d1b74511a509442ebbb1987cfe5';
      var pubkey = '03b3e8d34';
      var req = {
        method: 'GET',
        path: '/info',
        header: sinon.stub()
      };
      req.header.onFirstCall().returns(signature);
      req.header.onSecondCall().returns(pubkey);
      sandbox.stub(middlewares.authenticate, '_getHash').returns(hash);
      expect(middlewares.authenticate._verifySignature(req)).to.equal(false);
      expect(middlewares.authenticate._getHash.callCount).to.equal(0);
    });
  });
});
