var server = global.server;
var carSelect = require('../controller/carSelectController');
var permission = require("../controller/roleActionController")

/*
//矩形框选摄像头
server.post("/car/carSelectRect",function(req,res,next){
	res.setHeader("Access-Control-Allow-Origin","*");
	try{
		var mobile = req.body.mobile || -1;
		permission.checkUserPermissionByMobile(req.url, mobile, 'pc', function(hasPermission){
			if(hasPermission){
				carSelect.carSelectRect(req,res);
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

//圆形框选摄像头
server.post("/car/carSelectCircle",function(req,res,next){
	res.setHeader("Access-Control-Allow-Origin","*");
	try{
		var mobile = req.body.mobile || -1;
		permission.checkUserPermissionByMobile(req.url, mobile, 'pc', function(hasPermission){
			if(hasPermission){
				carSelect.carSelectCircle(req,res);
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

//多边形框选摄像头
server.post("/car/carSelectPolygon",function(req,res,next){
	res.setHeader("Access-Control-Allow-Origin","*");
	try{
		var mobile = req.body.mobile || -1;
		permission.checkUserPermissionByMobile(req.url, mobile, 'pc', function(hasPermission){
			if(hasPermission){
				carSelect.carSelectPolygon(req,res);
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

//直线附近摄像头
server.post("/car/carSelectLine",function(req,res,next){
	res.setHeader("Access-Control-Allow-Origin","*");
	try{
		var mobile = req.body.mobile || -1;
		permission.checkUserPermissionByMobile(req.url, mobile, 'pc', function(hasPermission){
			if(hasPermission){
				carSelect.carSelectLine(req,res);
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
*/

//去掉权限
//矩形框选摄像头
server.post("/car/carSelectRect",function(req,res,next){
	res.setHeader("Access-Control-Allow-Origin","*");
	
				carSelect.carSelectRect(req,res);
			
	return next();
});

//圆形框选摄像头
server.post("/car/carSelectCircle",function(req,res,next){
	res.setHeader("Access-Control-Allow-Origin","*");
	
				carSelect.carSelectCircle(req,res);
				
	return next();
});

//多边形框选摄像头
server.post("/car/carSelectPolygon",function(req,res,next){
	res.setHeader("Access-Control-Allow-Origin","*");
	
				carSelect.carSelectPolygon(req,res);
			
});

//直线附近摄像头
server.post("/car/carSelectLine",function(req,res,next){
	res.setHeader("Access-Control-Allow-Origin","*");
	
				carSelect.carSelectLine(req,res);
				
	return next();
});


module.exports = server;
