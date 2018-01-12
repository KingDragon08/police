// var DB_CONFIG = require("../config/dbconfig");
// var mysql = require('mysql');
var crypto = require('crypto');
var Sync = require('sync');
var Camera = require("./cameraController");
var async = require('async');
var Log = require('./logController')

// var conn = mysql.createConnection({
//     host: DB_CONFIG.host,
//     user: DB_CONFIG.user,
//     password: DB_CONFIG.password,
//     database: DB_CONFIG.database,
//     port: DB_CONFIG.port
// });
// conn.connect();

var conn = require("../lib/db");

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
                var cameraLon = query.cameraLon ||-1;
                var cameraLa = query.cameraLa ||-1;
                var cam_BJ_X = query.cam_BJ_X ||-1;
                var cam_BJ_Y = query.cam_BJ_Y ||-1;
                var userId = query.userId || -1;
                var cameraId = query.cameraId || -1;
				var cam_category = query.cam_category||-1;
                var taskNO = new Date().getTime();
                var taskStatus = 0;
                if (cameraName == -1 || taskDescription == -1 || userId == -1 || cameraLon ==-1 || cameraLa==-1|| cam_BJ_X==-1||cam_BJ_Y==-1||
                    taskNO == -1 || taskStatus == -1 ||cam_category==-1||cameraId == -1
                    ) {
					res.json({ "code": 301, "data": { "status": "fail", "error": "参数错误" } });
                } else {
                	//检查该摄像头的任务是否已经存在
                	sql = "select count(Id) as total from task where cameraId=?";
                	conn.query(sql,[cameraId],function(err,data){
                		// console.log(data[0].total);
                		if(data[0].total==0){
                			conn.query("insert into task (cameraName,cameraLocation,cameraLon,cameraLa,cam_BJ_X,cam_BJ_Y,cam_category," +
		                        "taskDescription,userId,taskNO,taskStatus,cameraId)values(?,?,?,?,?,?,?,?,?,?,?,?)", [cameraName, cameraLocation, cameraLon,cameraLa,cam_BJ_X,cam_BJ_Y,cam_category,taskDescription, userId, taskNO, taskStatus,cameraId],
		                        function(err, data) {
                                    console.log(err);
                                    Log.insertLog(mobile,"发布任务","insert into task(cameraName,cameraLocation," +
                                                                    "taskDescription,userId,taskNO,taskStatus,cameraId)values(?,?,?,?,?,?,?)");
		                            res.json({ "code": 200, "data": { "status": "success", "error": "success" } });
		                    });
                		} else {
                			res.json({ "code": 300, "data": { "status": "fail", "error": "此任务已存在！" } });
                		}
                	});
                }
            } else {
                res.json({ "code": 300, "data": { "status": "fail", "error": "账号和token不匹配" } });
            }
        });
    } catch (e) {
        res.json({ "code": 302, "data": { "status": "fail", "error": "参数错误" } });
    }
}

