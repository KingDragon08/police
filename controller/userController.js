// var DB_CONFIG = require("../config/dbconfig");
// var mysql = require('mysql');
var crypto = require('crypto');
var Sync = require('sync');
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


//注册新账号
function register(req, res) {
    var query = req.body;
    try {
        var name = query.name || "UNKNOWN";
        var password = crypto.createHash("md5").update(query.password).digest('hex');
        var plainPassword = query.password;
        var sex = query.sex || "M";
        var NO = query.NO || "000000";
        var mobile = query.mobile || "00000000000";
        var company = query.company || "0";
        var role = query.role || -1;
        var createTime = new Date().getTime();
        if (sex != 'F' && sex != 'M') {
            res.json({ "code": 300, "data": { "status": "fail", "error": "性别必须为F或M" } });
            return;
        } else {
            if(role==-1) {
                res.json({ "code": 301, "data": { "status": "fail", "error": "角色不能为空" } });
                return;
            }
            //查看是否已经注册
            conn.query("select count(Id) as total from user where mobile=?", [mobile],
                function(err, result) {
                    console.log(err);
                    console.log(result);
                    if (result[0].total > 0) {
                        res.json({ "code": 300, "data": { "status": "fail", "error": "账号已被注册" } });
                    } else {
                        conn.query("insert into user(name,password,plainPassword," +
                            "sex,company,NO,mobile,createTime,lastLoginTime,status,role)" +
                            "values(?,?,?,?,?,?,?,?,?,?,?)", [name, password, plainPassword, sex, company, NO, mobile,
                                createTime, 0, 0, parseInt(role)
                            ],
                            function(err, result) {
                                if (err) {
                                    console.log("[REGISTER ERROR] - ", err.message);
                                    res.json({ "code": 300, "data": { "status": "fail", "err": err.message } });
                                    return;
                                } else {
                                    console.log('[REGIST SUCCESS]');
                                    //Log.insertLog(mobile,"注册账号","register");
                                    res.json({ "code": 200, "data": { "status": "success", "error": "success" } });
                                }
                            });
                    }
                });

        }
    } catch (e) {
        console.log(e);
        res.json({ "code": 300, "data": { "status": "fail", "error": "未知错误" } });
    }
}

//登录
function login(req, res) {
    var query = req.body;
    try {
        var mobile = query.mobile || "";
        var password = query.password || "";
        var IP = query.IP || "0.0.0.0";
        if (mobile.length != 11) {
            res.json({ "code": 300, "data": { "status": "fail", "error": "账号错误" } });
        } else {
            password = crypto.createHash("md5").update(password).digest('hex');
            conn.query("select count(Id) as total from user where mobile=? and " +
                "password=? and status=?", [mobile, password, 1],
                function(err, result) {
                    if (result[0].total == 1) {
                        //更新操作
                        var timestamp = new Date().getTime();
                        var token = mobile + "_" + timestamp;
                        token = crypto.createHash("md5").update(token).digest('hex');
                        conn.query("select a.Id,a.name,a.sex,a.NO,a.mobile,a.lastLoginTime,a.lastLoginIP,b.role_name,c.name as company from user a left join role b on a.role_id=b.role_id left join department2 c on a.company=c.Id " +
                            "where a.mobile=? and a.password=? and a.status=?", [mobile, password, 1],
                            function(err, result) {
                                result[0]["token"] = token;
                                result[0]["status"] = "success";
                                Log.insertLog(mobile,"用户登录","login");
                                res.json({ "code": 200, "data": result[0] });
                                //更新数据库
                                conn.query("update user set token=?,lastLoginTime=?," +
                                    "lastLoginIP=? where Id=?", [token, timestamp, IP, result[0]["Id"]],
                                    function(err, result) {
                                        console.log("login and update success");
                                    });
                            });
                    } else {
                        res.json({ "code": 300, "data": { "status": "fail", "error": "账号和密码不匹配" } });
                    }
                });
        }
    } catch (e) {
        console.log(e);
        res.json({ "code": 300, "data": { "status": "fail", "error": "未知错误" } });
    }

}

