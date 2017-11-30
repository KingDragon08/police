// var DB_CONFIG = require("../config/dbconfig");
// var mysql = require('mysql');
var crypto = require('crypto');
var Sync = require('sync');
var Log = require('./logController')

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
            res.json({ "code": 300, "data": { "status": "fail", "error": "moblie error" }});
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
                                Log.insertLog(mobile,req.url,"login");
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
                        res.json({ "code": 300, "data": { "status": "fail", "error": "moblie not match password" } });
                    }
                });
        }
    } catch (e) {
        res.json({ "code": 300, "data": { "status": "fail", "error": "unknown error" } });
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
                        Log.insertLog(mobile,req.url,"loginWithToken");
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
                res.json({ "code": 300, "data": { "status": "fail", "error": "moblie not match token" }});
            }
        })
    } catch (e) {
        res.json({ "code": 300, "data": { "status": "fail", "error": "unkown error" }});
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
                        Log.insertLog(mobile,req.url,"logout");
                        res.json({ "code": 200, "data": { "status": "success", "error": "logout success" } });
                    });
            } else {
                res.json({ "code": 300, "data": { "status": "fail", "error": "moblie not match token" } });
            }
        });
    } catch (e) {
        res.json({ "code": 300, "data": { "status": "fail", "error": "unkown error" } });
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
                callback({ "error": "mobile not match token" });
            }
        });
    } catch (e) {
        console.log(e);
    }
}


exports.login = login;
exports.loginWithToken = loginWithToken;
exports.logout = logout;
exports.checkMobile2Token = checkMobile2Token;
exports.getUserInfo = getUserInfo;
