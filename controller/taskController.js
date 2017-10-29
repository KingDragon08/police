var DB_CONFIG = require("../dbconfig");
var mysql = require('mysql');
var crypto = require('crypto');
var Sync = require('sync');

var conn = mysql.createConnection({
    host: DB_CONFIG.host,
    user: DB_CONFIG.user,
    password: DB_CONFIG.password,
    database: DB_CONFIG.database,
    port: DB_CONFIG.port
});
conn.connect();

/****
CREATE TABLE `task` (
  `Id` int(32) NOT NULL AUTO_INCREMENT,
  `cameraName` varchar(255) NOT NULL,
  `cameraLocation` varchar(255) NOT NULL,
  `taskDescription` text,
  `userId` int(32) NOT NULL,
  `taskNO` varchar(50) NOT NULL,
  `taskStatus` int(8) NOT NULL DEFAULT '0',
  `cameraId` int(32) NOT NULL,
  `rejectInfo` varchar(1000)
  PRIMARY KEY (`Id`)
) ENGINE=InnoDB AUTO_INCREMENT=1 DEFAULT CHARSET=utf8;
taskStatus:
0:未接受
1:进行中
2:审核中
3:已完成
4:审核不通过
****/

//发布任务
//当cameraId对应的任务存在时不允许发布，即一个摄像头只允许发布一次任务
function publishTask(req, res) {
    var query = req.body;
    // console.log(req);
    try {
        var mobile = query.mobile;
        var token = query.token;
        checkMobile2Token_PC(mobile, token, function(result) {
            if (result) {
                var cameraName = query.cameraName || -1;
                var cameraLocation = query.cameraLocation || -1;
                var taskDescription = query.taskDescription || -1;
                var userId = query.userId || -1;
                var cameraId = query.cameraId || -1;
                var taskNO = new Date().getTime();
                var taskStatus = 0;
                if (cameraName == -1 || cameraLocation == -1 ||
                    taskDescription == -1 || userId == -1 ||
                    taskNO == -1 || taskStatus == -1 ||
                    cameraId == -1
                    ) {
					res.json({ "code": 300, "data": { "status": "fail", "error": "param error2" } });	
                } else {
                	//检查该摄像头的任务是否已经存在
                	sql = "select count(Id) as total from task where cameraId=?";
                	conn.query(sql,[cameraId],function(err,data){
                		// console.log(data[0].total);
                		if(data[0].total==0){
                			conn.query("insert into task(cameraName,cameraLocation," +
		                        "taskDescription,userId,taskNO,taskStatus,cameraId)values(?,?,?,?,?,?,?)", [cameraName, cameraLocation, taskDescription, userId, taskNO, taskStatus,cameraId],
		                        function(err, data) {
		                            res.json({ "code": 200, "data": { "status": "success", "error": "success" } });
		                    });
                		} else {
                			res.json({ "code": 300, "data": { "status": "fail", "error": "cameraId exist in tasks" } });
                		}
                	});
                }
            } else {
                res.json({ "code": 300, "data": { "status": "fail", "error": "mobile not match token" } });
            }
        });
    } catch (e) {
    	// console.log(e);
        res.json({ "code": 302, "data": { "status": "fail", "error": "param error1" } });
    }
}

//PC分页获取所有任务
function getAllTask(req,res){
	var query = req.body;
    try {
        var mobile = query.mobile;
        var token = query.token;
        checkMobile2Token_PC(mobile, token, function(result) {
            if (result) {
            	var page = query.page || 1;
            	var pageSize = query.pageSize || 20;
            	page = parseInt(page);
            	pageSize = parseInt(pageSize);
            	if(page<1){
            		page = 1;
            	}
            	var start = (page - 1)*pageSize;
            	var sql = "select * from task order by Id desc limit ?,?";
            	conn.query(sql,[start,pageSize],function(err,data){
            		ret = {};
                    ret["status"] = "success";
                    ret["data"] = data;
                    res.json({ "code": 200, "data": ret });
            	});
            } else {
                res.json({ "code": 300, "data": { "status": "fail", "error": "mobile not match token" } });
            }
        });
    } catch (e) {
        res.json({ "code": 300, "data": { "status": "fail", "error": "param error1" } });
    }
}