//使用token登录
function loginWithToken(req, res) {
    var query = req.body;
    try {
        var mobile = query.mobile;
        var token = query.token;
        var IP = query.IP || "0.0.0.0";
        checkMobile2Token(mobile, token, function(result) {
            if (result) {
                //更新操作
                var timestamp = new Date().getTime();
                var token = mobile + "_" + timestamp;
                token = crypto.createHash("md5").update(token).digest('hex');
                conn.query("select a.Id,a.name,a.sex,a.NO,a.mobile,a.lastLoginTime,a.lastLoginIP,b.role_name,c.name as company from user a left join role b on a.role_id=b.role_id left join department2 c on a.company=c.Id " +
                    "where a.mobile=? and a.status=?", [mobile, 1],
                    function(err, result) {
                        result[0]["token"] = token;
                        result[0]["status"] = "success";
                        //Log.insertLog(mobile,"token登录","loginWithToken");
                        res.json({ "code": 200, "data": result[0] });
                        //更新数据库
                        conn.query("update user set token=?,lastLoginTime=?," +
                            "lastLoginIP=? where Id=?", [token, timestamp, IP, result[0]["Id"]],
                            function(err, result) {
                                console.log("loginWithToken and update success");
                            });
                    });
            } else {
                res.json({ "code": 300, "data": { "status": "fail", "error": "账号和token不匹配" } });
            }
        })
    } catch (e) {
        res.json({ "code": 300, "data": { "status": "fail", "error": "未知错误" } });
    }
}

//退出登录
function logout(req, res) {
    var query = req.body;
    try {
        var mobile = query.mobile;
        var token = query.token;
        // checkMobile2Token(mobile, token, function(result) {
        //     if (result) {
                //更新token
                conn.query("update user set token=?,lastLoginTime=? where mobile=?", ["KingDragon",0, mobile],
                    function(err, re) {
                        Log.insertLog(mobile,"退出登录","logout");
                        res.json({ "code": 200, "data": { "status": "success", "error": "退出登录成功" } });
                    });
        //    }else {
        //         res.json({ "code": 300, "data": { "status": "fail", "error": "账号和token不匹配" } });
        //     }
        // });
    } catch (e) {
        res.json({ "code": 300, "data": { "status": "fail", "error": "未知错误" } });
    }
}

//分页获取用户信息
//@param type=>用户的类型，1：审核通过的正常用户，0:待审核的用户
function getUsers(req, res) {
    var query = req.body;
    try {
        var page = query.page || 1;
        var mobile = query.mobile;
        var token = query.token;
        var pageSize = query.pageSize || 20;
        var type = query.type || 1;//获取的类型
        checkMobile2Token(mobile, token, function(result) {
            if (result) {
                var sqls="select count(id) as total from user";
                conn.query(sqls,null,function (err,datas) {
                    if(err){
                        res.json({ "code": 300, "data": { "status": "fail", "error": "用户表查询失败" } });
                    }else{
                        if (page < 1) {
                            page = 1;
                        }
                        var start = (page - 1) * pageSize;
                        pageSize = parseInt(pageSize);
                        conn.query("select a.Id,a.name,a.sex,a.NO,a.mobile,a.lastLoginTime,a.lastLoginIP,b.role_name,c.name as company from user a left join role b on a.role_id=b.role_id left join department2 c on a.company=c.Id " +
                            "where a.status=? order by a.Id asc limit ?,?", [parseInt(type), start, pageSize],
                            function(err, data) {
                                ret = {};
                                ret["status"] = "success";
                                ret["data"] = data;
                                ret["total"]=datas[0].total;
                                //Log.insertLog(mobile,req.url,"getUsers");
                                res.json({ "code": 200, "data": ret });
                            });
                    }
                })

            } else {
                res.json({ "code": 300, "data": { "status": "fail", "error": "账号和token不匹配" } });
            }
        });
    } catch (e) {
        res.json({ "code": 300, "data": { "status": "fail", "error": "未知错误" } });
    }
}

