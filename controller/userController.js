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
	var query = req.query;
	try{
		var name = req.query.name;
		var password = crypto.createHash("md5").update(req.query.password).digest('hex');
		var plainPassword = req.query.password;
		var sex = req.query.sex;
		var NO = req.query.NO;
		var mobile = req.query.mobile;
		var createTime = new Date().getTime();
		if(sex!='F' && sex!='M'){
			res.json({"code": 300, "data":{"status":"fail","error":"sex must be F or M"}});
			return;
		} else {
			//查看是否已经注册
			conn.query("select count(Id) as total from user where mobile=?",[mobile],
				function(err,result){
					if(result[0].total>0){
						res.json({"code": 300, "data":{"status":"fail","error":"mobile already exist"}});
					} else {
						conn.query("insert into user(name,password,plainPassword,"+
									"sex,NO,mobile,createTime,lastLoginTime,status)"+
									"values(?,?,?,?,?,?,?,?,?)",
									[name,password,plainPassword,sex,NO,mobile,
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
		res.json({"code": 300, "data":{"status":"fail","error":"register error"}});
	}
}

//登录
function login(req,res){
	var query = req.query;
	var mobile = req.query.mobile || "";
	var password = req.query.password || "";
	var IP = req.query.IP || "0.0.0.0";
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
							conn.query("select Id,name,sex,NO,mobile,lastLoginTime,lastLoginIP from user "+
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
}

function test(req,res){
	checkMobile2Password('1','2',function(err,result){
		res.json(result);
	})
}

//验证账号和密码是否匹配
function checkMobile2Password(mobile,password,callback){
	conn.query("select * from user",[],function(err,result){
		callback(err,result);
	});
}

//验证账号和token是否匹配
function checkMobile2Token(){

}

exports.register = register;
exports.login = login;
exports.test = test;




