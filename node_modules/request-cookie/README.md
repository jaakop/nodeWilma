
# request-cookie

[![npm-version]][npm] [![travis-ci]][travis] [![coveralls-status]][coveralls]

> Cookie store for [request-compose]

```js
var compose = require('request-compose')
var cookie = require('request-cookie')
compose.Request.cookie = cookie.Request
compose.Response.cookie = cookie.Response
var request = compose.client

;(async () => {
  var cookie = {}
  var {body} = await request({
    url: 'http://website.com',
    cookie,
  })
})()
```

  [npm-version]: https://img.shields.io/npm/v/request-cookie.svg?style=flat-square (NPM Package Version)
  [travis-ci]: https://img.shields.io/travis/simov/request-cookie/master.svg?style=flat-square (Build Status - Travis CI)
  [coveralls-status]: https://img.shields.io/coveralls/simov/request-cookie.svg?style=flat-square (Test Coverage - Coveralls)
  [codecov-status]: https://img.shields.io/codecov/c/github/simov/request-cookie.svg?style=flat-square (Test Coverage - Codecov)

  [npm]: https://www.npmjs.com/package/request-cookie
  [travis]: https://travis-ci.org/simov/request-cookie
  [coveralls]: https://coveralls.io/github/simov/request-cookie
  [codecov]: https://codecov.io/github/simov/request-cookie?branch=master

  [request-compose]: https://www.npmjs.com/package/request-compose
