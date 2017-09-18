var server = global.server
var camera = require('../controller/cameraController')

// 测试参数
// server.get("/camera/getParams",function(req,res,next){
// 	res.setHeader("Access-Control-Allow-Origin","*");
// 	camera.getParams(req,res);
// 	return next();
// });
server.post("/camera/getParams",function(req,res,next){
	res.setHeader("Access-Control-Allow-Origin","*");
	camera.getParams(req,res);
	return next();
});

// 添加摄像头
server.post("/camera/add",function(req,res,next){
	res.setHeader("Access-Control-Allow-Origin","*");
	camera.addCamera(req,res);
	return next();
});

// 删除摄像头
server.post("/camera/del",function(req,res,next){
	res.setHeader("Access-Control-Allow-Origin","*");
	camera.delCamera(req,res);
	return next();
});

// 编辑摄像头信息
server.post("/camera/edit",function(req,res,next){
	res.setHeader("Access-Control-Allow-Origin","*");
	camera.editCamera(req,res);
	return next();
});


module.exports = server;
