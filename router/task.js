//任务管理

var server = global.server
var Task = require('../controller/taskController')
var permission = require("../controller/roleActionController")


//发布任务
server.post("/task/publishTask",function(req,res,next){
	res.setHeader("Access-Control-Allow-Origin","*");
	try{
		var mobile = req.body.mobile || -1;
		permission.checkUserPermissionByMobile(req.url, mobile, 'pc', function(hasPermission){
			if(hasPermission){
	            Task.publishTask(req,res);
			} else {
				permission.permissionDenied(res);
			}
		});
	} catch(e) {
		permission.permissionDenied(res);
	}
	return next();
});

//发布采集新摄像头的任务
server.post("/task/publishTaskWithoutCamera",function(req,res,next){
	res.setHeader("Access-Control-Allow-Origin","*");
//	try{
//		var mobile = req.body.mobile || -1;
//		permission.checkUserPermissionByMobile(req.url, mobile, 'pc', function(hasPermission){
//			if(hasPermission){
	           Task.publishTaskWithoutCamera(req,res);
//			} else {
//				permission.permissionDenied(res);
//			}
//		});
//	} catch(e) {
//		permission.permissionDenied(res);
//	}
	return next();
});

//任务采集反馈-有任务
server.post("/task/taskFeedBack",function(req,res,next){
	res.setHeader("Access-Control-Allow-Origin","*");	
//	try{
//		var mobile = req.body.mobile || -1;
//		permission.checkUserPermissionByMobile(req.url, mobile, 'pc', function(hasPermission){
//			if(hasPermission){
	            Task.taskFeedBack(req,res);
//			} else {
//				permission.permissionDenied(res);
//			}
//		});
//	} catch(e) {
//		permission.permissionDenied(res);
//	}
	return next();
});

//任务采集反馈-没有任务
server.post("/task/feedBackWithoutTask",function(req,res,next){
	res.setHeader("Access-Control-Allow-Origin","*");
//	try{
//		var mobile = req.body.mobile || -1;
//		permission.checkUserPermissionByMobile(req.url, mobile, 'pc', function(hasPermission){
//			if(hasPermission){
	            Task.feedBackWithoutTask(req,res);
//			} else {
//				permission.permissionDenied(res);
//			}
//		});
//	} catch(e) {
//		permission.permissionDenied(res);
//	}
	return next();
});

//任务采集反馈编辑
server.post("/task/taskFeedBackEdit",function(req,res,next){
	res.setHeader("Access-Control-Allow-Origin","*");	
//	try{
//		var mobile = req.body.mobile || -1;
//		permission.checkUserPermissionByMobile(req.url, mobile, 'pc', function(hasPermission){
//			if(hasPermission){
	            Task.taskFeedBackEdit(req,res);
//			} else {
//				permission.permissionDenied(res);
//			}
//		});
//	} catch(e) {
//		permission.permissionDenied(res);
//	}
	return next();
});

//PC分页获取所有任务
server.post("/task/getAllTask",function(req,res,next){
	res.setHeader("Access-Control-Allow-Origin","*");
	try{
		var mobile = req.body.mobile || -1;
		permission.checkUserPermissionByMobile(req.url, mobile, 'pc', function(hasPermission){
			if(hasPermission){
	            Task.getAllTask(req,res);
			} else {
				permission.permissionDenied(res);
			}
		});
	} catch(e) {
		permission.permissionDenied(res);
	}
	return next();
});

//PC按任务用户分页获取任务
server.post("/task/getUserTask",function(req,res,next){
	res.setHeader("Access-Control-Allow-Origin","*");
	
	try{
		var mobile = req.body.mobile || -1;
		permission.checkUserPermissionByMobile(req.url, mobile, 'pc', function(hasPermission){
			if(hasPermission){
				Task.getUserTask(req,res);
			} else {
				permission.permissionDenied(res);
			}
		});
	} catch(e) {
		permission.permissionDenied(res);
	}
	return next();
});

//PC模糊搜索分页获取任务
server.post("/task/searchTask",function(req,res,next){
	res.setHeader("Access-Control-Allow-Origin","*");
	try{
		var mobile = req.body.mobile || -1;
		permission.checkUserPermissionByMobile(req.url, mobile, 'pc', function(hasPermission){
			if(hasPermission){
				Task.searchTask(req,res);
			} else {
				permission.permissionDenied(res);
			}
		});
	} catch(e) {
		permission.permissionDenied(res);
	}
	return next();
});

