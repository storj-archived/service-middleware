'use strict';

const expect = require('chai').expect;
const sinon = require('sinon');
const publicBucket = require('../lib/public-bucket.js');

describe('Public Bucket', function() {

  var Bucket = {};
  var params = {};
  var body = {};

  var storage = { models: { Bucket: Bucket }};
  var req = { params: params, body: body };

  it('should not return any error', function(done) {

    params.id = '0123';
    body.operation = 'PULL';

    Bucket.findOne = sinon.stub()
      .withArgs(params.id, body.operation)
      .callsArgWith(1, null, {});

    var middleware = publicBucket(storage);
    middleware(req, null, function(err){
      expect(err).to.equal(null);
      done();
    });

  });

  it('should return bucket not found error', function(done) {

    params.id = 'NONEXISTANT';
    body.operation = 'PULL';

    Bucket.findOne = sinon.stub()
      .withArgs(params.id, body.operation)
      .callsArgWith(1, null, null);

    var middleware = publicBucket(storage);
    middleware(req, null, function(err){
      expect(err.message).to.equal('Bucket not found');
      done();
    });

  });

  it('should return internal error', function(done) {

    params.id = null;
    body.operation = null;

    Bucket.findOne = sinon.stub()
      .withArgs(params.id, body.operation)
      .callsArgWith(1, new Error('Internal error'), null);

    var middleware = publicBucket(storage);
    middleware(req, null, function(err){
      expect(err.message).to.equal('Internal error');
      done();
    });

  });

});
