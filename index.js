var crossroads = require('crossroads');
var http = require('http');
var url = require('url');


function response(req, res) {
  return {
    json: function (json) {
      var data = {
        contentType: 'application/json',
        statusCode: 200,
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
    if (req.method === 'OPTIONS') {
      res.writeHead(200, {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Access-Control-Allow-Headers': 'X-Requested-With, Content-Type'
      });
      return res.end();
    }

    var path = url.parse(req.url).pathname;

    crossroads.parse('@' + req.method + path, [response(req, res)]);
    crossroads.resetState();
  });
  server.listen(port || 8080);
}

module.exports = siesta;
