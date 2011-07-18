# siesta

Siesta makes it easy to create RESTful services

# Install

NPM

    $ npm install siesta

# How to

#### server.js

    // server.js

    const http = require('http');
    const api = require('./lib/api');
    const siesta = require('siesta').load(api);

    var server = http.createServer(siesta).listen(8080);

#### lib/api.js

    // lib/api.js

    module.exports = {
      echo: {
        GET: function (response) {
          response("hello world");
        }
      }
    };


#### run it!

    $ sudo node server.js

#### curl to test output...

    $ curl localhost:8080/hello
    > {"message":"hello world"}
