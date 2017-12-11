var server = global.server
var Department = require('../controller/departmentController')
var permission = require("../controller/roleActionController")

//添加一级部门
server.post("/department/add1",function(req,res,next){
	res.setHeader("Access-Control-Allow-Origin","*");
	try{
		var mobile = req.body.mobile || -1;
		permission.checkUserPermissionByMobile(req.url, mobile, 'pc', function(hasPermission){
			if(hasPermission){
				Department.add1(req,res);
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

//添加二级部门
server.post("/department/add2",function(req,res,next){
	res.setHeader("Access-Control-Allow-Origin","*");
	try{
		var mobile = req.body.mobile || -1;
		permission.checkUserPermissionByMobile(req.url, mobile, 'pc', function(hasPermission){
			if(hasPermission){
				Department.add2(req,res);
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

//获取所有一级部门
server.post("/department/list1",function(req,res,next){
	res.setHeader("Access-Control-Allow-Origin","*");
	try{
		var mobile = req.body.mobile || -1;
		permission.checkUserPermissionByMobile(req.url, mobile, 'pc', function(hasPermission){
			if(hasPermission){
				Department.list1(req,res);
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

//获取所有二级部门
server.post("/department/list2",function(req,res,next){
	res.setHeader("Access-Control-Allow-Origin","*");
	try{
		var mobile = req.body.mobile || -1;
		permission.checkUserPermissionByMobile(req.url, mobile, 'pc', function(hasPermission){
			if(hasPermission){
				Department.list2(req,res);
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

//更新一级部门名字
server.post("/department/edit1",function(req,res,next){
	res.setHeader("Access-Control-Allow-Origin","*");
	try{
		var mobile = req.body.mobile || -1;
		permission.checkUserPermissionByMobile(req.url, mobile, 'pc', function(hasPermission){
			if(hasPermission){
				Department.edit1(req,res);
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

//更新二级部门名字
server.post("/department/edit2",function(req,res,next){
	res.setHeader("Access-Control-Allow-Origin","*");
	try{
		var mobile = req.body.mobile || -1;
		permission.checkUserPermissionByMobile(req.url, mobile, 'pc', function(hasPermission){
			if(hasPermission){
				Department.edit2(req,res);
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

//更改用户部门
server.post("/department/updateDepartment",function(req,res,next){
	res.setHeader("Access-Control-Allow-Origin","*");
	try{
		var mobile = req.body.mobile || -1;
		permission.checkUserPermissionByMobile(req.url, mobile, 'pc', function(hasPermission){
			if(hasPermission){
				Department.updateDepartment(req,res);
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

/**************************************************忧伤的分割线**************************************************/

//删除二级部门；
server.post("/department/delete2",function(req,res,next){
	res.setHeader("Access-Control-Allow-Origin","*");
	try{
		var mobile = req.body.mobile || -1;
		permission.checkUserPermissionByMobile(req.url, mobile, 'pc', function(hasPermission){
			if(hasPermission){
				Department.del2(req,res);
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

//删除一级部门；
server.post("/department/delete1",function(req,res,next){
	res.setHeader("Access-Control-Allow-Origin","*");
	try{
		var mobile = req.body.mobile || -1;
		permission.checkUserPermissionByMobile(req.url, mobile, 'pc', function(hasPermission){
			if(hasPermission){
				Department.del1(req,res);
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