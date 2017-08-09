'use strict';

const chai = require('chai');
const expect = chai.expect;
const sinon = require('sinon');
const redis = require('redis').createClient();
const pow = require('../lib/pow');

describe('POW Middleware', function() {

  after(function(done) {
    redis.flushdb(done);
  });

  describe('#getMiddleware', function() {
    let challenge = '2db77b11eab714c46febb51a78d56d9b34b306d6fc46aa6e6e25a92b48eff4bf';
    let target = '00000fffffffffffffffffffffffffffffffffffffffffffffffffffffffffff';

    let challenge2 = '4fccbb094116bf90e8dcea7e2b531b9a52574737a6cab9e77e2e5599fd35eb5b';
    let target2 = 'ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff';

    let unknownChallenge = '328bfdaa0d2bf6c3c6495f06ffc2087e0b092fa534f1dea699b88f11b0082ab2';

    before(function() {
      redis.hset('contact-stats', 'count', 0);
      redis.set('contact-' + challenge, target, 'EX', 3600);
      redis.set('contact-' + challenge2, target2, 'EX', 3600);
    });

    it('will get invalid pow error', function(done) {
      let middleware = pow.getMiddleware(redis);

      let req = {
        headers: function(key) {
          if (key === 'x-challenge') {
            return challenge;
          } else if (key === 'x-challenge-nonce') {
            return 'dd170bf2';
          }
        }
      };
      let res = {};

      middleware(req, res, function(err) {
        expect(err).to.be.instanceOf(Error);
        expect(err.message).to.equal('Invalid proof of work');
        done();
      });

    });

    it('will get unknown challenge error', function(done) {
      let middleware = pow.getMiddleware(redis);

      let req = {
        headers: function(key) {
          if (key === 'x-challenge') {
            return unknownChallenge;
          } else if (key === 'x-challenge-nonce') {
            return 'dd170bf2';
          }
        }
      };
      let res = {};

      middleware(req, res, function(err) {
        expect(err).to.be.instanceOf(Error);
        expect(err.message).to.equal('Challenge not found');
        done();
      });

    });

    it('will increment count by one and remove challenge', function(done) {
      let middleware = pow.getMiddleware(redis);

      let req = {
        headers: function(key) {
          if (key === 'x-challenge') {
            return challenge2;
          } else if (key === 'x-challenge-nonce') {
            return 'dd170bf2';
          }
        }
      };
      let res = {};

      middleware(req, res, function(err) {
        if (err) {
          return done(err);
        }

        redis.hgetall('contact-stats', function(err, stats) {
          if (err) {
            return done(err);
          }
          expect(stats.count).to.equal('1');

          redis.get('contact-' + challenge2, function(err, target) {
            if (err) {
              return done(err);
            }
            expect(target).to.equal(null);
            done();
          });
        });
      });

    });
  });

  describe('#getTarget', function() {
    it('', function() {

    });
  });

  describe('#getChallenge', function() {
    it('', function() {

    });

  });

});
