var server = global.server
var Demo = require('../controller/demoController')
var permission = require("../controller/roleActionController")

server.post("/demo",function(req,res,next){
	try{
		var mobile = req.body.mobile || -1;
		permission.checkUserPermissionByMobile(req.url, mobile, 'pc', function(hasPermission){
			if(hasPermission){
				Demo.demo(req,res);
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

// server.get("/demo/test",function(req,res,next){
// 	Demo.test(req,res);
// 	return next();
// });


module.exports = server;