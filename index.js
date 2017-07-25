var http = require('http');
var url = require('url');


var server = http.createServer(function(req, res){
	res.writeHead(200, {'Content-Type' : 'text/plain'});
	res.write('We are here!');
	res.end();
});

server.listen(8000);

console.log('Server is running...');