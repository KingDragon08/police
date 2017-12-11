//角色及角色权限管理
/*****************************************************
所有的权限
1.PC用户相关
查看所有用户           view_pc_user
更新用户信息           update_pc_user
删除用户              delete_pc_user
增加用户              add_pc_user
2.App用户相关
查看所有用户           view_app_user
更新用户信息           update_app_user
删除用户              delete_app_user
增加用户              add_app_user
3.摄像头相关
查看摄像头信息         view_camera
更新摄像头信息         update_camera 
删除摄像头            delete_camera
增加摄像头            add_camera
查看摄像头反馈信息      view_camera_feedback
4.警车相关
查看警车信息           view_car
更新警车信息           update_car
删除警车              delete_car
增加警车              add_car
5.任务相关
查看任务信息           view_task
更新任务信息           update_task
删除任务              delete_task
增加任务              add_task
6.角色相关
查看角色信息           view_role
更新角色信息           update_role
删除角色              delete_role
增加角色              add_role
******************************************************/
var server = global.server
var roleController = require('../controller/roleController')
var actionController = require('../controller/actionController')
var roleActionController = require('../controller/roleActionController')
var permission = require("../controller/roleActionController")
//判断用户是否拥有权限
// server.post("/user/checkUserPermission",function(req,res,next){
// 	res.setHeader("Access-Control-Allow-Origin","*");
// 	User.checkMobile2TokenWithPermissionFrontEnd(req,res);
// 	return next();
// });
// 添加角色
server.post("/role/addrole", function(req, res, next) {
    res.setHeader("Access-Control-Allow-Origin", "*");
	try{
		var mobile = req.body.mobile || -1;
		permission.checkUserPermissionByMobile(req.url, mobile, 'pc', function(hasPermission){
			if(hasPermission){
				roleController.addRole(req, res);
			} else {
				permission.permissionDenied(res);
			}
		});
	} catch(e) {
		permission.permissionDenied(res);
	}
    return next();
});
// 删除角色
server.post("/role/delrole", function(req, res, next) {
    res.setHeader("Access-Control-Allow-Origin", "*");  
	try{
		var mobile = req.body.mobile || -1;
		permission.checkUserPermissionByMobile(req.url, mobile, 'pc', function(hasPermission){
			if(hasPermission){
			    roleController.delRole(req, res);
			} else {
				permission.permissionDenied(res);
			}
		});
	} catch(e) {
		permission.permissionDenied(res);
	}
    return next();
});
// 编辑角色
server.post("/role/editrole", function(req, res, next) {
    res.setHeader("Access-Control-Allow-Origin", "*");
	try{
		var mobile = req.body.mobile || -1;
		permission.checkUserPermissionByMobile(req.url, mobile, 'pc', function(hasPermission){
			if(hasPermission){
			    roleController.editRole(req, res);
			} else {
				permission.permissionDenied(res);
			}
		});
	} catch(e) {
		permission.permissionDenied(res);
	}

    return next();
});
// 获取角色列表
server.post("/role/getrolelist", function(req, res, next) {
    res.setHeader("Access-Control-Allow-Origin", "*");   
	try{
		var mobile = req.body.mobile || -1;
		permission.checkUserPermissionByMobile(req.url, mobile, 'pc', function(hasPermission){
			if(hasPermission){
			    roleController.getRoleList(req, res);
			} else {
				permission.permissionDenied(res);
			}
		});
	} catch(e) {
		permission.permissionDenied(res);
	}
    return next();
});
// 添加操作
server.post("/role/addaction", function(req, res, next) {
    res.setHeader("Access-Control-Allow-Origin", "*");
	try{
		var mobile = req.body.mobile || -1;
		permission.checkUserPermissionByMobile(req.url, mobile, 'pc', function(hasPermission){
			if(hasPermission){
			    actionController.addAction(req, res);
			} else {
				permission.permissionDenied(res);
			}
		});
	} catch(e) {
		permission.permissionDenied(res);
	}
    return next();
});
// 删除操作
server.post("/role/delaction", function(req, res, next) {
    res.setHeader("Access-Control-Allow-Origin", "*");  
	try{
		var mobile = req.body.mobile || -1;
		permission.checkUserPermissionByMobile(req.url, mobile, 'pc', function(hasPermission){
			if(hasPermission){
			   actionController.delAction(req, res);
			} else {
				permission.permissionDenied(res);
			}
		});
	} catch(e) {
		permission.permissionDenied(res);
	}
    return next();
});
// 编辑操作
server.post("/role/editaction", function(req, res, next) {
    res.setHeader("Access-Control-Allow-Origin", "*");   
	try{
		var mobile = req.body.mobile || -1;
		permission.checkUserPermissionByMobile(req.url, mobile, 'pc', function(hasPermission){
			if(hasPermission){
			   actionController.editAction(req, res);
			} else {
				permission.permissionDenied(res);
			}
		});
	} catch(e) {
		permission.permissionDenied(res);
	}
    return next();
});
// 获取操作列表
server.post("/role/getactionlist", function(req, res, next) {
    res.setHeader("Access-Control-Allow-Origin", "*");   
	try{
		var mobile = req.body.mobile || -1;
		permission.checkUserPermissionByMobile(req.url, mobile, 'pc', function(hasPermission){
			if(hasPermission){
			    actionController.getActionList(req, res);
			} else {
				permission.permissionDenied(res);
			}
		});
	} catch(e) {
		permission.permissionDenied(res);
	}
    return next();
});
// 添加角色操作
server.post("/role/addroleaction", function(req, res, next) {
    res.setHeader("Access-Control-Allow-Origin", "*");  
	try{
		var mobile = req.body.mobile || -1;
		permission.checkUserPermissionByMobile(req.url, mobile, 'pc', function(hasPermission){
			if(hasPermission){
			   roleActionController.addRoleAction(req, res);
			} else {
				permission.permissionDenied(res);
			}
		});
	} catch(e) {
		permission.permissionDenied(res);
	}
    return next();
});
// 删除角色操作
server.post("/role/delroleaction", function(req, res, next) {
    res.setHeader("Access-Control-Allow-Origin", "*");
	try{
		var mobile = req.body.mobile || -1;
		permission.checkUserPermissionByMobile(req.url, mobile, 'pc', function(hasPermission){
			if(hasPermission){
				roleActionController.delRoleAction(req, res);
			} else {
				permission.permissionDenied(res);
			}
		});
	} catch(e) {
		permission.permissionDenied(res);
	}
    return next();
});
// 编辑角色操作
server.post("/role/editroleaction", function(req, res, next) {
    res.setHeader("Access-Control-Allow-Origin", "*");    
	try{
		var mobile = req.body.mobile || -1;
		permission.checkUserPermissionByMobile(req.url, mobile, 'pc', function(hasPermission){
			if(hasPermission){
				roleActionController.editRoleAction(req, res);
			} else {
				permission.permissionDenied(res);
			}
		});
	} catch(e) {
		permission.permissionDenied(res);
	}
    return next();
});
// 获取角色操作列表
server.post("/role/getroleactionlist", function(req, res, next) {
    res.setHeader("Access-Control-Allow-Origin", "*");
	try{
		var mobile = req.body.mobile || -1;
		permission.checkUserPermissionByMobile(req.url, mobile, 'pc', function(hasPermission){
			if(hasPermission){
				roleActionController.getRoleActionList(req, res);
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