//发布采集新摄像头的任务
function publishTaskWithoutCamera(req,res){
    var query = req.body;
    // console.log(req);
    try {
        var mobile = query.mobile;
        var token = query.token;
        checkMobile2Token_PC(mobile, token, function(result) {
            if (result) {
                var cameraName = query.cameraName || -1;
                var cameraLocation = query.cameraLocation || -1;
                var cameraLon = query.cameraLon;//经度
                var cameraLa = query.cameraLa;//纬度
                var taskDescription = query.taskDescription || -1;
                var userId = query.userId || -1;
                var cameraType = query.cameraType;
                var taskNO = new Date().getTime();
                var taskStatus = 0;
                if (cameraName == -1 || cameraLon == -1 || cameraLa==-1 ||
                    taskDescription == -1 || userId == -1
                    ) {
                    res.json({ "code": 301, "data": { "status": "fail", "error": "参数错误" } });
                } else {
                    //插入一条任务到task
                    sql = "insert into task(cameraName,cameraLocation," +
                            "taskDescription,userId,taskNO,taskStatus,"+
                            "cameraId,cameraLon,cameraLa,addtime,cameraType)"+
                            "values(?,?,?,?,?,?,?,?,?,?,?)";
                    conn.query(sql,
                            [cameraName, cameraLocation, taskDescription, 
                                userId, taskNO, taskStatus,-1,cameraLon,cameraLa,taskNO,parseInt(cameraType)],
                            function(err,data){
                                if(err){
                                    console.log(err);
                                } else {
                                    Log.insertLog(mobile,"发布新摄像头采集任务","insert into task(cameraName,cameraLocation," +
                                                                    "taskDescription,userId,taskNO,taskStatus,"+
                                                                    "cameraId,cameraLon,cameraLa,addtime,cameraType)"+
                                                                    "values(?,?,?,?,?,?,?,?,?,?,?)");
                                    res.json({ "code": 200, "data": { "status": "success", "error": "success" } });
                                }
                            }
                    );                    
                }
            } else {
                res.json({ "code": 300, "data": { "status": "fail", "error": "账号和token不匹配" } });
            }
        });
    } catch (e) {
        res.json({ "code": 302, "data": { "status": "fail", "error": "参数错误" } });
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
            	var sql = "select a.*,b.name as userName from task a left join user b "+
                            "on a.userId=b.Id order by a.Id desc limit ?,?";
            	conn.query(sql,[start,pageSize],function(err,data){
                    // console.log(err);
                    //获取数据总量
                    conn.query("select count(Id) as total from task",[],function(err,result){
                        ret = {};
                        ret["status"] = "success";
                        ret["data"] = data;
                        ret["total"] = result[0].total;
                        //Log.insertLog(mobile,req.url,sql);
                        res.json({ "code": 200, "data": ret });
                    });
            	});
            } else {
                res.json({ "code": 300, "data": { "status": "fail", "error": "账号和token不匹配" } });
            }
        });
    } catch (e) {
        res.json({ "code": 300, "data": { "status": "fail", "error": "参数错误" } });
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
                    conn.query("select count(Id) as total from task where userId=?",[userId],
                        function(err,result){
                            ret = {};
                            ret["total"] = result[0].total;
                            ret["status"] = "success";
                            ret["data"] = data;
                            //Log.insertLog(mobile,req.url,sql);
                            res.json({ "code": 200, "data": ret });
                        });
            	});
            } else {
                res.json({ "code": 300, "data": { "status": "fail", "error": "账号和token不匹配" } });
            }
        });
    } catch (e) {
        res.json({ "code": 300, "data": { "status": "fail", "error": "参数错误" } });
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
            	var sql = "select a.*,b.name as userName from task a left join user "+
                            "b on a.userId=b.Id where cameraName like "+
            				conn.escape('%' + keyword + '%') +
            				" order by a.Id desc limit ?,?";
            	// console.log(sql);
            	conn.query(sql,[start,pageSize],function(err,data){
            		// console.log(err);
            		// console.log(data);
            		ret = {};
                    ret["status"] = "success";
                    ret["data"] = data;
                    //Log.insertLog(mobile,req.url,sql);
                    res.json({ "code": 200, "data": ret });
            	});
            } else {
                res.json({ "code": 300, "data": { "status": "fail", "error": "账号和token不匹配" } });
            }
        });
    } catch (e) {
        res.json({ "code": 300, "data": { "status": "fail", "error": "参数错误" } });
    }
}

