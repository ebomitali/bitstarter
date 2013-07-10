var express = require('express');
var fs = require('fs');

var buf = new Buffer(fs.readFileSync('/home/ubuntu/bitstarter/index.html',function (err, data) {
  if (err) throw err;
  console.log(data);
}))

var app = express.createServer(express.logger());

app.get('/', function(request, response) {
  response.send(buf.toString);
});

var port = process.env.PORT || 5000;
app.listen(port, function() {
  console.log("Listening on " + port);
});