//PC按任务用户分页获取任务
function getUserTask(req,res){
	var query = req.body;
    try {
        var mobile = query.mobile;
        var token = query.token;
        checkMobile2Token_PC(mobile, token, function(result) {
            if (result) {
            	var page = query.page || 1;
            	var pageSize = query.pageSize || 20;
            	var userId = query.userId;
            	page = parseInt(page);
            	pageSize = parseInt(pageSize);
            	if(page<1){
            		page = 1;
            	}
            	var start = (page - 1)*pageSize;
            	var sql = "select * from task where userId=? order by Id desc limit ?,?";
            	conn.query(sql,[userId,start,pageSize],function(err,data){
            		ret = {};
                    ret["status"] = "success";
                    ret["data"] = data;
                    res.json({ "code": 200, "data": ret });
            	});
            } else {
                res.json({ "code": 300, "data": { "status": "fail", "error": "mobile not match token" } });
            }
        });
    } catch (e) {
        res.json({ "code": 300, "data": { "status": "fail", "error": "param error1" } });
    }
}

//PC模糊搜索分页获取任务
function searchTask(req,res){
	var query = req.body;
    try {
        var mobile = query.mobile;
        var token = query.token;
        checkMobile2Token_PC(mobile, token, function(result) {
            if (result) {
            	var page = query.page || 1;
            	var pageSize = query.pageSize || 20;
            	var keyword = query.keyword;
            	page = parseInt(page);
            	pageSize = parseInt(pageSize);
            	if(page<1){
            		page = 1;
            	}
            	var start = (page - 1)*pageSize;
            	var sql = "select * from task where cameraName like "+
            				conn.escape('%' + keyword + '%') +
            				" order by Id desc limit ?,?";
            	// console.log(sql);
            	conn.query(sql,[start,pageSize],function(err,data){
            		// console.log(err);
            		// console.log(data);
            		ret = {};
                    ret["status"] = "success";
                    ret["data"] = data;
                    res.json({ "code": 200, "data": ret });
            	});
            } else {
                res.json({ "code": 300, "data": { "status": "fail", "error": "mobile not match token" } });
            }
        });
    } catch (e) {
        res.json({ "code": 300, "data": { "status": "fail", "error": "param error1" } });
    }
}

//App分页按状态获取自己的任务
function getTaskMobile(req,res){
	var query = req.body;
    try {
        var mobile = query.mobile;
        var token = query.token;
        checkMobile2Token_MOBILE(mobile, token, function(result) {
            if (result) {
            	var page = query.page || 1;
            	var pageSize = query.pageSize || 20;
            	var userId = query.userId;
            	var taskStatus = parseInt(query.taskStatus) || 0;
            	page = parseInt(page);
            	pageSize = parseInt(pageSize);
            	if(page<1){
            		page = 1;
            	}
            	var start = (page - 1)*pageSize;
            	var sql = "select * from task where userId=? and taskStatus=?"+
            				" order by Id desc limit ?,?";
            	conn.query(sql,[userId,taskStatus,start,pageSize],function(err,data){
            		// console.log(err);
            		// console.log(data);
            		ret = {};
                    ret["status"] = "success";
                    ret["data"] = data;
                    res.json({ "code": 200, "data": ret });
            	});
            } else {
                res.json({ "code": 300, "data": { "status": "fail", "error": "mobile not match token" } });
            }
        });
    } catch (e) {
        res.json({ "code": 300, "data": { "status": "fail", "error": "param error1" } });
    }
}