//PC分页按状态获取自己的任务
function getTaskPC(req,res){
    var query = req.body;
    try {
        var mobile = query.mobile;
        var token = query.token;
        checkMobile2Token_PC(mobile, token, function(result) {
            if (result) {
                var page = query.page || 1;
                var pageSize = query.pageSize || 20;
                var userId = query.userId || -1;
                var taskStatus = parseInt(query.taskStatus) || 0;
                page = parseInt(page);
                pageSize = parseInt(pageSize);
                if(page<1){
                    page = 1;
                }
                if(userId==-1){
                    //获取总的数据量
                    var sql = "select count(Id) as total from task where taskStatus=?";
                    conn.query(sql,[taskStatus],function(err,data){
                        var total = data[0].total;
                        var start = (page - 1)*pageSize;
                        var dataArr=[taskStatus,start,pageSize];
						if(taskStatus==0||taskStatus==1){
							var sql = "select *,from_unixtime(addtime div 1000,'%Y-%m-%d %H:%I:%S') as addtime from task  where taskStatus=? order by Id desc limit ?,?";
						}else{
							var sql = "select ra.*,rb.*,from_unixtime(rb.addtime div 1000,'%Y-%m-%d %H:%I:%S') as addtime from task ra, taskfeedback rb  where ra.taskStatus=? and ra.Id =rb.taskId order by rb.Id desc limit ?,?";
						}
                        
                        conn.query(sql,dataArr,function(err,data){
                            if(err){
                                res.json({ "code": 300, "data": { "status": "fail", "error": "数据库查询失败" } });
                            }else{
                                var sqls ="select * from user";
                                conn.query(sqls,null,function (err,result) {
                                    if(err){
                                        res.json({ "code": 300, "data": { "status": "fail", "error": "数据库查询失败" } });
                                    }else{
                                        ret = {};
                                        ret["status"] = "success";
                                        ret["data"] = data;
                                        ret["pageSize"] = pageSize;
                                        ret["totalPage"] = Math.ceil(parseInt(total)/pageSize);
                                        ret["userData"]  = result;
                                        ret["total"] = total;
                                        //Log.insertLog(mobile,req.url,sql);
                                        res.json({ "code": 200, "data": ret });
                                    }
                                });
                            }
                        });
                    });
                } else {
                    userId = parseInt(userId);   
                    //获取总的数据量
                    var sql = "select count(Id) as total from task where userId=? and taskStatus=?";
                    conn.query(sql,[userId,taskStatus],function(err,data){
                        var total = data[0].total;
                        var start = (page - 1)*pageSize;
                        var sql = "select * from task where userId=? and taskStatus=?"+
                                    " order by Id desc limit ?,?";
                        conn.query(sql,[userId,taskStatus,start,pageSize],function(err,data){
                            if(err){
                                res.json({ "code": 300, "data": { "status": "fail", "error": "数据库查询失败" } });
                            }else{
                                var sqls ="select * from user";
                                conn.query(sqls,null,function (err,result) {
                                    if(err){
                                        res.json({ "code": 300, "data": { "status": "fail", "error": "数据库查询失败" } });
                                    }else{
                                        ret = {};
                                        ret["status"] = "success";
                                        ret["data"] = data;
                                        ret["pageSize"] = pageSize;
                                        ret["totalPage"] = Math.ceil(parseInt(total)/pageSize);
                                        ret["userData"]  = result;
                                        //Log.insertLog(mobile,req.url,sql);
                                        res.json({ "code": 200, "data": ret });
                                    }
                                });
                            }
                        });
                    });
                }
                
            } else {
                res.json({ "code": 300, "data": { "status": "fail", "error": "账号和token不匹配" } });
            }
        });
    } catch (e) {
        res.json({ "code": 300, "data": { "status": "fail", "error": "参数错误" } });
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
            		if(err){
                        res.json({ "code": 500, "data": { "status": "fail", "error": "数据库查询错误！" } });
                    }else{
                        ret = {};
                        ret["status"] = "success";
                        ret["data"] = data;
                        //Log.insertLog(mobile,req.url,sql);
                        res.json({ "code": 200, "data": ret });

                    }

            	});
            } else {
                res.json({ "code": 300, "data": { "status": "fail", "error": "账号和token不匹配" } });
            }
        });
    } catch (e) {
        res.json({ "code": 300, "data": { "status": "fail", "error": "参数错误1" } });
    }
}

