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
******************************************************/
var server = global.server
// var Role = require('../controller/roleController')


//判断用户是否拥有权限
// server.post("/user/checkUserPermission",function(req,res,next){
// 	res.setHeader("Access-Control-Allow-Origin","*");
// 	User.checkMobile2TokenWithPermissionFrontEnd(req,res);
// 	return next();
// });

// module.exports = server;