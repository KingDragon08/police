/**
 * 重点对象模块的路由
 */
var server = global.server;
var speed = require('../controller/speedController');

server.post("/speed/getImportantPeopleTrack",function(req,res,next){
	res.setHeader("Access-Control-Allow-Origin","*");
	speed.getImportantPeopleTrack(req,res);
	return next();
});

server.post("/speed/getCarPosition",function(req,res,next){
	res.setHeader("Access-Control-Allow-Origin","*");
	speed.getCarPosition(req,res);
	return next();
});

server.post("/speed/bfradio",function(req,res,next){
	res.setHeader("Access-Control-Allow-Origin","*");
	speed.bfradio(req,res);
	return next();
});

module.exports = server;
