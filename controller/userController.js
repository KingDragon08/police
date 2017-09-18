var DB_CONFIG = require("../dbconfig");
var mysql = require('mysql');
var crypto = require('crypto');
var Sync = require('sync');

var conn = mysql.createConnection({
    host: DB_CONFIG.host,
    user: DB_CONFIG.user,
    password: DB_CONFIG.password,
    database:DB_CONFIG.database,
    port: DB_CONFIG.port
});
conn.connect();

//注册新账号
function register(req,res){
	var query = req.body;
	try{
		var name = query.name || "UNKNOWN";
		var password = crypto.createHash("md5").update(query.password).digest('hex');
		var plainPassword = query.password;
		var sex = query.sex || "M";
		var NO = query.NO || "000000";
		var mobile = query.mobile || "00000000000";
		var company = query.company || "west";
		var createTime = new Date().getTime();
		if(sex!='F' && sex!='M'){
			res.json({"code": 300, "data":{"status":"fail","error":"sex must be F or M"}});
			return;
		} else {
			//查看是否已经注册
			conn.query("select count(Id) as total from user where mobile=?",[mobile],
				function(err,result){
					console.log(err);
					console.log(result);
					if(result[0].total>0){
						res.json({"code": 300, "data":{"status":"fail","error":"mobile already exist"}});
					} else {
						conn.query("insert into user(name,password,plainPassword,"+
									"sex,company,NO,mobile,createTime,lastLoginTime,status)"+
									"values(?,?,?,?,?,?,?,?,?,?)",
									[name,password,plainPassword,sex,company,NO,mobile,
										createTime,createTime,1],
									function(err,result){
										if(err){
											console.log("[REGISTER ERROR] - ",err.message);
											res.json({"code": 300, "data": {"status":"fail","err":err.message}});
			         						return;
										} else {
											console.log('[REGIST SUCCESS]');
											res.json({"code":200,"data":{"status":"success","error":"success"}});
										}
						});
					}
			});

		}
	} catch(e) {
		console.log(e);
		res.json({"code": 300, "data":{"status":"fail","error":"register error"}});
	}
}

//登录
function login(req,res){
	var query = req.body;
	try{
		var mobile = query.mobile || "";
		var password = query.password || "";
		var IP = query.IP || "0.0.0.0";
		if(mobile.length!=11){
			res.json({"code": 300, "data":{"status":"fail","error":"moblie error"}});
		} else {
			password = crypto.createHash("md5").update(password).digest('hex');
			conn.query("select count(Id) as total from user where mobile=? and "+
						"password=? and status=?",
						[mobile,password,1],
						function(err,result){
							if(result[0].total==1){
								//更新操作
								var timestamp = new Date().getTime();
								var token = mobile + "_" + timestamp;
								token = crypto.createHash("md5").update(token).digest('hex');
								conn.query("select Id,name,sex,company,NO,mobile,lastLoginTime,lastLoginIP from user "+
											"where mobile=? and password=? and status=?",
											[mobile,password,1],
											function(err,result){
												result[0]["token"] = token;
												result[0]["status"] = "success";
												res.json({"code":200,"data":result[0]});
												//更新数据库
												conn.query("update user set token=?,lastLoginTime=?,"+
															"lastLoginIP=? where Id=?",
															[token,timestamp,IP,result[0]["Id"]],
															function(err,result){
																console.log("login and update success");
															});
											});
							} else {
								res.json({"code": 300, "data":{"status":"fail","error":"moblie not match password"}});
							}
						});
		}
	} catch(e) {
		res.json({"code": 300, "data":{"status":"fail","error":"unknown error"}});
	}

}

//使用token登录
function loginWithToken(req,res){
	var query = req.body;
	try{
		var mobile = query.mobile;
		var token = query.token;
		var IP = query.IP || "0.0.0.0";
		checkMobile2Token(mobile,token,function(result){
			if(result){
				//更新操作
				var timestamp = new Date().getTime();
				var token = mobile + "_" + timestamp;
				token = crypto.createHash("md5").update(token).digest('hex');
				conn.query("select Id,name,sex,company,NO,mobile,lastLoginTime,lastLoginIP from user "+
							"where mobile=? and status=?",
							[mobile,1],
							function(err,result){
								result[0]["token"] = token;
								result[0]["status"] = "success";
								res.json({"code":200,"data":result[0]});
								//更新数据库
								conn.query("update user set token=?,lastLoginTime=?,"+
											"lastLoginIP=? where Id=?",
											[token,timestamp,IP,result[0]["Id"]],
											function(err,result){
												console.log("loginWithToken and update success");
											});
							});
			} else {
				res.json({"code": 300, "data":{"status":"fail","error":"moblie not match token"}});
			}
		})
	} catch(e){
		res.json({"code": 300, "data":{"status":"fail","error":"unkown error"}});
	}
}

//退出登录
function logout(req,res){
	var query = req.body;
	try{
		var mobile = query.mobile;
		var token = query.token;
		checkMobile2Token(mobile,token,function(result){
			if(result){
				//更新token
				conn.query("update user set token=? where mobile=?",
					["KingDragon",mobile],
					function(err,re){
						res.json({"code":200,"data":{"status":"success","error":"logout success"}});
					});
			} else {
				res.json({"code": 300, "data":{"status":"fail","error":"moblie not match token"}});
			}
		});
	} catch(e){
		res.json({"code": 300, "data":{"status":"fail","error":"unkown error"}});
	}
}

//分页获取用户信息
function getUsers(req,res){
	var query = req.body;
	try{
		var page = query.page || 1;
		var mobile = query.mobile;
		var token = query.token;
		var pageSize = query.pageSize || 20;
		checkMobile2Token(mobile,token,function(result){
			if(result){
				var start = (page-1)*pageSize;
				conn.query("select Id,name,sex,company,NO,mobile,lastLoginTime,lastLoginIP "+
							"from user order by Id desc limit ?,?",
							[start,pageSize],
							function(err,data){
								ret = {};
								ret["status"] = "success";
								ret["data"] = data;
								res.json({"code":200,"data":ret});
							});
			} else {
				res.json({"code": 300, "data":{"status":"fail","error":"mobile not match token"}});
			}
		});
	} catch(e) {
		res.json({"code": 300, "data":{"status":"fail","error":"unkown error"}});	
	}
}


/**********
****公用部分******
************/

//获取单个用户信息
function getUserInfo(mobile,token,callback){
	try{
		checkMobile2Token(mobile,token,function(result){
			if(result){
				conn.query("select * from user where mobile=?",
							[mobile],
							function(err,res){
								callback(res);
							});
			} else {
				callback({"error":"mobile not match token"});
			}
		});
	} catch(e) {
		console.log(e);
	}
}

//验证账号和密码是否匹配
function checkMobile2Password(mobile,password,callback){
	password = crypto.createHash("md5").update(password).digest('hex');
	conn.query("select count(Id) as total from user where mobile=? and password=?",
				[mobile,password],
				function(err,result){
					if(result[0].total>0){
						callback(true);
					} else {
						callback(false);
					}
				});
}

//验证账号和token是否匹配
function checkMobile2Token(mobile,token,callback){
	conn.query("select count(Id) as total from user where mobile=? and token=?",
				[mobile,token],
				function(err,result){
					if(result[0].total>0){
						callback(true);
					} else {
						callback(false);
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
