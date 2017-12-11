var server = global.server
var address = require('../controller/addrController')

var permission = require("../controller/roleActionController")

// 模糊查找地点
server.post("/address/fuzzysearch",function(req,res,next){
	res.setHeader("Access-Control-Allow-Origin","*");
	try{
		var mobile = req.body.mobile || -1;
		permission.checkUserPermissionByMobile(req.url, mobile, 'pc', function(hasPermission){
			if(hasPermission){
				address.getFuzzyAddr(req,res);
				//camera.delCamera(req,res);
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
