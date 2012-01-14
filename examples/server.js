var siesta = require('../');
var app = siesta.use(__dirname + '/api');
app.listen(3000);

console.log('Server started.');
console.log('Visit http://localhost:3000/echo for results');
