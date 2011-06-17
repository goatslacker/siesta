/**
  Copyright (C) 2011 by Josh Perez <josh@goatslacker.com>

  Permission is hereby granted, free of charge, to any person obtaining a copy
  of this software and associated documentation files (the "Software"), to deal
  in the Software without restriction, including without limitation the rights
  to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
  copies of the Software, and to permit persons to whom the Software is
  furnished to do so, subject to the following conditions:

  The above copyright notice and this permission notice shall be included in
  all copies or substantial portions of the Software.

  THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
  IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
  FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
  AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
  LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
  OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
  THE SOFTWARE.
  */

/**
  @author Josh Perez <josh@goatslacker.com>
  @see siesta https://github.com/goatslacker/siesta
  */

const url = require('url');

exports.load = function (api) {
  return function (req, res) {
    var self = this,
        path = url.parse(req.url).pathname.split("/"),
        action = path[1],
        params = path.splice(2) || [],

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

      console.log(status + " " + req.method + " " + path.join("/"));
    },

    callAPI = function () {
      api[action][req.method].apply(self, params);
    };


    if (api.hasOwnProperty(action) && api[action].hasOwnProperty(req.method)) {
      params.unshift(function (status, data) {
        response(status, data);
      });

      if (req.method === 'POST' || req.method === 'PUT') {
        res.responseText = "";

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
      response(404, { message: "Method not found" });
    }
  };
};
