const url = require('url');

exports.load = function (api) {
  return function (req, res) {
    var path = url.parse(req.url).pathname.split("/"),
        response = function (status, data) {
          if (typeof status !== "number") {
            data = status;
          }

          status = status || 200;

          if (typeof data !== "object") {
            data = { message: data };
          }

          res.writeHead(status, {'Content-Type': 'application/json'});
          res.write(JSON.stringify(data), 'utf8');
          res.write("\n", 'utf8');
          res.end();
        },
        action = path[1],
        params = path.splice(2) || [];

    if (api.hasOwnProperty(action) && api[action].hasOwnProperty(req.method)) {
      params.unshift(function (status, data) {
        response(status, data);
      });

      api[action][req.method].apply(this, params);
    } else {
      response(404, { message: "Method not found" });
    }
  };
};
