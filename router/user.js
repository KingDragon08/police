var server = global.server
var User = require('../controller/userController')

//注册新账号
server.post("/user/register",function(req,res,next){
	res.setHeader("Access-Control-Allow-Origin","*");
	User.register(req,res);
	return next();
});

//登录
server.post("/user/login",function(req,res,next){
	res.setHeader("Access-Control-Allow-Origin","*");
	User.login(req,res);
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

//分页获取用户
server.post("/user/getUsers",function(req,res,next){
	res.setHeader("Access-Control-Allow-Origin","*");
	User.getUsers(req,res);
	return next();
});


module.exports = server;