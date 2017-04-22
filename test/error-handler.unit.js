'use strict';

const expect = require('chai').expect;
const sinon = require('sinon');

const middlewares = require('..');

describe('Error Handler', function() {
  it('will log error and send status code 500 with message', function() {
    var options = {
      logger: {
        error: sinon.stub()
      }
    }
    var handler = middlewares.errorhandler(options)
    var err = new Error('test');
    var req = {};
    var send = sinon.stub();
    var status = sinon.stub().returns({
      send: send
    });
    var res = {
      status: status
    };
    handler(err, req, res);
    expect(options.logger.error.callCount).to.equal(2);
    expect(res.status.callCount).to.equal(1);
    expect(res.status.args[0][0]).to.equal(500);
    expect(send.callCount).to.equal(1);
    expect(send.args[0][0]).to.deep.equal({error: 'test'});
  });
  it('will NOT log error and send status code 402 with message', function() {
    var options = {
      logger: {
        error: sinon.stub()
      }
    }
    var handler = middlewares.errorhandler(options)
    var err = new Error('test');
    err.code = 402;
    var req = {};
    var send = sinon.stub();
    var status = sinon.stub().returns({
      send: send
    });
    var res = {
      status: status
    };
    handler(err, req, res);
    expect(options.logger.error.callCount).to.equal(0);
    expect(res.status.callCount).to.equal(1);
    expect(send.callCount).to.equal(1);
    expect(send.args[0][0]).to.deep.equal({error: 'test'});
  });
  it('will NOT log error and send status code 400 when error code is greater than 500', function() {
    var options = {
      logger: {
        error: sinon.stub()
      }
    }
    var handler = middlewares.errorhandler(options)
    var err = new Error('test');
    err.code = '11000';
    var req = {};
    var send = sinon.stub();
    var status = sinon.stub().returns({
      send: send
    });
    var res = {
      status: status
    };
    handler(err, req, res);
    expect(options.logger.error.callCount).to.equal(0);
    expect(res.status.callCount).to.equal(1);
    expect(res.status.args[0][0]).to.equal(400);
    expect(send.callCount).to.equal(1);
    expect(send.args[0][0]).to.deep.equal({error: 'test'});
  });
  it('will continue without error', function(done) {
    var handler = middlewares.errorhandler({})
    var req = {};
    var res = {};
    handler(null, req, res, done);
  });
});
