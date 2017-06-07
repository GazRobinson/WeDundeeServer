var mysql = require('mysql');

var http = require('http');

http.createServer(function (req, res) {
    res.writeHead(200, {'Content-Type': 'text/html'});
    res.end('Hello World!');
}).listen(8080);

console.log("Oh well...");

//SQL
var con = mysql.createConnection({
  host: 'mysql.devmode.wedundee.com',
  user: 'Gaz',
  password: '$P$BX6N55QbdiDviqEk.xDzk2Di.VMWaS0'
});

con.connect(function(err) {
  if (err) throw err;
  console.log("Connected!");
});
console.log("Oh well...");