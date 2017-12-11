var server = global.server
var Mobile = require('../controller/mobileController')

//登录
server.post("/mobile/login",function(req,res,next){
	res.setHeader("Access-Control-Allow-Origin","*");
	Mobile.login(req,res);
	return next();
});

//使用token登录
server.post("/mobile/loginWithToken",function(req,res,next){
	res.setHeader("Access-Control-Allow-Origin","*");
	Mobile.loginWithToken(req,res);
	return next();
});

//退出登录
server.post("/mobile/logout",function(req,res,next){
	res.setHeader("Access-Control-Allow-Origin","*");
	Mobile.logout(req,res);
	return next();
});

//手机用户获取部门id
server.post("/mobile/getDepartmentAPP",function(req,res,next){
    res.setHeader("Access-Control-Allow-Origin","*");
    Mobile.getDepartmentAPP(req,res);
	return next();
});

module.exports = server;