//审核任务
//3=>审核通过
//4=>审核不通过
function checkTask(req,res){
	var query = req.body;
    try {
        var mobile = query.mobile;
        var token = query.token;
        checkMobile2Token_PC(mobile, token, function(result) {
            if (result) {
            	var taskId = query.taskId || -1;
            	var taskStatus = query.taskStatus || -1;
            	taskId = parseInt(taskId);
            	taskStatus = parseInt(taskStatus);
            	var info = query.info || "";
            	var sql = "";
            	if(taskId==-1 || taskStatus==-1 || (taskStatus==4&&info=="")){
            		res.json({ "code": 300, "data": { "status": "fail", "error": "param error2" } });
            	} else {
					if(taskStatus==3){
						sql = "update task set taskStatus=3 where Id=" + taskId;
					} else {
						sql = "update task set taskStatus=4,rejectInfo=";
						sql += conn.escape(info) + " where Id=" + taskId;
					}
					// console.log(sql);
					conn.query(sql,function(err,data){
						res.json({ "code": 200, "data": { "status": "success", "error": "success" } });	
					});            		
            	}
            } else {
                res.json({ "code": 300, "data": { "status": "fail", "error": "mobile not match token" } });
            }
        });
    } catch (e) {
        res.json({ "code": 300, "data": { "status": "fail", "error": "param error1" } });
    }
}

//验证账号和token是否匹配_PC端
function checkMobile2Token_PC(mobile, token, callback) {
    conn.query("select count(Id) as total from user where mobile=? and token=?", [mobile, token],
        function(err, result) {
            if (result[0].total > 0) {
                callback(true);
            } else {
                callback(false);
            }
        });
}

//验证账号和token是否匹配_手机端
function checkMobile2Token_MOBILE(mobile, token, callback) {
    conn.query("select count(Id) as total from mobileUser where mobile=? and token=?", [mobile, token],
        function(err, result) {
            if (result[0].total > 0) {
                callback(true);
            } else {
                callback(false);
            }
        });
}

//获取任务状态-服务端用
function getTaskStatus(cameraId,callback){
	cameraId = parseInt(cameraId);
	conn.query("select taskStatus from task where cameraId=?",
		[cameraId],function(err,data){
			if(data.length<1){
				callback(0);
			} else {
				callback(data[0].taskStatus);
			}
		});
}

//获取任务状态PC
function getTaskStatus_PC(req, res) {
    var query = req.body;
    try {
        var mobile = query.mobile;
        var token = query.token;
        checkMobile2Token_PC(mobile, token, function(result) {
            if (result) {
            	var cameraId = query.cameraId || -1;
            	if(cameraId==-1){
            		res.json({ "code": 300, "data": { "status": "fail", "error": "param error2" } });
            	} else {
            		cameraId = parseInt(cameraId);
            		conn.query("select taskStatus from task where cameraId=?",
            			[cameraId],function(err,data){
            				// console.log(data.length);
            				if(data.length<1){
            					ret = {};
			                    ret["status"] = "success";
			                    ret["data"] = {"taskStatus":0};
			                    res.json({ "code": 200, "data": ret });
            				} else {
            					ret = {};
			                    ret["status"] = "success";
			                    ret["data"] = {"taskStatus":data[0].taskStatus};
			                    res.json({ "code": 200, "data": ret });
            				}
            			});
            	}
            } else {
                res.json({ "code": 300, "data": { "status": "fail", "error": "mobile not match token" } });
            }
        });
    } catch (e) {
        res.json({ "code": 300, "data": { "status": "fail", "error": "param error1" } });
    }
}

