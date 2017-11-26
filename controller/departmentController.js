var db = require("../lib/db");
var User = require("./userController");

//添加一级部门
function add1(req,res){
    var query = req.body;
    try {
        var mobile = query.mobile;
        var token = query.token;
        User.getUserInfo(mobile, token, function(user) {
            if (user.error == 0) {
                var name = query.name || -1;
                if(name==-1){
                	errMessage(res,302,"param name error");	
                } else {
                	//检查部门名字是否已经存在
                	db.query("select count(Id) as total from department1 where name=?",
                				[name],
                				function(err,data){
                					if(err){
                						errMessage(res,303,err.message);
                					} else {
                						if(data[0].total>0){
                							errMessage(res,403,"该一级部门已存在");
                						} else {
                							//写入数据库
                							db.query("insert into department1(name)values(?)",[name],
                										function(err,data){
                											if(err){
                												errMessage(res,303,err.message);
                											} else {
                												sucMessage(res);
                											}
                										});
                						}
                					}
                				});
                }
            } else {
                errMessage(res,301,"user not login");
                return;
            }
        });
    } catch (e) {
        errMessage(res,500,e.message);
    }
}

//添加2级部门
function add2(req,res){
    var query = req.body;
    try {
        var mobile = query.mobile;
        var token = query.token;
        User.getUserInfo(mobile, token, function(user) {
            if (user.error == 0) {
                var name = query.name || -1;
                var parentId = query.parentId || -1;
                if(name==-1 || parentId==-1){
                	errMessage(res,403,"param error");
                } else {
                	//判断parentId是否存在
                	db.query("select count(Id) as total from department1 where Id=?",
                				[parentId],
                				function(err,data){
                					if(err){
                						errMessage(res,303,err.message);
                					} else {
                						if(data[0].total==0){
                							errMessage(res,404,"一级部门不存在");
                						} else {
                							//写入数据库
                							db.query("insert into department2(p_id,name)values(?,?)",
                										[parseInt(parentId),name],
                										function(err,data){
                											if(err){
                												errMessage(res,303,err.message);
                											} else {
                												sucMessage(res);
                											}
                										});
                						}
                					}
                				});
                }
            } else {
                errMessage(res,301,"user not login");
                return;
            }
        });
    } catch (e) {
        errMessage(res,500,e.message);
    }
}

//获取一级部门
function list1(req,res){
    var query = req.body;
    try {
        var mobile = query.mobile;
        var token = query.token;
        User.getUserInfo(mobile, token, function(user) {
            if (user.error == 0) {
                db.query("select * from department1",[],
                			function(err,data){
                				if(err){
                						errMessage(res,303,err.message);
                					} else {
                						res.json({
                							"code": 200,
                							"data": {
                								"status": "success",
                								"data": data
                							}
                						});
                					}
                			});
            } else {
                errMessage(res,301,"user not login");
                return;
            }
        });
    } catch (e) {
        errMessage(res,500,e.message);
    }
}

//获取二级部门
function list2(req,res){
    var query = req.body;
    try {
        var mobile = query.mobile;
        var token = query.token;
        User.getUserInfo(mobile, token, function(user) {
            if (user.error == 0) {
            	var parentId = query.parentId || -1;
            	if(parentId==-1){
            		errMessage(res,300,"param error");
            	} else {
            		db.query("select * from department2 where p_id=?",[parentId],
                			function(err,data){
                				if(err){
                						errMessage(res,303,err.message);
                					} else {
                						res.json({
                							"code": 200,
                							"data": {
                								"status": "success",
                								"data": data
                							}
                						});
                					}
                			});
            	}
            } else {
                errMessage(res,301,"user not login");
                return;
            }
        });
    } catch (e) {
        errMessage(res,500,e.message);
    }
}

//更改一级部门名字
function edit1(req,res){
    var query = req.body;
    try {
        var mobile = query.mobile;
        var token = query.token;
        User.getUserInfo(mobile, token, function(user) {
            if (user.error == 0) {
                var name = query.name || -1;
                var Id = query.Id || -1;
                if(name==-1 || Id==-1){
                	errMessage(res,300,"param error");
                } else {
                	//查询新名字是否已经存在
                	db.query("select count(Id) as total from department1 where name=?",
                				[name],
                				function(err,data){
                					if(err){
                						errMessage(res,303,err.message);
                					} else {
                						if(data[0].total>0){
                							errMessage(res,403,"该一级部门已存在");
                						} else {
                							//更新数据库 
						                	db.query("update department1 set name=? where Id=?",
						                				[name,Id],
						                				function(err,data){
						                					if(err){
																errMessage(res,303,err.message);
															} else {
																sucMessage(res);
															}
						                				});
                						}
                					}
                				});
                }
            } else {
                errMessage(res,301,"user not login");
                return;
            }
        });
    } catch (e) {
        errMessage(res,500,e.message);
    }
}

//更改二级部门名字
function edit2(req,res){
    var query = req.body;
    try {
        var mobile = query.mobile;
        var token = query.token;
        User.getUserInfo(mobile, token, function(user) {
            if (user.error == 0) {
                var name = query.name || -1;
                var Id = query.Id || -1;
                if(name==-1 || Id==-1){
                	errMessage(res,300,"param error");
                } else {
                	//更新数据库 
                	db.query("update department2 set name=? where Id=?",
                				[name,Id],
                				function(err,data){
                					if(err){
										errMessage(res,303,err.message);
									} else {
										sucMessage(res);
									}
                				});
                }
            } else {
                errMessage(res,301,"user not login");
                return;
            }
        });
    } catch (e) {
        errMessage(res,500,e.message);
    }
}

//更改用户的部门
function updateDepartment(req,res){
    var query = req.body;
    try {
        var mobile = query.mobile;
        var token = query.token;
        User.getUserInfo(mobile, token, function(user) {
            if (user.error == 0) {
                var targetUserId = query.targetUserId || -1;
                var targetDepartmentId = query.targetDepartmentId || -1;
                if(targetUserId==-1 || targetDepartmentId==-1){
                	errMessage(res,300,"param error");
                } else {
                	//更新数据库
                	db.query("update user set company=? where Id=?",
                				[targetDepartmentId,targetUserId],
                				function(err,data){
                					if(err){
                						errMessage(res,404,err.message);
                					} else {
                						sucMessage(res);
                					}
                				});
                }
            } else {
                errMessage(res,301,"user not login");
                return;
            }
        });
    } catch (e) {
        errMessage(res,500,e.message);
    }
}


//公用错误输出函数
function errMessage(res,code,msg){
    res.json({
        "code": code,
        "data": {
            "status": "fail",
            "error": msg
        }
    });
}

//公用成功输出函数
function sucMessage(res){
    res.json({
        "code": 200,
        "data": {
            "status": "success",
            "error": "success"
        }
    });
}

//函数模板
function funcName(req,res){
    var query = req.body;
    try {
        var mobile = query.mobile;
        var token = query.token;
        User.getUserInfo(mobile, token, function(user) {
            if (user.error == 0) {
                //
            } else {
                errMessage(res,301,"user not login");
                return;
            }
        });
    } catch (e) {
        errMessage(res,500,e.message);
    }
}


exports.add1 = add1;
exports.add2 = add2;
exports.list1 = list1;
exports.list2 = list2;
exports.edit1 = edit1;
exports.edit2 = edit2;
exports.updateDepartment = updateDepartment;

