// server.js

const http = require('http');
const api = require('./api');
const siesta = require('../siesta').load(api);

var server = http.createServer(siesta).listen(8080);