//获取任务状态App
function getTaskStatus_App(req, res) {
    var query = req.body;
    try {
        var mobile = query.mobile;
        var token = query.token;
        checkMobile2Token_MOBILE(mobile, token, function(result) {
            if (result) {
            	var cameraId = query.cameraId || -1;
            	if(cameraId==-1){
            		res.json({ "code": 300, "data": { "status": "fail", "error": "param error2" } });
            	} else {
            		cameraId = parseInt(cameraId);
            		conn.query("select taskStatus from task where cameraId=?",
            			[cameraId],function(err,data){
            				// console.log(data.length);
            				if(data.length<1){
            					ret = {};
			                    ret["status"] = "success";
			                    ret["data"] = {"taskStatus":0};
			                    res.json({ "code": 200, "data": ret });
            				} else {
            					ret = {};
			                    ret["status"] = "success";
			                    ret["data"] = {"taskStatus":data[0].taskStatus};
			                    res.json({ "code": 200, "data": ret });
            				}
            			});
            	}
            } else {
                res.json({ "code": 300, "data": { "status": "fail", "error": "mobile not match token" } });
            }
        });
    } catch (e) {
        res.json({ "code": 300, "data": { "status": "fail", "error": "param error1" } });
    }
}

//服务端更改任务的状态为审核中
function updateTask2Checking(cameraId,callback){
	cameraId = parseInt(cameraId);
	conn.query("select count(Id) as total from task where cameraId=?",[cameraId],
		function(err,data){
			if(data[0].total==0){
				callback(0);
			} else {
				conn.query("update task set taskStatus=2 where cameraId=?",[cameraId],
					function(err,data){
						callback(1);
					});
			}
		});
}

//删除任务
function deleteTask(req,res){
	var query = req.body;
    try {
        var mobile = query.mobile;
        var token = query.token;
        checkMobile2Token_PC(mobile, token, function(result) {
            if (result) {
            	var taskId = query.taskId || -1;
            	if(taskId==-1){
        			res.json({ "code": 300, "data": { "status": "fail", "error": "param error2" } });    		
            	} else {
            		taskId = parseInt(taskId);
            		conn.query("delete from task where Id=?",[taskId],
            			function(err,data){
            				res.json({ "code": 200, "data": { "status": "success", "error": "success" } });	
            			});
            	}
            } else {
                res.json({ "code": 300, "data": { "status": "fail", "error": "mobile not match token" } });
            }
        });
    } catch (e) {
        res.json({ "code": 300, "data": { "status": "fail", "error": "param error1" } });
    }
}

//接受任务_App
function acceptTask(req,res){
	var query = req.body;
    try {
        var mobile = query.mobile;
        var token = query.token;
        checkMobile2Token_MOBILE(mobile, token, function(result) {
            if (result) {
            	var taskId = query.taskId || -1;
            	if(taskId==-1){
        			res.json({ "code": 300, "data": { "status": "fail", "error": "param error2" } });    		
            	} else {
            		taskId = parseInt(taskId);
            		conn.query("update task set taskStatus=1 where Id=?",[taskId],
            			function(err,data){
            				res.json({ "code": 200, "data": { "status": "success", "error": "success" } });	
            			});
            	}
            } else {
                res.json({ "code": 300, "data": { "status": "fail", "error": "mobile not match token" } });
            }
        });
    } catch (e) {
        res.json({ "code": 300, "data": { "status": "fail", "error": "param error1" } });
    }
}

//模板
function funcName(req, res) {
    var query = req.body;
    try {
        var mobile = query.mobile;
        var token = query.token;
        checkMobile2Token_PC(mobile, token, function(result) {
            if (result) {

            } else {
                res.json({ "code": 300, "data": { "status": "fail", "error": "mobile not match token" } });
            }
        });
    } catch (e) {
        res.json({ "code": 300, "data": { "status": "fail", "error": "param error1" } });
    }
}


exports.publishTask = publishTask;
exports.getAllTask = getAllTask;
exports.getUserTask = getUserTask;
exports.searchTask = searchTask;
exports.getTaskMobile = getTaskMobile;
exports.checkTask = checkTask;
exports.getTaskStatus = getTaskStatus;
exports.getTaskStatus_PC = getTaskStatus_PC;
exports.getTaskStatus_App = getTaskStatus_App;
exports.updateTask2Checking = updateTask2Checking;
exports.deleteTask = deleteTask;
exports.acceptTask = acceptTask;