//审核任务
//3=>审核通过
//4=>审核不通过,拒绝时回滚到进行中
function checkTask(req,res){
	var query = req.body;
    try {
        var mobile = query.mobile;
        var token = query.token;
        checkMobile2Token_PC(mobile, token, function(result) {
            if (result) {
            	var taskId = query.taskId || -1;
            	var taskStatus = query.taskStatus || -1;

                //新增的经纬度微调
                var cameraLon = query.cameraLon || -1;
                var cameraLa = query.cameraLa || -1;

            	taskId = parseInt(taskId);
            	taskStatus = parseInt(taskStatus);
            	var info = query.info || "";
            	var sql = "";
            	if(taskId==-1 || taskStatus==-1 || cameraLon==-1 || cameraLa==-1 ||
                    (taskStatus==4&&info=="")){
            		res.json({ "code": 301, "data": { "status": "fail", "error": "参数错误" } });
            	} else {
					if(taskStatus==3){
						sql = "update task set taskStatus=3 where Id=" + taskId;
					} else {
                        //拒绝时回滚到进行中
						sql = "update task set taskStatus=4,rejectInfo=";
						sql += conn.escape(info) + " where Id=" + taskId;

					}
                    //更新记录
					conn.query(sql,function(err,data){
                        //如果审核通过的话添加摄像头
                        if(taskStatus==3){
                            //获取任务的反馈信息
                            sql = "select b.cameraExtra,b.camera_no,a.cameraName,a.cameraLocation,a.addtime,a.cameraType,a.userId,a.cameraId,b.cameraLon,b.cameraLa,b.content from "+
                                    "task a left join taskFeedBack b on a.Id=b.taskId where a.Id=?";
                            conn.query(sql,[taskId],
                                function(err,data){
                                    if(data && data.length>0){
                                        data = data[0];
                                        //仅仅是信息采集任务,不需要插入摄像头
                                        if(data.cameraId>0){
                                            res.json({ "code": 200, "data": { "status": "success", "error": "success" } }); 
                                        } else {
                                            //创建摄像头
                                            var curtime = new Date().getTime();
                                            Camera.createNewCamera(data.camera_no,data.cameraName,
                                                            data.cameraType,curtime,curtime,
                                                            data.userId,cameraLa,cameraLon,data.content,
                                                            data.cameraLocation,JSON.parse(data.cameraExtra),function(ret){
                                                                // res.json(ret);
                                                                var cameraId = ret.data.cam_id;
                                                                //更新任务表中的cameraId
                                                                conn.query("update task set cameraId=? where Id=?",[cameraId,taskId],
                                                                    function(err,result){
                                                                        Log.insertLog(mobile,"审核任务",sql);
                                                                        res.json({ "code": 200, "data": { "status": "success", "error": "success" } }); 
                                                                    });
                                                            });
                                        }
                                        
                                    } else {
                                        res.json({ "code": 300, "data": { "status": "fail", "error": "任务不存在" } });
                                    }
                                });
                        } else {
                            //Log.insertLog(mobile,req.url,sql);
                            res.json({ "code": 200, "data": { "status": "success", "error": "success" } }); 
                        }
					});            		
            	}
            } else {
                res.json({ "code": 300, "data": { "status": "fail", "error": "账号和token不匹配" } });
            }
        });
    } catch (e) {
        res.json({ "code": 300, "data": { "status": "fail", "error": "参数错误" } });
    }
}

//验证账号和token是否匹配_PC端
function checkMobile2Token_PC(mobile, token, callback) {
    conn.query("select count(Id) as total from user where mobile=? and token=? and status=?", [mobile, token, 1],
        function(err, result) {
            if (result && result.length && result[0].total > 0) {
                callback(true);
            } else {
                callback(false);
            }
        });
}

//验证账号和token是否匹配_手机端
function checkMobile2Token_MOBILE(mobile, token, callback) {
    conn.query("select count(Id) as total from mobileUser where mobile=? and token=? and status=?", [mobile, token, 1],
        function(err, result) {
            if (result && result.length && result[0].total > 0) {
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
            		res.json({ "code": 301, "data": { "status": "fail", "error": "参数错误" } });
            	} else {
            		cameraId = parseInt(cameraId);
            		conn.query("select taskStatus from task where cameraId=?",
            			[cameraId],function(err,data){
            				// console.log(data.length);
            				if(data.length<1){
            					ret = {};
			                    ret["status"] = "success";
			                    ret["data"] = {"taskStatus":0};
                                //Log.insertLog(mobile,req.url,"select taskStatus from task where cameraId=?");
			                    res.json({ "code": 200, "data": ret });
            				} else {
            					ret = {};
			                    ret["status"] = "success";
			                    ret["data"] = {"taskStatus":data[0].taskStatus};
                                //Log.insertLog(mobile,req.url,"select taskStatus from task where cameraId=?");
			                    res.json({ "code": 200, "data": ret });
            				}
            			});
            	}
            } else {
                res.json({ "code": 300, "data": { "status": "fail", "error": "账号和token不匹配" } });
            }
        });
    } catch (e) {
        res.json({ "code": 300, "data": { "status": "fail", "error": "参数错误" } });
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
            		res.json({ "code": 301, "data": { "status": "fail", "error": "参数错误" } });
            	} else {
            		cameraId = parseInt(cameraId);
            		conn.query("select taskStatus from task where cameraId=?",
            			[cameraId],function(err,data){
            				// console.log(data.length);
            				if(data.length<1){
            					ret = {};
			                    ret["status"] = "success";
			                    ret["data"] = {"taskStatus":0};
                                //Log.insertLog(mobile,req.url,"select taskStatus from task where cameraId=?");
			                    res.json({ "code": 200, "data": ret });
            				} else {
            					ret = {};
			                    ret["status"] = "success";
			                    ret["data"] = {"taskStatus":data[0].taskStatus};
                                //Log.insertLog(mobile,req.url,"select taskStatus from task where cameraId=?");
			                    res.json({ "code": 200, "data": ret });
            				}
            			});
            	}
            } else {
                res.json({ "code": 300, "data": { "status": "fail", "error": "账号和token不匹配" } });
            }
        });
    } catch (e) {
        res.json({ "code": 300, "data": { "status": "fail", "error": "参数错误" } });
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
        			res.json({ "code": 301, "data": { "status": "fail", "error": "参数错误" } });
            	} else {
            		taskId = parseInt(taskId);
            		conn.query("delete from task where Id=?",[taskId],
            			function(err,data){
                            Log.insertLog(mobile,"删除任务","delete from task where Id=?");
            				res.json({ "code": 200, "data": { "status": "success", "error": "success" } });	
            			});
            	}
            } else {
                res.json({ "code": 300, "data": { "status": "fail", "error": "账号和token不匹配" } });
            }
        });
    } catch (e) {
        res.json({ "code": 300, "data": { "status": "fail", "error": "参数错误" } });
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
        			res.json({ "code": 301, "data": { "status": "fail", "error": "参数错误" } });
            	} else {
            		taskId = parseInt(taskId);
            		conn.query("update task set taskStatus=1 where Id=?",[taskId],
            			function(err,data){
                            //Log.insertLog(mobile,req.url,"update task set taskStatus=1 where Id=?");
            				res.json({ "code": 200, "data": { "status": "success", "error": "success" } });	
            			});
            	}
            } else {
                res.json({ "code": 300, "data": { "status": "fail", "error": "账号和token不匹配" } });
            }
        });
    } catch (e) {
        res.json({ "code": 300, "data": { "status": "fail", "error": "参数错误" } });
    }
}

