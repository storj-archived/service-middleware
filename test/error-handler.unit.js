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
    handler(err, req, res, function() {
      options.logger.error.callCount.should.equal(2);
      expect(res.status.callCount).to.equal(1);
      expect(res.status.args[0][0]).to.equal(500);
      expect(res.send.callCount).to.equal(1);
      expect(res.send.args[0][0]).to.equal('test');
    });
  });
  it('will log error and send status code 402 with message', function() {
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
    handler(err, req, res, function() {
      options.logger.error.callCount.should.equal(2);
      expect(res.status.callCount).to.equal(1);
      expect(res.status.args[0][0]).to.equal(402);
      expect(res.send.callCount).to.equal(1);
      expect(res.send.args[0][0]).to.equal('test');
    });
  });
});
