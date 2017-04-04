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

## TODO: Added rate-limiter documentation 

// instantiate the rate limiter with a redis client `client` and your express app `app`
app.use(middleware.rateLimiter(client, app));