//反馈任务－有任务
function taskFeedBack(req,res){
    var query = req.body;
    try {
        var mobile = query.mobile;
        var token = query.token;
        checkMobile2Token_MOBILE(mobile, token, function(result) {
            if (result) {
                var taskId = query.taskId || -1;
                var content = query.content || -1;
                var cameraLon = query.cameraLon || -1;
                var cameraLa = query.cameraLa || -1;
                var cameraNo = query.cameraNo || -1;
                var cameraExtra = query.cameraExtra || -1;//摄像头的自定义属性
                var pics = query.pics || -1;
                if(taskId==-1 || content==-1 || cameraLon==-1 || cameraNo==-1
                    || cameraLa==-1 || pics==-1 ){
                    res.json({ "code": 301, "data": { "status": "fail", "error": "参数错误" } });
                } else {
                    try{
                        pics = JSON.parse(pics);    
                    } catch(e){
                        pics = pics;
                    }
                    if(pics.length<1){
                        res.json({ "code": 300, "data": { "status": "fail", "error": "图片不能为空" } });
                        return;
                    }
                    //检查任务Id是否存在
                    taskId = parseInt(taskId);
                    var sql = "select count(Id) as total from task where Id=?";
                    conn.query(sql,[taskId],function(err,data){
                        if(data[0].total==0){
                            res.json({ "code": 300, "data": { "status": "fail", "error": "任务不存在" } });
                        } else {
                            //更新任务状态为审核中
                            /*
                                taskStatus:
                                0:未接受
                                1:进行中
                                2:审核中
                                3:已完成
                                4:审核不通过
                            */
                            conn.query("update task set taskStatus=2 where Id=?",[taskId],
                                function(err,data){
                                    if(err){
                                        console.log(err);
                                        res.json({ "code": 300, "data": { "status": "fail", "error": "修改任务状态失败" } });
                                    } else {
                                        //插入反馈信息记录
                                        var addtime = new Date().getTime();
                                        sql = "insert into taskFeedBack(taskId,content,addtime,cameraLon,"+
                                                "cameraLa,camera_no,cameraExtra,pics)values(?,?,?,?,?,?,?,?)";
                                        conn.query(sql,[taskId,content,addtime,cameraLon,cameraLa,cameraNo,cameraExtra,pics.length],
                                            function(err,data){
                                                if(err){
                                                    res.json({ "code": 300, "data": { "status": "fail", "error": "任务反馈失败" } });
                                                } else {
                                                    //插入反馈的图片记录
                                                    var taskFeedBackId = data.insertId;
                                                    pics.forEach(function(url){
                                                          sql = "insert into taskFeedBackPics(taskFeedBackId, url, addtime) values (?, ?, ?)";
                                                          dataArr = [taskFeedBackId, url, addtime];
                                                          conn.query(sql, dataArr, function(err,rows){
                                                             if(err){
                                                                 res.json({"code": 501, "data":{"status":"fail","error":err.message}});
                                                             }
                                                         });
                                                      });
                                                }
                                            });
                                        Log.insertLog(mobile,"反馈任务－有任务",sql);
                                        res.json({ "code": 200, "data": { "status": "success", "error": "success" } }); 
                                    }
                                });
                        }
                    });
                }
            } else {
                res.json({ "code": 300, "data": { "status": "fail", "error": "账号和token不匹配" } });
            }
        });
    } catch (e) {
        res.json({ "code": 300, "data": { "status": "fail", "error": "参数错误" } });
    } 
}

