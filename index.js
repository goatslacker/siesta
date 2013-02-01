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

      res.writeHead(data.statusCode, { 'Content-Type': data.contentType });
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
      crossroads.addRoute(route, handler);
    } else {
      throw new Error();
    }
  });

  return this;
}

siesta.listen = function (port) {
  var server = http.createServer(function (req, res) {
    var path = url.parse(req.url).pathname;
    crossroads.parse(path, [response(req, res)]);
  });
  server.listen(port || 8080);
}

module.exports = siesta;