//获取单个用户信息
function getSingleUserInfo(req, res) {
    var query = req.body;
    try {
        var mobile = query.mobile;
        var token = query.token;
        var Id = query.Id || 0;
        if (Id == 0) {
            res.json({ "code": 300, "data": { "status": "fail", "error": "参数错误" } });
        } else {
            checkMobile2Token(mobile, token, function(result) {
                if (result) {
                    conn.query("select a.Id,a.name,a.sex,a.NO,a.mobile,a.lastLoginTime,a.lastLoginIP,b.role_name,c.name as company from user a left join role b on a.role_id=b.role_id left join department2 c on a.company=c.Id " +
                        "where Id=?", [Id],
                        function(err, data) {
                            ret = {};
                            ret["status"] = "success";
                            ret["data"] = data;
                            //Log.insertLog(mobile,req.url,"getSingleUserInfo");
                            res.json({ "code": 200, "data": ret });
                        });
                } else {
                    res.json({ "code": 300, "data": { "status": "fail", "error": "账号和token不匹配" } });
                }
            });
        }
    } catch (e) {
        res.json({ "code": 300, "data": { "status": "fail", "error": "未知错误" } });
    }
}

//根据手机号查询单个用户信息
function getSingleUserInfoByMobile(req, res) {
    var query = req.body;
    try {
        var mobile = query.mobile;
        var token = query.token;
        var targetMobile = query.targetMobile || 0;
        if (targetMobile == 0) {
            res.json({ "code": 300, "data": { "status": "fail", "error": "参数错误" } });
        } else {
            checkMobile2Token(mobile, token, function(result) {
                if (result) {
                    conn.query("select a.Id,a.name,a.sex,a.NO,a.mobile,a.lastLoginTime,a.lastLoginIP,b.role_name,c.name as company from user a left join role b on a.role_id=b.role_id left join department2 c on a.company=c.Id " +
                        "where mobile=?", [targetMobile],
                        function(err, data) {
                            ret = {};
                            ret["status"] = "success";
                            ret["data"] = data;
                            //Log.insertLog(mobile,req.url,"getSingleUserInfoByMobile");
                            res.json({ "code": 200, "data": ret });
                        });
                } else {
                    res.json({ "code": 301, "data": { "status": "fail", "error": "您的账号已在别处登录，您被迫下线，请重新登录！" } });
                }
            });
        }
    } catch (e) {
        res.json({ "code": 300, "data": { "status": "fail", "error": "未知错误" } });
    }
}

//根据用户名模糊查询用户信息
function getUsersByKeyword(req, res) {
    var query = req.body;
    try {
        var mobile = query.mobile;
        var token = query.token;
        var keyword = query.keyword;
        checkMobile2Token(mobile, token, function(result) {
            if (result) {
                conn.query("select a.Id,a.name,a.sex,a.NO,a.mobile,a.lastLoginTime,a.lastLoginIP,b.role_name,c.name as company from user a left join role b on a.role_id=b.role_id left join department2 c on a.company=c.Id " +
                    "where name like " +
                    conn.escape('%' + keyword + '%') +
                    " order by Id desc", [keyword],
                    function(err, data) {
                        ret = {};
                        ret["status"] = "success";
                        ret["data"] = data;
                        //Log.insertLog(mobile,req.url,"getUsersByKeyword");
                        res.json({ "code": 200, "data": ret });
                    });
            } else {
                res.json({ "code": 300, "data": { "status": "fail", "error": "账号和token不匹配" } });
            }
        });
    } catch (e) {
        res.json({ "code": 300, "data": { "status": "fail", "error": "未知错误" } });
    }
}