//App分页按状态获取自己的任务
server.post("/task/getTaskMobile",function(req,res,next){
	res.setHeader("Access-Control-Allow-Origin","*");	
	//try{
	//	var mobile = req.body.mobile || -1;
	//	permission.checkUserPermissionByMobile(req.url, mobile, 'pc', function(hasPermission){
	//		if(hasPermission){
				Task.getTaskMobile(req,res);
	//		} else {
	//			permission.permissionDenied(res);
	//		}
	//	});
	//} catch(e) {
	//	permission.permissionDenied(res);
	//}
	return next();
});

//PC分页按状态获取任务
server.post("/task/getTaskPC",function(req,res,next){
	res.setHeader("Access-Control-Allow-Origin","*");
	try{
		var mobile = req.body.mobile || -1;
		permission.checkUserPermissionByMobile(req.url, mobile, 'pc', function(hasPermission){
			if(hasPermission){
				Task.getTaskPC(req,res);
			} else {
				permission.permissionDenied(res);
			}
		});
	} catch(e) {
		permission.permissionDenied(res);
	}
	return next();
});

//审核任务
server.post("/task/checkTask",function(req,res,next){
	res.setHeader("Access-Control-Allow-Origin","*");
	
	try{
		var mobile = req.body.mobile || -1;
		permission.checkUserPermissionByMobile(req.url, mobile, 'pc', function(hasPermission){
			if(hasPermission){
				Task.checkTask(req,res);
			} else {
				permission.permissionDenied(res);
			}
		});
	} catch(e) {
		permission.permissionDenied(res);
	}
	return next();
});

//获取任务状态PC
server.post("/task/getTaskStatus_PC",function(req,res,next){
	res.setHeader("Access-Control-Allow-Origin","*");
	
	try{
		var mobile = req.body.mobile || -1;
		permission.checkUserPermissionByMobile(req.url, mobile, 'pc', function(hasPermission){
			if(hasPermission){
				Task.getTaskStatus_PC(req,res);
			} else {
				permission.permissionDenied(res);
			}
		});
	} catch(e) {
		permission.permissionDenied(res);
	}
	return next();
});

//获取任务状态App
server.post("/task/getTaskStatus_App",function(req,res,next){
	res.setHeader("Access-Control-Allow-Origin","*");
	
	//try{
	//	var mobile = req.body.mobile || -1;
	//	permission.checkUserPermissionByMobile(req.url, mobile, 'pc', function(hasPermission){
	//		if(hasPermission){
				Task.getTaskStatus_App(req,res);
	//		} else {
	//			permission.permissionDenied(res);
	//		}
	//	});
	//} catch(e) {
	//	permission.permissionDenied(res);
	//}
	return next();
});

//删除任务
server.post("/task/deleteTask",function(req,res,next){
	res.setHeader("Access-Control-Allow-Origin","*");
	
	try{
		var mobile = req.body.mobile || -1;
		permission.checkUserPermissionByMobile(req.url, mobile, 'pc', function(hasPermission){
			if(hasPermission){
				Task.deleteTask(req,res);
			} else {
				permission.permissionDenied(res);
			}
		});
	} catch(e) {
		permission.permissionDenied(res);
	}
	return next();
});

//接受任务
server.post("/task/acceptTaskStatus_App",function(req,res,next){
	res.setHeader("Access-Control-Allow-Origin","*");	
		//try{
		// var mobile = req.body.mobile || -1;
		// permission.checkUserPermissionByMobile(req.url, mobile, 'pc', function(hasPermission){
		// 	if(hasPermission){
				Task.acceptTask(req,res);
	// 		} else {
	// 			permission.permissionDenied(res);
	// 		}
	// 	});
	// } catch(e) {
	// 	permission.permissionDenied(res);
	// }
	return next();
});

//根据任务Id获取任务的详情及反馈信息,PC 
server.post("/task/getTaskById",function(req,res,next){
	res.setHeader("Access-Control-Allow-Origin","*");	
	try{
		var mobile = req.body.mobile || -1;
		permission.checkUserPermissionByMobile(req.url, mobile, 'pc', function(hasPermission){
			if(hasPermission){
				Task.getTaskById(req,res);
			} else {
				permission.permissionDenied(res);
			}
		});
	} catch(e) {
		permission.permissionDenied(res);
	}
	return next();
});

//根据任务Id获取任务的详情及反馈信息,App 
server.post("/task/getTaskByIdAPP",function(req,res,next){
	res.setHeader("Access-Control-Allow-Origin","*");	
	// try{
	// 	var mobile = req.body.mobile || -1;
	// 	permission.checkUserPermissionByMobile(req.url, mobile, 'pc', function(hasPermission){
	// 		if(hasPermission){
				Task.getTaskByIdAPP(req,res);
	// 		} else {
	// 			permission.permissionDenied(res);
	// 		}
	// 	});
	// } catch(e) {
	// 	permission.permissionDenied(res);
	// }
	return next();
});


module.exports = server;