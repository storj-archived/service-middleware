Storj Service Middleware
========================

Common Express middleware for various Storj services.

```
npm install storj-service-middleware --save
```

```js
var Storage = require('storj-service-storage-models');
var db = new Storage({ /* config */ });
var middleware = require('storj-service-middleware');
var app = require('express')();

app.use(middleware.authenticate(db));
app.use(middleware.errorhandler());
```

# Rate Limiter 

Instantiate the rate limiter with a redis client `client` and your express app `app`

```
const client = require('redis').createClient();
const app = express();
app.use(middleware.rateLimiter(client, app));
```

# Testing

Redis must be running for the tests to work. The easiest way to get an instance running is
via Docker. 

```
$ docker run --name redis -p 6379:6379 -d redis
```

Then, `npm test` will kick off the test suite for you.

