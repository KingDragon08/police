var server = global.server
var Demo = require('../controller/demoController')

server.post("/demo",function(req,res,next){
	Demo.demo(req,res);
	return next();
});

module.exports = server;