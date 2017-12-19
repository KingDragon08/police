// var DB_CONFIG = require("../config/dbconfig");
// var mysql = require('mysql');
var crypto = require('crypto');
var Sync = require('sync');
var Log = require('./logController')
var User = require("./userController");

// var conn = mysql.createConnection({
//     host: DB_CONFIG.host,
//     user: DB_CONFIG.user,
//     password: DB_CONFIG.password,
//     database:DB_CONFIG.database,
//     port: DB_CONFIG.port
// });
// conn.connect();

var conn = require("../lib/db");

//登录
function login(req, res) {
    var query = req.body;
    try {
        var mobile = query.mobile || "";
        var password = query.password || "";
        var IP = query.IP || "0.0.0.0";
        if (mobile.length != 11) {
            res.json({ "code": 300, "data": { "status": "fail", "error": "账号错误" }});
        } else {
            password = crypto.createHash("md5").update(password).digest('hex');
            conn.query("select count(Id) as total from mobileUser where mobile=? and " +
                "password=? and status=?",
                [mobile, password, 1],
                function(err, result) {
                    if (result[0].total == 1) {
                        //更新操作
                        var timestamp = new Date().getTime();
                        var token = mobile + "_" + timestamp;
                        token = crypto.createHash("md5").update(token).digest('hex');
                        conn.query("select Id,name,sex,company,NO,mobile,lastLoginTime,lastLoginIP,avatar "+
                        	"from mobileUser " +
                            "where mobile=? and password=? and status=?",
                            [mobile, password, 1],
                            function(err, result) {
                                result[0]["token"] = token;
                                result[0]["status"] = "success";
                                Log.insertLog(mobile,"用户登录","login");
                                res.json({ "code": 200, "data": result[0] });
                                //更新数据库
                                conn.query("update mobileUser set token=?,lastLoginTime=?," +
                                    "lastLoginIP=? where Id=?",
                                    [token, timestamp, IP, result[0]["Id"]],
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
        res.json({ "code": 300, "data": { "status": "fail", "error": "未知错误" } });
    }
}

// 使用token登录
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
                conn.query("select Id,name,sex,company,NO,mobile,lastLoginTime,lastLoginIP,avatar "+
                	"from mobileUser " +
                    "where mobile=? and status=?",
                    [mobile, 1],
                    function(err, result) {
                    	console.log(err);
                        result[0]["token"] = token;
                        result[0]["status"] = "success";
                        Log.insertLog(mobile,"token登录","loginWithToken");
                        res.json({ "code": 200, "data": result[0] });
                        //更新数据库
                        conn.query("update mobileUser set token=?,lastLoginTime=?," +
                            "lastLoginIP=? where Id=?",
                            [token, timestamp, IP, result[0]["Id"]],
                            function(err, result) {
                                console.log("loginWithToken and update success");
                            });
                    });
            } else {
                res.json({ "code": 300, "data": { "status": "fail", "error": "账号和token不匹配" }});
            }
        })
    } catch (e) {
        res.json({ "code": 300, "data": { "status": "fail", "error": "未知错误" }});
    }
}

//退出登录
function logout(req, res) {
    var query = req.body;
    try {
        var mobile = query.mobile;
        var token = query.token;
        checkMobile2Token(mobile, token, function(result) {
            if (result) {
                //更新token
                conn.query("update mobileUser set token=? where mobile=?",
                	["KingDragon", mobile],
                    function(err, re) {
                        Log.insertLog(mobile,"退出登录","logout");
                        res.json({ "code": 200, "data": { "status": "success", "error": "退出登录成功" } });
                    });
            } else {
                res.json({ "code": 300, "data": { "status": "fail", "error": "账号和token不匹配" } });
            }
        });
    } catch (e) {
        res.json({ "code": 300, "data": { "status": "fail", "error": "未知错误" } });
    }
}


/**********
 ****公用部分******
 ************/

//验证账号和token是否匹配
function checkMobile2Token(mobile, token, callback) {
    conn.query("select count(Id) as total from mobileUser where mobile=? and token=? and status=?",
    	[mobile, token, 1],
        function(err, result) {
            if (result[0].total > 0) {
                callback(true);
            } else {
                callback(false);
            }
        });
}

//获取自己的用户信息
function getUserInfo(mobile, token, callback) {
    try {
        checkMobile2Token(mobile, token, function(result) {
            if (result) {
                conn.query("select * from mobileUser where mobile=? and token=? and status=?", [mobile,token,1],
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

//手机获取部门id
function getDepartmentAPP(req,res){
 var query = req.body;
    try {
        var mobile = query.mobile;
        var token = query.token;
        User.getUserInfo(mobile, token, function(user) {
            if (user.error == 0) {
                //
				var id = query.id || "-1";
				if(id == "-1"){
					errMessage(res,301,"params error");
				}else{
					var sql = "select m.id as mId,d2.id,d2.p_id from mobileuser m LEFT JOIN department2 d2 ON m.company = d2.Id where m.id = ?";
					var params = [id];
					conn.query(sql,params,function(err,result){
						if(err){
                            res.json({ "code": 300, "data": { "status": "fail", "error": "查询失败" }});
                            return;
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


exports.login = login;
exports.loginWithToken = loginWithToken;
exports.logout = logout;
exports.checkMobile2Token = checkMobile2Token;
exports.getUserInfo = getUserInfo;
exports.getDepartmentAPP = getDepartmentAPP;