//反馈任务－没有任务
function feedBackWithoutTask(req,res){
    var query = req.body;
    try {
        var mobile = query.mobile;
        var token = query.token;
        checkMobile2Token_MOBILE(mobile, token, function(result) {
            if (result) {
                var cameraName = query.cameraName || -1;
                var cameraLocation = query.cameraLocation || -1;
                var cameraLon = query.cameraLon || -1;
                var cameraLa = query.cameraLa || -1;
                var cameraType = query.cameraType || -1;
                var userId = query.userId || -1;
                var content = query.content || -1;
                var cameraNo = query.cameraNo || -1;
                var cameraExtra = query.cameraExtra || -1;
                var pics = query.pics || -1;
                
                if(cameraName==-1 || cameraLocation==-1 || cameraLon==-1 ||
                    cameraLa==-1 || cameraType==-1 || userId==-1 ||
                    content==-1 || cameraNo==-1 || 
                    pics==-1){
                    res.json({ "code": 301, "data": { "status": "fail", "error": "参数错误" } });
                } else {
                    try{
                        pics = JSON.parse(pics);    
                    } catch(e){
                        pics = pics;
                    }
                    if(pics.length<1){
                        res.json({ "code": 300, "data": { "status": "fail", "error": "图片不能为空" } });
                        return;
                    }
                    //插入一条状态为审核中的任务
                    var curtime = new Date().getTime();
                    sql = "insert into task(cameraName,cameraLocation," +
                            "taskDescription,userId,taskNO,taskStatus,"+
                            "cameraId,cameraLon,cameraLa,addtime,cameraType)"+
                            "values(?,?,?,?,?,?,?,?,?,?,?)";
                    conn.query(sql,
                            [cameraName, cameraLocation, "App端直接采集", 
                                userId, curtime, 2,-1,cameraLon,cameraLa,curtime,
                                parseInt(cameraType)],
                            function(err,data){
                                if(err){
                                    res.json({"code": 501, "data":{"status":"fail","error":err.message}});
                                } else {
                                    //res.json({ "code": 200, "data": { "status": "success", "error": "success" } });
                                    var taskId = data.insertId;
                                    //插入反馈信息记录
                                    var addtime = new Date().getTime();
                                    sql = "insert into taskFeedBack(taskId,content,addtime,cameraLon,"+
                                            "cameraLa,camera_no,cameraExtra,pics)values(?,?,?,?,?,?,?,?)";
                                    conn.query(sql,[taskId,content,addtime,cameraLon,cameraLa,cameraNo,cameraExtra,pics.length],
                                        function(err,data){
                                            if(err){
                                                res.json({ "code": 300, "data": { "status": "fail", "error": "反馈任务失败" } });
                                            } else {
                                                //插入反馈的图片记录
                                                var taskFeedBackId = data.insertId;
                                                pics.forEach(function(url){
                                                      sql = "insert into taskFeedBackPics(taskFeedBackId, url, addtime) values (?, ?, ?)";
                                                      dataArr = [taskFeedBackId, url, addtime];
                                                      conn.query(sql, dataArr, function(err,rows){
                                                         if(err){
                                                             res.json({"code": 501, "data":{"status":"fail","error":err.message}});
                                                         }
                                                     });
                                                  });
                                            }
                                        });
                                    Log.insertLog(mobile,"反馈任务－没有任务",sql);
                                    res.json({ "code": 200, "data": { "status": "success", "error": "success" } }); 
                                }
                            });
                }
            } else {
                res.json({ "code": 300, "data": { "status": "fail", "error": "账号和token不匹配" } });
            }
        });
    } catch (e) {
        res.json({ "code": 300, "data": { "status": "fail", "error": "参数错误" } });
    } 
}



