'use strict';

const ReadableStream = require('stream').Readable;
const expect = require('chai').expect;
const sinon = require('sinon');

const middlewares = require('..');

describe('Token', function() {
  it('give error from token lookup', function(done) {
    var storage = {
      models: {
        Token: {
          lookup: sinon.stub().callsArgWith(1, new Error('test'))
        }
      }
    };
    var tokenauth = middlewares.tokenauth(storage);
    var req = {
      header: sinon.stub().returns('token')
    };
    var res = {};
    tokenauth(req, res, function(err) {
      expect(err).to.be.instanceOf(Error)
      done();
    });
  });
  it('will set token on req', function(done) {
    var token = {
      expire: sinon.stub().callsArg(0)
    };
    var storage = {
      models: {
        Token: {
          lookup: sinon.stub().callsArgWith(1, null, token)
        }
      }
    };
    var tokenauth = middlewares.tokenauth(storage);
    var req = {
      header: sinon.stub().returns('token')
    };
    var res = {};
    tokenauth(req, res, function(err) {
      expect(req.token).to.equal(token);
      done();
    });
  });
});
