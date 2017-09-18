var server = global.server
var camera = require('../controller/cameraController')

// 测试参数
server.get("/camera/getParams",function(req,res,next){
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

//使用token登录
server.post("/user/loginWithToken",function(req,res,next){
	res.setHeader("Access-Control-Allow-Origin","*");
	User.loginWithToken(req,res);
	return next();
});

//退出登录
server.post("/user/logout",function(req,res,next){
	res.setHeader("Access-Control-Allow-Origin","*");
	User.logout(req,res);
	return next();
});


module.exports = server;