/**************************************************忧伤的分割线**************************************************/
//添加app用户
function addMobileUser(req, res) {
    var query = req.body;
    try {
    	var userMobile = query.userMobile;
    	var token = query.token;
    	checkMobile2Token(userMobile,token,function(result){
    		if(result){
    			var name = query.name || "UNKNOWN";
		        var password = query.password || -1;
		        password = crypto.createHash("md5").update(query.password).digest('hex');
		        var plainPassword = query.password;
		        var sex = query.sex || "M";
		        var NO = query.NO || "000000";
                var mobile = query.mobile || "00000000000";
		        var company = query.company || "west";
		        var createTime = new Date().getTime();
                var myreg=/^[1][3,4,5,7,8][0-9]{9}$/;
		        var avatar = query.avatar || "http://via.placeholder.com/2000x200?text=avatar";
                if (sex != 'F' && sex != 'M') {
		            res.json({ "code": 300, "data": { "status": "fail", "error": "姓名必须是F或M" } });
		            return;
		        }else if(!myreg.test(mobile)){
                    res.json({ "code": 300, "data": { "status": "fail", "error": "账号错误" } });
                    return;
                } else {
		            //查看是否已经注册
		            conn.query("select count(Id) as total from mobileUser where mobile=?", 
		            	[mobile],
		                function(err, result) {
		                    if (result[0].total > 0) {
		                        res.json({ "code": 300, "data": { "status": "fail", "error": "账号已注册" } });
		                    } else {
		                        conn.query("insert into mobileUser(name,password,plainPassword," +
		                            "sex,company,NO,mobile,createTime,lastLoginTime,status,avatar)" +
		                            "values(?,?,?,?,?,?,?,?,?,?,?)", 
		                            [name, password, plainPassword, sex, 
		                            	company, NO, mobile, createTime, createTime, 1, avatar
		                            ],
		                            function(err, result) {
		                                if (err) {
		                                    //console.log(err);
		                                    res.json({ "code": 300, "data": { "status": "fail", "err": err}});
		                                    return;
		                                } else {
                                            Log.insertLog(mobile,"添加App用户","addMobileUser");
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
        res.json({ "code": 300, "data": { "status": "fail", "error": "未知错误" } });
    }
}

//修改app用户
function editMobileUser(req, res) {
    var query = req.body;
    try {
    	var userMobile = query.userMobile;
    	var token = query.token;
    	checkMobile2Token(userMobile,token,function(result){
    		if(result){
				var id = query.Id;
    			var name = query.name || "UNKNOWN";
		        var sex = query.sex || "M";
		        var NO = query.NO || "000000";
		        var mobile = query.mobile || "00000000000";
		        var company = query.company || "west";
		        var createTime = new Date().getTime();
		        var avatar = query.avatar || "http://via.placeholder.com/2000x200?text=avatar";
		        if (sex != 'F' && sex != 'M') {
		            res.json({ "code": 300, "data": { "status": "fail", "error": "性别必须为F或M" } });
		            return;
		        } else {
                    //判断手机号码是否重复
                    conn.query("select count(Id) as total from mobileUser where mobile=? and Id not in (?)",
                                [mobile,id],
                                function(err,data){
                                    if(data[0].total > 0){
                                        res.json({ "code": 300, "data": { "status": "fail", "err": "手机号已存在！"}});
                                    } else {
                                        conn.query("update mobileUser set name=?," +
                                            "sex=?,company=?,NO=?,mobile=?,createTime=?,lastLoginTime=?,status=?,avatar=?" +
                                            "where id = ?",
                                            [name, sex,company, NO, mobile, createTime, createTime, 1, avatar,id],
                                            function(err, result) {
                                                if (err) {
                                                    //console.log(err);
                                                    res.json({ "code": 300, "data": { "status": "fail", "err": err}});
                                                    return;
                                                } else {
                                                    Log.insertLog(mobile,"修改App用户","addMobileUser");
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
        res.json({ "code": 300, "data": { "status": "fail", "error": "未知错误" } });
    }
}
/**************************************************忧伤的分割线**************************************************/

//添加PC用户
function addPCUser(req, res) {
    var query = req.body;
    try {
    	var mobile = query.mobile;
    	var token = query.token;
    	checkMobile2Token(mobile,token,function(result){
    		if(result){
    			var name = query.name || "UNKNOWN";
		        var password = crypto.createHash("md5").update(query.password).digest('hex');
		        var plainPassword = query.password;
		        var sex = query.sex || "M";
		        var NO = query.NO || "000000";
                var mobilenew = query.mobilenew || "00000000000";
                var company = query.company || "west";
                var role_id=query.role_id||"-1";
                var createTime = 0;
                var myreg=/^[1][3,4,5,7,8][0-9]{9}$/;
		       // var avatar = query.avatar || "http://via.placeholder.com/2000x200?text=avatar";
                if (sex != 'F' && sex != 'M') {
		            res.json({ "code": 300, "data": { "status": "fail", "error": "性别必须为F或M" } });
		            return;
		        } else if(!myreg.test(mobilenew)){
                    res.json({ "code": 300, "data": { "status": "fail", "error": "手机号格式错误" } });
                    return;
                } else {
		            //查看是否已经注册
		            conn.query("select count(Id) as total from user where mobile=?",
		            	[mobilenew],
		                function(err, result) {
		                    if (result[0].total > 0) {
		                        res.json({ "code": 300, "data": { "status": "fail", "error": "账号已被注册！" } });
		                    } else {
		                        conn.query("insert into user(name,password,plainPassword," +
		                            "sex,company,NO,mobile,role_id,createTime,lastLoginTime,status)" +
		                            "values(?,?,?,?,?,?,?,?,?,?,?)", 
		                            [name, password, plainPassword, sex, 
		                            	company, NO, mobilenew, role_id,createTime, createTime, 1
		                            ],
		                            function(err, result) {
		                                if (err) {
		                                    //console.log(err);
		                                    res.json({ "code": 300, "data": { "status": "fail", "err": err}});
		                                    return;
		                                } else {
                                            Log.insertLog(mobile,"添加PC用户","addPcUser");
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
        res.json({ "code": 300, "data": { "status": "fail", "error": "未知错误" } });
    }
}

//修改PC用户
function editPCUser(req, res) {
    var query = req.body;
	//console.log(query);
    try {
    	var mobile = query.mobile;
    	var token = query.token;
    	checkMobile2Token(mobile,token,function(result){
    		if(result){
    			var Id=query.Id;
    			var name = query.name || "UNKNOWN";
		        var sex = query.sex || "M";
		        var NO = query.NO || "000000";
		        var mobilenew = query.mobilenew || "00000000000";
		        var company = query.company || "west";
		        var role_id=query.role_id||"-1";
				console.log("********")
		        if (name=="UNKNOWN"||(sex!="M"&&sex!="F")||NO=="000000"||mobilenew=="00000000000"||company=="west"||role_id=="-1") {
		            res.json({ "code": 300, "data": { "status": "fail", "error": "参数错误" } });
		            return;
		        } else {
                    var sqls ="select * from user where mobile=? and id not in (?)";
                    var dataarr=[mobilenew,Id];
                    conn.query(sqls,dataarr,function (err,result) {
                        if(err){
                            res.json({ "code": 300, "data": { "status": "fail", "err": "查询数据库失败"}});
                            return;
                        }else if(result.length){
                            res.json({ "code": 300, "data": { "status": "fail", "err": "手机号已存在！"}});
                            return;
                        }else{
                            //进行修改  把所对应的字段传过来
                            var sql="update user set name=?,sex=?,NO=?,mobile=?,company=?,role_id=? where Id=?";
                            var params=[name,sex,NO,mobilenew,company,role_id,Id];
                            conn.query(sql,params,function(err,data){
                                if (err) {
                                    //console.log(err);
                                    res.json({ "code": 300, "data": { "status": "fail", "err": err}});
                                    return;
                                } else {
                                    Log.insertLog(mobile,"修改PC用户","editPcUser");
                                    res.json({ "code": 200, "data": { "status": "success", "error": "success" } });
                                }
                            });
                        }
                    });
		              }
    		} 
    	});
    } catch (e) {
        res.json({ "code": 500, "data": { "status": "fail", "error": "未知错误" } });
    }
}


//删除app用户
function delMobileUser(req,res){
	var query = req.body;
	try{
		var mobile = query.mobile;
		var token = query.token;
		checkMobile2Token(mobile,token,function(result){
			if(result){
				var Id = parseInt(query.Id);
				var type = parseInt(query.type);
				if(type==1){
					conn.query("delete from mobileUser where Id="+Id,
								function(err,result){
									if(err){
										//console.log(err);
										res.json({ "code": 300, "data": { "status": "fail", "error": "未知错误" } });
									} else {
                                        Log.insertLog(mobile,"删除App用户","delMobileUser");
									    res.json({ "code": 200, "data": { "status": "success", "error": "success" } });
									}
								});
				} else {
					conn.query("update mobileUser set status=? where Id=?",
								[0,Id],
								function(err,result){
									if(err){
										console.log(err);
										res.json({ "code": 301, "data": { "status": "fail", "error": "未知错误" } });
									} else {
                                        Log.insertLog(mobile,"删除App用户","delMobileUser");
										res.json({ "code": 200, "data": { "status": "success", "error": "success" } });	
									}
								});
				}
			} else {
				res.json({ "code": 300, "data": { "status": "fail", "error": "账号和token不匹配" } });
			}
		});
	} catch(e) {
		res.json({ "code": 300, "data": { "status": "fail", "error": "未知错误" } });
	}
}

//分页获取app用户
function getMobileUsers(req,res){
	var query = req.body;
    try {
        var page = query.page || 1;
        var mobile = query.mobile;
        var token = query.token;
        var pageSize = query.pageSize || 20;
        checkMobile2Token(mobile, token, function(result) {
            if (result) {
                var sqls ="select count(id) as total from mobileuser ";
                conn.query(sqls,null,function (err,datas) {
                    if(err){
                        res.json({ "code": 300, "data": { "status": "fail", "error": "数据库查询失败" } });
                    }else{
                        if (page < 1) {
                            page = 1;
                        }
                        var start = (page - 1) * pageSize;
                        pageSize = parseInt(pageSize);
//                var sql = "select Id,name,sex,company,NO,mobile,lastLoginTime,lastLoginIP,avatar " +
//                    "from mobileUser order by Id desc limit ?,?";

                        var sql = "select u.id as Id,u.name,u.sex,d2.name as d_name,u.NO,u.mobile from mobileuser u left join department2 d2 on u.company = d2.id limit ?,?";

                        conn.query(sql, [start, pageSize],
                            function(err, data) {
                                ret = {};
                                ret["status"] = "success";
                                ret["data"] = data;
                                ret["total"]=datas[0].total;
                                // Log.insertLog(mobile,req.url,"getMobileUsers");
                                res.json({ "code": 200, "data": ret });
                            });
                    }
                })

            } else {
                res.json({ "code": 300, "data": { "status": "fail", "error": "账号和token不匹配" } });
            }
        });
    } catch (e) {
        res.json({ "code": 300, "data": { "status": "fail", "error": "未知错误" } });
    }
}

//根据Id删除管理员用户
function delPCUser(req,res){
    var query = req.body;
    try{
        var Id = query.Id || -1;
        if(-1==Id){
            res.json({ "code": 300, "data": { "status": "fail", "error": "参数错误" }});
            return;
        }
        var mobile = query.mobile;
        var token = query.token;
        checkMobile2Token(mobile,token,function(result){
            if(result){
                conn.query("delete from user where Id=?",[parseInt(Id)],
                    function(err,result){
                        Log.insertLog(mobile,"删除PC用户","delPCUser");
                        res.json({ "code": 200, "data": { "status": "success", "error": "success" } }); 
                    });
            } else {
                res.json({ "code": 300, "data": { "status": "fail", "error": "账号和token不匹配" }});
            }
        });
    } catch(e) {
        res.json({ "code": 300, "data": { "status": "fail", "error": "未知错误" }});
    }
}


/**********
 ****公用部分******
 ************/

//获取用户权限



//获取自己的用户信息
function getUserInfo(mobile, token, callback) {
    try {
        checkMobile2Token(mobile, token, function(result) {
            if (result) {
                conn.query("select a.*,b.role_name from user a left join role b on a.role_id=b.role_id where mobile=? and status=?", [mobile,1],
                    function(err, res) {
                        ret = {};
                        ret["error"] = 0;
                        ret["data"] = res[0];
                        callback(ret);
                    });
            } else {
                callback({ "error": "账号和token不匹配" });
            }
        });
    } catch (e) {
        console.log(e);
    }
}

//验证账号和密码是否匹配
function checkMobile2Password(mobile, password, callback) {
    password = crypto.createHash("md5").update(password).digest('hex');
    conn.query("select count(Id) as total from user where mobile=? and password=? and status=?", [mobile, password,1],
        function(err, result) {
            if(err){
                callback(false);
            } else {
                if (result[0].total > 0) {
                    callback(true);
                } else {
                    callback(false);
                }
            }
        });
}

//验证账号和token是否匹配
function checkMobile2Token(mobile, token, callback) {
    conn.query("select count(Id) as total from user where mobile=? and token=? and status=?", [mobile, token,1],
        function(err, result) {
            if(err){
                callback(false)
            } else {
                if (result[0].total > 0) {
                    callback(true);
                } else {
                    callback(false);
                }
            }
        });
}

//后端验证账号和token是否匹配并返回全部权限
function checkMobile2Token_R_permission(mobile,token,callback){
    checkMobile2Token(mobile,token,function(result){
        if(result){
            conn.query("select permission from user where mobile=? and token=?", 
                [mobile, token],
                function(err,result){
                    callback(JSON.parse(result[0].permission));
                });
        } else {
            callback(false);
        }
    });
}

//前端验证账号和token是否匹配并验证是否拥有指定权限
function checkMobile2TokenWithPermissionFrontEnd(req,res){
    var query = req.body;
    try{
        var mobile = query.mobile || -1;
        var token = query.token || -1;
        var permission = query.permission || -1;
        if(mobile==-1 || token==-1 || permission==-1){
            res.json({ "code": 300, "data": { "status": "fail", "error": "参数错误" }});
            return;
        }
        checkMobile2Token_R_permission(mobile,token,function(result){
            if(result){
                if(result.indexOf(permission)!=-1){ 
                    res.json({ "code": 200, "data": {"start":"success","data":1} });
                } else {
                    res.json({ "code": 200, "data": {"start":"success","data":0} });
                }
            } else {
                res.json({ "code": 300, "data": { "status": "fail", "error": "账号和token不匹配" }});
            }
        });
    } catch(e) {
        res.json({ "code": 300, "data": {"status": "fail", "error": "未知错误" }});
    } 
}

//后端验证账号和token是否匹配并验证是否拥有指定权限
function checkMobile2TokenWithPermissionBackEnd(mobile,token,permission,callback){
    checkMobile2Token_R_permission(mobile,token,function(result){
        if(result){
            if(result.indexOf(permission)!=-1){
                callback(true);
            } else {
                callback(false);
            }
        } else {
            callback(false);
        }
    });
}

//审核用户
//@param:Id=>审核用户的Id
//@param:mobile=>mobile
//@param:token=>token
//@param:type=>1:审核通过,0:审核不通过,将会删除该用户的注册信息
function checkUser(req,res){
    var query = req.body;
    try{
        var Id = query.Id || -1;
        if(-1==Id){
            res.json({ "code": 300, "data": { "status": "fail", "error": "参数错误" }});
            return;
        }
        var mobile = query.mobile || -1;
        var token = query.token || -1;
        var type = query.type || -1;
        if(mobile==-1 || token==-1 || type==-1){
            res.json({ "code": 301, "data": { "status": "fail", "error": "参数错误" }});
            return;
        }
        checkMobile2Token(mobile,token,function(result){
            if(result){
                //判断Id对应的用户是否存在
                conn.query("select count(Id) as total from user where Id=?",
                            [Id],function(err,result){
                                if(result && result.length && result[0].total==1){
                                    //获取用户的状态
                                    conn.query("select status from user where Id=?",[Id],
                                                function(err,result){
                                                    if(result[0].status){
                                                        res.json({ "code": 403, "data": { "status": "fail", "error": "用户已被选中" }});
                                                    } else {
                                                        //审核不通过，删除该用户的信息
                                                        if(type==0){
                                                            conn.query("delete from user where Id=?",[Id],
                                                                        function(err,result){
                                                                            res.json({ "code": 200, "data": {"error":"success"} });
                                                                        });
                                                        }
                                                        //审核通过，更新用户状态
                                                        if(type==1){
                                                            conn.query("update user set status=? where Id=?",[Id],
                                                                        function(err,result){
                                                                            //Log.insertLog(mobile,"审核用户","checkUser");
                                                                            //Log.insertLog(mobile,req.url,"checkUser");
                                                                           res.json({ "code": 200, "data": {"error":"success"} }); 
                                                                        });
                                                        }
                                                    }
                                                });
                                } else {
                                    res.json({ "code": 404, "data": { "status": "fail", "error": "用户不存在" }});
                                }
                            });
            } else {
                res.json({ "code": 300, "data": { "status": "fail", "error": "账号和token不匹配" }});
            }
        });
    } catch(e) {
        res.json({ "code": 300, "data": { "status": "fail", "error": "未知错误" }});
    }
}

//获取部门id
function getDepartmentPC(req,res){
 var query = req.body;
    try {
        var mobile = query.mobile;
        var token = query.token;
        getUserInfo(mobile, token, function(user) {
            if (user.error == 0) {
                //
				var id = query.id || "-1";
				if(id == "-1"){
					errMessage(res,301,"参数错误");
				}else{
					var sql = "select u.Id as uId,d2.Id,d2.p_id from user u LEFT JOIN department2 d2 ON u.company = d2.Id where u.id = ?";
					var params = [id];
					conn.query(sql,params,function(err,result){
						if(err){
							console.log(err.message);
						}else{
							res.json({ "code": 200, "data": {"status":"success","message":result} });
						}
					});
				}
            } else {
                res.json({ "code": 300, "data": { "status": "fail", "error": "用户未登录" }});
                return;
            }
        });
    } catch (e) {
         res.json({ "code": 500, "data": { "status": "fail", "error": e }});
    }
}

//当前在线人数
function getOnlineCount(req, res){
    var query = req.body;
    try {
        var mobile = query.mobile;
        var token = query.token;
        var page = query.page || 1;
        var pageSize = query.pageSize || 10;
        getUserInfo(mobile, token, function(user) {
            if (user.error == 0) {
                var userId = user.Id;
                var timestamp = new Date().getTime() - 10 * 60 * 1000;
                conn.query("select count(0) as total from user where lastLoginTime>?",
                    [timestamp], function(err, result){
                        if(err){
                            errMessage(res,301,err.message);
                        } else {
                            if (page < 1) {
                                page = 1;
                            }
                            var start = (page - 1) * pageSize;
                            pageSize = parseInt(pageSize);
                            conn.query("select a.Id,a.name,a.NO,a.mobile,b.role_name,c.name as company from user a left join "+
                            " role b on a.role_id=b.role_id left join department2 c on a.company=c.Id where a.lastLoginTime>? limit ?,?",
                                [timestamp,start,pageSize],function (err,results) {
                                    if(err){
                                        errMessage(res,301,err.message);
                                    }else{
                                        //console.log(result[0].total);
                                        res.json({ "code": 200, "data": {"status":"success","data":result[0].total,"dataArr":results} });
                                    }

                                })
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

//强制用户下线
//type 1->PC用户; 2->手机用户
function forceLogout(req,res){
    var query = req.body;
    try {
        var mobile = query.mobile;
        var token = query.token;
        getUserInfo(mobile, token, function(user) {
            if (user.error == 0) {
                var userId = user.Id;
                var targetId = parseInt(query.targetId) || -1;
                var type = parseInt(query.type) || -1;
                if(targetId==-1 || type==-1){
                    errMessage(res, 300, "参数错误");
                } else {
                    var timestamp = new Date().getTime();
                    //更新token
                    var table = "user";
                    if(type==2){
                        table = "mobileuser";
                    }
                    conn.query("update "+ table +" set lastLoginTime=?,token=? where Id=?",[0,timestamp, targetId],
                                function(err, result){
                                    if(err){
                                        errMessage(res, 500, err.message);
                                    } else {
                                        Log.insertLog(mobile,"强制下线","forceLogout");
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


exports.register = register;
exports.login = login;
exports.loginWithToken = loginWithToken;
exports.logout = logout;
exports.checkMobile2Password = checkMobile2Password;
exports.checkMobile2Token = checkMobile2Token;
exports.getUserInfo = getUserInfo;
exports.getUsers = getUsers;
exports.getSingleUserInfo = getSingleUserInfo;
exports.getSingleUserInfoByMobile = getSingleUserInfoByMobile;
exports.getUsersByKeyword = getUsersByKeyword;
exports.addMobileUser = addMobileUser;
exports.editMobileUser = editMobileUser;
exports.delMobileUser = delMobileUser;
exports.getMobileUsers = getMobileUsers;
exports.delPCUser = delPCUser;
exports.checkMobile2Token_R_permission = checkMobile2Token_R_permission;
exports.checkMobile2TokenWithPermissionFrontEnd = checkMobile2TokenWithPermissionFrontEnd;
exports.checkMobile2TokenWithPermissionBackEnd = checkMobile2TokenWithPermissionBackEnd;
exports.checkUser = checkUser;
//addPCUser
exports.addPCUser = addPCUser;
//editPCUser
exports.editPCUser = editPCUser;
//根据id查询部门id
exports.getDepartmentPC = getDepartmentPC;
exports.getOnlineCount = getOnlineCount;
exports.forceLogout = forceLogout;



