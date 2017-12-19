var db = require("../lib/db");
var User = require("./userController");
var Log = require('./logController')

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
                	errMessage(res,302,"参数错误");
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
                                                                Log.insertLog(mobile,"添加一级部门","insert into department1(name)values(?)");
                												sucMessage(res);
                											}
                										});
                						}
                					}
                				});
                }
            } else {
                errMessage(res,301,"用户未登录");
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
                	errMessage(res,403,"参数错误");
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
                                            db.query("select count(Id) as total from department2 where name=?",[name],function(err,result){
                                                if(err){
                                                    errMessage(res,303,err.message);
                                                }else if(result[0].total>0){
                                                    res.json({"code":300,"err":"二级部门已存在"});
                                                }else{
                                                    //写入数据库
                                                    db.query("insert into department2(p_id,name)values(?,?)",
                                                        [parseInt(parentId),name],
                                                        function(err,data){
                                                            if(err){
                                                                errMessage(res,303,err.message);
                                                            } else {
                                                                Log.insertLog(mobile,"添加二级部门","insert into department2(p_id,name)values(?)");
                                                                sucMessage(res);
                                                            }
                                                        });
                                                }
                                            });
                							//写入数据库
                							// db.query("insert into department2(p_id,name)values(?,?)",
                							// 			[parseInt(parentId),name],
                							// 			function(err,data){
                							// 				if(err){
                							// 					errMessage(res,303,err.message);
                							// 				} else {
                                             //                    Log.insertLog(mobile,req.url,"insert into department2(p_id,name)values(?)");
                							// 					sucMessage(res);
                							// 				}
                							// 			});
                						}
                					}
                				});
                }
            } else {
                errMessage(res,301,"用户未登录");
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
                                        //Log.insertLog(mobile,req.url,"select * from department1");
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
                errMessage(res,301,"用户未登录");
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
            		errMessage(res,300,"参数错误");
            	} else {
            		db.query("select * from department2 where p_id=?",[parentId],
                			function(err,data){
                				if(err){
                						errMessage(res,303,err.message);
                					} else {
                                        //Log.insertLog(mobile,req.url,"select * from department2 where p_id=?");
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
                errMessage(res,301,"用户未登录");
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
                	errMessage(res,300,"参数错误");
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
                                                                Log.insertLog(mobile,"修改一级部门","update department1 set name=? where Id=?");
																sucMessage(res);
															}
						                				});
                						}
                					}
                				});
                }
            } else {
                errMessage(res,301,"用户未登录");
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
                	errMessage(res,300,"参数错误");
                } else {
                	//更新数据库 
                	db.query("update department2 set name=? where Id=?",
                				[name,Id],
                				function(err,data){
                					if(err){
										errMessage(res,303,err.message);
									} else {
                                        Log.insertLog(mobile,"修改二级部门","update department2 set name=? where Id=?");
										sucMessage(res);
									}
                				});
                }
            } else {
                errMessage(res,301,"用户未登录");
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
                	errMessage(res,300,"参数错误");
                } else {
                	//更新数据库
                	db.query("update user set company=? where Id= ?",
                				[targetDepartmentId,targetUserId],
                				function(err,data){
                					if(err){
                						errMessage(res,404,err.message);
                					} else {
                                        Log.insertLog(mobile,"修改用户所在部门","update user set company=? where Id=?");
                						sucMessage(res);
                					}
                				});
                }
            } else {
                errMessage(res,301,"用户未登录");
                return;
            }
        });
    } catch (e) {
        errMessage(res,500,e.message);
    }
}
/**************************************************忧伤的分割线**************************************************/
//删除二级部门
function del2(req,res){
    var query = req.body;
    try {
        var mobile = query.mobile;
        var token = query.token;
        User.getUserInfo(mobile, token, function(user) {
            if (user.error == 0) {
                var id = query.id;
                var sql = "select count(company) as num from user where company = ?";
                var params = [id];
                db.query(sql,params,function(err,result){
                    if (err) {
                        console.log(err.message);
                        return;
                    } else if(result[0].num > 0){
                        errMessage(res,301,"该部门下有员工，请勿删除");
                        return;
                    }else{
                        var sql = "delete from department2 where id = ?";
                        db.query(sql,params,function(err,result){
                            if (err) {
                                console.log(err.message);
                            } else {
                                Log.insertLog(mobile,"删除二级部门","delete from department2 where id = ?");
                                sucMessage(res);
                            }
                        });
                    }
                });
            } else {
                errMessage(res,301,"用户未登录");
                return;
            }
        });
    } catch (e) {
        errMessage(res,500,e.message);
    }
}

//删除一级部门
function del1(req,res){
    var query = req.body;
    try {
        var mobile = query.mobile;
        var token = query.token;
        User.getUserInfo(mobile, token, function(user) {
            if (user.error == 0) {
                //
                var id = query.id;
                var sql = "select count(p_id) as num from department2 where p_id = ?";
                var params = [id];
                db.query(sql,params,function(err,result){
                    if (err) {
                        console.log(err.message);
                        return;
                    } else if(result[0].num > 0){
                        errMessage(res,301,"该部门下有子部门，请勿删除");
                        return;
                    }else{
                        var sql = "delete from department1 where id = ?";
                        db.query(sql,params,function(err,result){
                            if (err) {
                                console.log(err.message);
                            } else {
                                Log.insertLog(mobile,"删除一级部门","delete from department1 where id = ?");
                                sucMessage(res);
                            }
                        });
                    }
                });
            } else {
                errMessage(res,301,"用户未登录");
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
                errMessage(res,301,"用户未登录");
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
exports.del1 = del1;
exports.del2 = del2;

