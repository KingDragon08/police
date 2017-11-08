//任务管理

var server = global.server
var Task = require('../controller/taskController')


//发布任务
server.post("/task/publishTask",function(req,res,next){
	res.setHeader("Access-Control-Allow-Origin","*");
	Task.publishTask(req,res);
	return next();
});

//发布采集新摄像头的任务
server.post("/task/publishTaskWithoutCamera",function(req,res,next){
	res.setHeader("Access-Control-Allow-Origin","*");
	Task.publishTaskWithoutCamera(req,res);
	return next();
});

//任务采集反馈
server.post("/task/taskFeedBack",function(req,res,next){
	res.setHeader("Access-Control-Allow-Origin","*");
	Task.taskFeedBack(req,res);
	return next();
});

//PC分页获取所有任务
server.post("/task/getAllTask",function(req,res,next){
	res.setHeader("Access-Control-Allow-Origin","*");
	Task.getAllTask(req,res);
	return next();
});

//PC按任务用户分页获取任务
server.post("/task/getUserTask",function(req,res,next){
	res.setHeader("Access-Control-Allow-Origin","*");
	Task.getUserTask(req,res);
	return next();
});

//PC模糊搜索分页获取任务
server.post("/task/searchTask",function(req,res,next){
	res.setHeader("Access-Control-Allow-Origin","*");
	Task.searchTask(req,res);
	return next();
});

//App分页按状态获取自己的任务
server.post("/task/getTaskMobile",function(req,res,next){
	res.setHeader("Access-Control-Allow-Origin","*");
	Task.getTaskMobile(req,res);
	return next();
});

//PC分页按状态获取任务
server.post("/task/getTaskPC",function(req,res,next){
	res.setHeader("Access-Control-Allow-Origin","*");
	Task.getTaskPC(req,res);
	return next();
});

//审核任务
server.post("/task/checkTask",function(req,res,next){
	res.setHeader("Access-Control-Allow-Origin","*");
	Task.checkTask(req,res);
	return next();
});

//获取任务状态PC
server.post("/task/getTaskStatus_PC",function(req,res,next){
	res.setHeader("Access-Control-Allow-Origin","*");
	Task.getTaskStatus_PC(req,res);
	return next();
});

//获取任务状态App
server.post("/task/getTaskStatus_App",function(req,res,next){
	res.setHeader("Access-Control-Allow-Origin","*");
	Task.getTaskStatus_App(req,res);
	return next();
});

//删除任务
server.post("/task/deleteTask",function(req,res,next){
	res.setHeader("Access-Control-Allow-Origin","*");
	Task.deleteTask(req,res);
	return next();
});

//接受任务
server.post("/task/acceptTaskStatus_App",function(req,res,next){
	res.setHeader("Access-Control-Allow-Origin","*");
	Task.acceptTask(req,res);
	return next();
});

//根据任务Id获取任务的详情及反馈信息,PC 
server.post("/task/getTaskById",function(req,res,next){
	res.setHeader("Access-Control-Allow-Origin","*");
	Task.getTaskById(req,res);
	return next();
});

//根据任务Id获取任务的详情及反馈信息,App 
server.post("/task/getTaskByIdAPP",function(req,res,next){
	res.setHeader("Access-Control-Allow-Origin","*");
	Task.getTaskByIdAPP(req,res);
	return next();
});


module.exports = server;