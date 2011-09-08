/*global require exports */
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

const useDefaults = function (base) {
  const defaults = {
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
};

exports.load = function (api) {
  return function (req, res) {
    var path = url.parse(req.url).pathname.split("/");
    var action = path[1];
    var params = path.splice(2) || [];

    const response = function (data) {
      if (typeof data === "string") {
        data = { responseText: data };
      }

      data = useDefaults(data);

      res.writeHead(data.statusCode, { 'Content-Type': data.contentType });
      res.write(data.contentType === "application/json" ? JSON.stringify(data.responseJSON) : data.responseText, 'utf8');
      res.write("\n", 'utf8');
      res.end();

      console.log(data.statusCode + " " + req.method + " " + path.join("/"));
    };

    const callAPI = function () {
      api[action][req.method].apply(this, params);
    }.bind(this);


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
      response({
        statusCode: 404,
        responseText: "Method not found"
      });
    }
  };
};