//任务采集反馈编辑
//先删后插入
function taskFeedBackEdit(req,res){
    var query = req.body;
    try {
        var mobile = query.mobile;
        var token = query.token;
        checkMobile2Token_MOBILE(mobile, token, function(result) {
            if (result) {
                var taskId = query.taskId || -1;
                var taskFeedBackId = query.taskFeedBackId || -1;
                var content = query.content || -1;
                var cameraLon = query.cameraLon || -1;
                var cameraLa = query.cameraLa || -1;
                var cameraNo = query.cameraNo || -1;
                var cameraExtra = query.cameraExtra || -1;//摄像头的自定义属性
                var pics = query.pics || -1;
                if(taskId==-1 || content==-1 || cameraLon==-1 || cameraNo==-1
                    || cameraLa==-1 || pics==-1 ||
                     taskFeedBackId==-1){
                    res.json({ "code": 301, "data": { "status": "fail", "error": "参数错误" } });
                } else {
                    try{
                        pics = JSON.parse(pics);    
                    } catch(e){
                        pics = pics;
                    }
                    if(pics.length<1){
                        res.json({ "code": 300, "data": { "status": "fail", "error": "图片不能为空" } });
                        return;
                    }
                    //检查任务Id是否存在
                    taskId = parseInt(taskId);
                    taskFeedBackId = parseInt(taskFeedBackId);
                    var sql = "select count(Id) as total from task where Id=?";
                    conn.query(sql,[taskId],function(err,data){
                        if(data[0].total==0){
                            res.json({ "code": 300, "data": { "status": "fail", "error": "任务不存在" } });
                        } else {
                            //检查任务状态是否为审核已通过
                            conn.query("select taskStatus from task where Id=?",[taskId],
                                function(err,result){
                                    if(result && result.length){
                                        if(result[0].taskStatus!=3){
                                            //删除现有的反馈信息
                                            conn.query("delete from taskFeedBack where Id=?",
                                                [taskFeedBackId],function(err,result){
                                                    if(err){
                                                        res.json({ "code": 300, "data": { "status": "fail", "error": err.message } });
                                                    } else {
                                                        //更新任务状态为审核中
                                                        conn.query("update task set taskStatus=2 where Id=?",[taskId],
                                                                    function(err,data){
                                                                        if(err){
                                                                            console.log(err);
                                                                            res.json({ "code": 300, "data": { "status": "fail", "error": "更新任务状态失败" } });
                                                                        } else {
                                                                            //插入反馈信息记录
                                                                            var addtime = new Date().getTime();
                                                                            sql = "insert into taskFeedBack(taskId,content,addtime,cameraLon,"+
                                                                                    "cameraLa,camera_no,cameraExtra,pics)values(?,?,?,?,?,?,?,?)";
                                                                            conn.query(sql,[taskId,content,addtime,cameraLon,cameraLa,cameraNo,cameraExtra,pics.length],
                                                                                function(err,data){
                                                                                    if(err){
                                                                                        res.json({ "code": 300, "data": { "status": "fail", "error": "任务反馈失败" } });
                                                                                    } else {
                                                                                        //插入反馈的图片记录
                                                                                        var taskFeedBackId = data.insertId;
                                                                                        pics.forEach(function(url){
                                                                                              sql = "insert into taskFeedBackPics(taskFeedBackId, url, addtime) values (?, ?, ?)";
                                                                                              dataArr = [taskFeedBackId, url, addtime];
                                                                                              conn.query(sql, dataArr, function(err,rows){
                                                                                                 if(err){
                                                                                                     res.json({"code": 501, "data":{"status":"fail","error":err.message}});
                                                                                                 }
                                                                                             });
                                                                                          });
                                                                                    }
                                                                                });
                                                                            Log.insertLog(mobile,"修改任务采集反馈",sql);
                                                                            res.json({ "code": 200, "data": { "status": "success", "error": "success" } }); 
                                                                        }
                                                                    });
                                                    }
                                                });
                                        } else {
                                            res.json({ "code": 403, "data": { "status": "fail", "error": "审核通过,不可更改" } });
                                        }
                                    }
                                });
                        }
                    });
                }
            } else {
                res.json({ "code": 300, "data": { "status": "fail", "error": "账号和token不匹配" } });
            }
        });
    } catch (e) {
        res.json({ "code": 300, "data": { "status": "fail", "error": "参数错误" } });
    }    
}



