var server = global.server;
var cameraSelect = require('../controller/cameraSelectController');

//矩形框选摄像头
server.post("/camera/cameraSelectRect",function(req,res,next){
	res.setHeader("Access-Control-Allow-Origin","*");
	cameraSelect.cameraSelectRect(req,res);
	return next();
});

//圆形框选摄像头
server.post("/camera/cameraSelectCircle",function(req,res,next){
	res.setHeader("Access-Control-Allow-Origin","*");
	cameraSelect.cameraSelectCircle(req,res);
	return next();
});

//多边形框选摄像头
server.post("/camera/cameraSelectPolygon",function(req,res,next){
	res.setHeader("Access-Control-Allow-Origin","*");
	cameraSelect.cameraSelectPolygon(req,res);
	return next();
});

//直线附近摄像头
server.post("/camera/cameraSelectLine",function(req,res,next){
	res.setHeader("Access-Control-Allow-Origin","*");
	cameraSelect.cameraSelectLine(req,res);
	return next();
});

module.exports = server;
