# Storj Service Middleware

Common Express middleware for various Storj services.

```bash
$ npm install storj-service-middleware --save
```

```javascript
var Storage = require('storj-service-storage-models');
var db = new Storage({ /* config */ });
var middleware = require('storj-service-middleware');
var app = require('express')();

app.use(middleware.authenticate(db));
app.use(middleware.errorhandler());
```

# Rate Limiter

Instantiate the rate limiter with a redis client `client` and your express app `app`

```javascript
const app = express();
const client = require('redis').createClient();
const limiter = middleware.rateLimiter(client);
```

Then, you can use `limiter` as middleware and pass it an options object.

```javascript
app.get('/route', limiter({
  lookup: function(req) {
    return [req.user._id, req.connection.remoteAddress]
  },
  onRateLimited: function(req, res, next) {
    log.info('user rate limited', req.user);
    return next(new errors.BadRequestError('Slow down, dude.'));
  },
  total: 150,
  expire: 1000 * 60 // 150 requests a minute allowed
  }), function(req, res) {
  res.status(200).send('hello');
});
```

# Testing

Redis must be running for the tests to work. The easiest way to get an instance running is via Docker.

```bash
$ docker run --name redis -p 6379:6379 -d redis
```

Then, `npm test` will kick off the test suite for you.

# License

Credit for much of the rate limiter code goes to [https://github.com/juliendangers/express-limiter2](juliendangers/express-limiter2) released under the MIT license.

All other code released under AGPLv3.