//根据任务Id获取任务的详情及反馈信息,PC 
function getTaskById(req,res){
    var query = req.body;
    try {
        var mobile = query.mobile;
        var token = query.token;
        checkMobile2Token_PC(mobile, token, function(result) {
            if (result) {
                var taskId = query.taskId || -1;
                if(taskId==-1){
                    res.json({ "code": 301, "data": { "status": "fail", "error": "参数错误" } });
                } else {
                    taskId = parseInt(taskId);
                    var ret = {};
                    ret["status"] = "success";
                    //判断任务是否存在
                    var sql = "select count(Id) as total from task where Id=?";
                    conn.query(sql,taskId,function(err,data){
                        if(data[0].total){
                            //获取任务信息
                            conn.query("select a.*,b.name as userName from task a left join user b on a.userId=b.Id where a.Id=?",[taskId],
                                function(err,data){
                                    ret["taskData"] = data[0];
                                    //已经有反馈信息
                                    if(data[0].taskStatus>1){
                                        conn.query("select * from taskFeedBack where taskId=?",
                                            [taskId],
                                            function(err,data){
                                                //获取反馈的图片信息
                                                async.map(data,function(item,call){
                                                    var taskFeedBackId = item.Id;
                                                    conn.query("select * from taskFeedBackPics where taskFeedBackId=?",
                                                                [taskFeedBackId],function(err,row){
                                                                    item.taskFeedBackPics = row;
                                                                    call(null,item);
                                                                });
                                                },function(err,result){
                                                    ret["taskFeedBacks"] = result;
                                                    ret["code"] = 200;
                                                    //Log.insertLog(mobile,req.url,"getTaskById");
                                                    res.json(ret);
                                                });
                                            });
                                    } else {
                                        ret["taskFeedBack"] = Array();
                                        res.json({ "code": 200, "data": ret });
                                    }
                                });
                        } else {
                            res.json({ "code": 300, "data": { "status": "fail", "error": "任务不存在" } });
                        }
                    });
                }
            } else {
                res.json({ "code": 300, "data": { "status": "fail", "error": "账号和token不匹配" } });
            }
        });
    } catch (e) {
        res.json({ "code": 300, "data": { "status": "fail", "error": "参数错误" } });
    }
}

//根据任务Id获取任务的详情及反馈信息,APP
function getTaskByIdAPP(req,res){
    var query = req.body;
    try {
        var mobile = query.mobile;
        var token = query.token;
        checkMobile2Token_MOBILE(mobile, token, function(result) {
            if (result) {
                var taskId = query.taskId || -1;
                if(taskId==-1){
                    res.json({ "code": 301, "data": { "status": "fail", "error": "参数错误" } });
                } else {
                    taskId = parseInt(taskId);
                    var ret = {};
                    ret["status"] = "success";
                    //判断任务是否存在
                    var sql = "select count(Id) as total from task where Id=?";
                    conn.query(sql,taskId,function(err,data){
                        if(data[0].total){
                            //获取任务信息
                            conn.query("select * from task where Id=?",[taskId],
                                function(err,data){
                                    ret["taskData"] = data[0];
                                    //已经有反馈信息
                                    if(data[0].taskStatus>1){
                                        conn.query("select * from taskFeedBack where taskId=?",
                                            [taskId],
                                            function(err,data){
                                                //获取反馈的图片信息
                                                ret["taskFeedBack"] = data[0];
                                                async.map(data,function(item,call){
                                                    var taskFeedBackId = item.Id;
                                                    conn.query("select * from taskFeedBackPics where taskFeedBackId=?",
                                                                [taskFeedBackId],function(err,row){
                                                                    item.taskFeedBackPics = row;
                                                                    call(null,item);
                                                                });
                                                },function(err,result){
                                                    ret["taskFeedBacks"] = result;
                                                    ret["code"] = 200;
                                                    //Log.insertLog(mobile,req.url,"getTaskByIdAPP");
                                                    res.json(ret);
                                                });
                                            });
                                    } else {
                                        ret["taskFeedBack"] = Array();
                                        res.json({ "code": 200, "data": ret });
                                    }
                                });
                        } else {
                            res.json({ "code": 300, "data": { "status": "fail", "error": "任务不存在" } });
                        }
                    });
                }
            } else {
                res.json({ "code": 300, "data": { "status": "fail", "error": "账号和token不匹配" } });
            }
        });
    } catch (e) {
        res.json({ "code": 300, "data": { "status": "fail", "error": "参数错误" } });
    }
}

exports.publishTask = publishTask;
exports.publishTaskWithoutCamera = publishTaskWithoutCamera;
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
exports.taskFeedBack = taskFeedBack;
exports.getTaskPC = getTaskPC;
exports.getTaskById = getTaskById;
exports.getTaskByIdAPP = getTaskByIdAPP;
exports.taskFeedBackEdit = taskFeedBackEdit;
exports.feedBackWithoutTask = feedBackWithoutTask;



