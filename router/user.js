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


module.exports = server;