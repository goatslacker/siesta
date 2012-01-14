var url = require('url');
var http = require('http');
var siesta = {};
var server = null;

function useDefaults(base) {
  var defaults = {
    contentType: 'application/json',
    statusCode: 200,
    responseJSON: { message: base.responseText }
  };

  Object.keys(defaults).forEach(function (key) {
    if (!base.hasOwnProperty(key)) {
      base[key] = defaults[key];
    }
  });

  return base;
}

siesta.use = function (api) {
  if (typeof api === 'string') {
    api = require(api);
  }

  server = function (req, res) {
    var path = url.parse(req.url).pathname.split('/');
    var action = path[1];
    var params = path.splice(2) || [];

    function response(data) {
      if (typeof data === 'string') {
        data = { responseText: data };
      }

      data = useDefaults(data);

      res.writeHead(data.statusCode, { 'Content-Type': data.contentType });
      res.write(data.contentType === 'application/json' ? JSON.stringify(data.responseJSON) : data.responseText, 'utf8');
      res.write('\n', 'utf8');
      res.end();

      console.log(data.statusCode + ' ' + req.method + ' ' + path.join('/'));
    }

    var callAPI = function callAPI() {
      api[action][req.method].apply(this, params);
    }.bind(this);


    if (api.hasOwnProperty(action) && api[action].hasOwnProperty(req.method)) {
      params.unshift(function (status, data) {
        response(status, data);
      });

      if (req.method === 'POST' || req.method === 'PUT') {
        res.responseText = '';

        req.on('data', function (data) {
          res.responseText += data.toString();
        });

        req.on('end', function () {
          try {
            params.push(JSON.parse(res.responseText));
          } catch (e) { }
          callAPI();
        });
      } else {
        callAPI();
      }
    } else {
      response({
        statusCode: 404,
        responseText: 'Method not found'
      });
    }
  };

  return this;
};

siesta.listen = function (port) {
  siesta.app = http.createServer(server).listen(port);
  return this;
};

module.exports = siesta;
