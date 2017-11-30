var server = global.server
var log = require('../controller/logController')

// 查询日志
// server.post("/log/listLog",function(req,res,next){
// 	res.setHeader("Access-Control-Allow-Origin","*");
// 	log.listLog(req,res);
// 	return next();
// });

//分页查询日志
server.post("/log/getLogList",function(req,res,next){
	res.setHeader("Access-Control-Allow-Origin","*");
	log.getLogList(req,res);
	return next();
});
//按用户mobile查询系统日志listLogByMobile
server.post("/log/listLogByMobile",function(req,res,next){
	res.setHeader("Access-Control-Allow-Origin","*");
	log.listLogByMobile(req,res);
	return next();
});
module.exports = server;