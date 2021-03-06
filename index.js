var crossroads = require('crossroads');
var http = require('http');
var url = require('url');


function response(req, res) {
  return {
    json: function (json, statusCode) {
      var data = {
        contentType: 'application/json',
        statusCode: statusCode || 200,
        responseJSON: json
      };

      res.writeHead(data.statusCode, {
        'Content-Type': data.contentType,
        'Access-Control-Allow-Origin': '*'
      });
      res.write(JSON.stringify(data.responseJSON), 'utf8');
      res.write('\n', 'utf8');
      res.end();

      console.log(data.statusCode + ' ' + req.method + ' ' + req.url);
    },

    empty: function (statusCode) {
      res.writeHead(statusCode || 200, {
        'Content-Type': 'text',
        'Access-Control-Allow-Origin': '*'
      });
      res.end();
    },

    error: function (err, statusCode) {
      res.writeHead(statusCode || 500, {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      });
      res.write(JSON.stringify({ error: err.message }), 'utf8');
      res.end();
    }
  }
}

var siesta = {};

siesta.use = function (api) {
  Object.keys(api).forEach(function (route) {
    var handler = api[route];
    if (typeof handler === 'function') {
      crossroads.addRoute('@GET' + route, handler);
    } else {
      Object.keys(handler).forEach(function (method) {
        crossroads.addRoute(
          '@' + method.toUpperCase() + route,
          handler[method]
        );
      });
    }
  });

  return this;
}

siesta.listen = function (port) {
  var server = http.createServer(function (req, res) {

    function route(data) {
      var path = url.parse(req.url).pathname;
      var args = [response(req, res)];
      if (data) {
        args.push(data);
      }

      try {
        crossroads.parse('@' + req.method + path, args);
      } catch (e) {
        res.writeHead(500);
        res.end();

        console.error(500 + ' ' + req.method + ' ' + e.stack);
      } finally {
        crossroads.resetState();
      }
    }

    switch (req.method) {
      case 'OPTIONS':
        res.writeHead(200, {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
          'Access-Control-Allow-Headers': 'X-Requested-With, Content-Type'
        });
        return res.end();
      case 'POST':
      case 'PUT':
        var data = '';

        req.on('data', function (buffer) {
          data += buffer.toString();
        });

        req.on('end', function () {
          var json = {};
          try {
            json = JSON.parse(data);
          } catch (e) { }
          route(json);
        });
        break;
      case 'GET':
        route();
        break;
    }

  });
  server.listen(port || 8080);
}

module.exports = siesta;
