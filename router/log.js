var server = global.server
var log = require('../controller/logController')
var permission = require("../controller/roleActionController")

// 查询日志
// server.post("/log/listLog",function(req,res,next){
// 	res.setHeader("Access-Control-Allow-Origin","*");
// 	log.listLog(req,res);
// 	return next();
// });

//分页查询日志
server.post("/log/getLogList",function(req,res,next){
	res.setHeader("Access-Control-Allow-Origin","*");	
	try{
		var mobile = req.body.mobile || -1;
		permission.checkUserPermissionByMobile(req.url, mobile, 'pc', function(hasPermission){
			if(hasPermission){
				log.getLogList(req,res);
			} else {
				permission.permissionDenied(res);
			}
		});
	} catch(e) {
		permission.permissionDenied(res);
	}
	return next();
});
//按用户mobile查询系统日志listLogByMobile
server.post("/log/listLogByMobile",function(req,res,next){
	res.setHeader("Access-Control-Allow-Origin","*");
	try{
		var mobile = req.body.mobile || -1;
		permission.checkUserPermissionByMobile(req.url, mobile, 'pc', function(hasPermission){
			if(hasPermission){
				log.listLogByMobile(req,res);
			} else {
				permission.permissionDenied(res);
			}
		});
	} catch(e) {
		permission.permissionDenied(res);
	}
	return next();
});
module.exports = server;