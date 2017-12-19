var db = require("../lib/db");
var mapConfig = require("../config/mapConfig");
var check = require("../lib/check");
var User = require("./userController");
var request = require("../lib/request");

//分页查询日志；
function getLogList(req, res) {
    var query = req.body;
    console.log(query);
    try {
        var mobile = query.mobile;
        var token = query.token;
        User.getUserInfo(mobile, token, function (user) {
            if (user.error == 0) {
                //
                var sql = "select count(id) as total from log";
                var dataArr = [];
                db.query(sql, dataArr, function (err, rows) {
                    if (err) {
                        res.json({
                            "code": 501,
                            "data": {
                                "status": "fail",
                                "error": err.message
                            }
                        });
                    } else {
                        var total = rows[0].total;
                        var page = query.page || -1;
                        var pageSize = query.pageSize || 20;
                        console.log("********")
                        console.log(pageSize)
                        if (page < 1 && page != -1) {
                            page = 1;
                        }
                        pageSize = parseInt(pageSize);
                        var start = (page - 1) * pageSize;
                        if (-1 == page) {
                            sql = "select * from log";
                            pageSize = total;
                            dataArr = [];
                        } else {
                            sql = "select * from log limit ?, ?";
                            dataArr = [start, pageSize];
                        }
                        db.query(sql, dataArr, function (err, rows) {
                            if (err) {
                                res.json({
                                    "code": 501,
                                    "data": {
                                        "status": "fail",
                                        "error": err.message
                                    }
                                });
                            } else {
                                //insertLog(mobile,req.url,sql);
                                res.json({
                                    "code": 200,
                                    "data": {
                                        "status": "success",
                                        "error": "success",
                                        "rows": rows,
                                        "total": total,
                                    }
                                });
                            }
                        });
                    }
                });
            } else {
                errMessage(res, 301, "用户未登录");
                return;
            }
        });
    } catch (e) {
        res.json({
            "code": 500,
            "data": {
                "status": "fail",
                "error": e.message
            }
        });
    }
}

function errMessage(res,code,msg){
    res.json({
        "code": code,
        "data": {
            "status": "fail",
            "error": msg
        }
    });
}

/**
 *日志查询
 */
// function listLog(req,res){
//     var query = req.body;
//     try {
//         var mobile = query.mobile;
//         var token = query.token;
//         User.getUserInfo(mobile, token, function(user) {
//             if (user.error == 0) {
//                 var sql = "select * from log";
//                 db.query(sql,function(err,data){
//                         if(err){
//                             console.log(err);
//                         } else {
//                             res.json({ "code": 200, "data": { "status": "success", "message": data }});
//                         }
//                     }
//                  )
//             } else {
//                 res.json({
//                     "code": 301,
//                     "data": {
//                         "status": "fail",
//                         "error": "user not login"
//                     }
//                 });
//                 return;
//             }
//         });
//     } catch (e) {
//         res.json({
//             "code": 500,
//             "data": {
//                 "status": "fail",
//                 "error": e.message
//             }
//         });
//     }
// } 

//按mobile进行用户查询
/* function listLogByMobile(req,res){
    var query = req.body;
    try {
        var mobile1= query.mobile1;
        var token = query.token;
        User.getUserInfo(mobile1, token, function(user) {
            if (user.error == 0) {
            	var mobile=query.mobile;
            	var startTime=query.startTime;
            	var endTime=query.endTime;
				var page = parseInt(query.page) || -1;
				var pagesize = parseInt(query.pagesize);

				var start = (page-1)*pagesize;

                var sql="SELECT * FROM log WHERE mobile=? and timeStamp1 BETWEEN ? AND ? limit ?,?" ;
                var param=[mobile,startTime,endTime,start,pagesize];
                db.query(sql,param,function(err,data){
                        if(err){
                            console.log(err);
                        } else {

							//添加总数;


                            res.json({ "code": 200, "data": { "status": "success", "message": data }});
                        }
                    }
                 )
            } else {
                res.json({
                    "code": 301,
                    "data": {
                        "status": "fail",
                        "error": "user not login"
                    }
                });
                return;
            }
        });
    } catch (e) {
		//console.log("***************************************************");
		//console.log(e);
        res.json({
            "code": 500,
            "data": {
                "status": "fail",
                "error": e.message
            }
        });
    }
}  */

function listLogByMobile(req, res) {
    var query = req.body;
    try {
        var mobile1 = query.mobile1;
        var token = query.token;
        User.getUserInfo(mobile1, token, function (user) {
            if (user.error == 0) {
                //
                var mobile=query.mobile || "-1";
            	var startTime=query.startTime || -1;
                var endTime=query.endTime || -1;

                var sql = "select count(id) as total from log where mobile=? and timeStamp1 BETWEEN ? AND ?";
                var params = [mobile,startTime,endTime];
                
                db.query(sql, params, function (err, rows) {
                    if (err) {
                        res.json({
                            "code": 501,
                            "data": {
                                "status": "fail",
                                "error": err.message
                            }
                        });
                    } else {
                        var total = rows[0].total;
                        var page = query.page || -1;
                        var pageSize = query.pageSize || 20;
                        if (page < 1 && page != -1) {
                            page = 1;
                        }
                        pageSize = parseInt(pageSize);
                        var start = (page - 1) * pageSize;
                        if (-1 == page) {
                            sql = "select * from log where mobile=? and timeStamp1 BETWEEN ? AND ?";
                            pageSize = total;
                            params = [mobile,startTime,endTime];
                        } else {
                            sql = "select * from log where mobile=? and timeStamp1 BETWEEN ? AND ? limit ?, ?";
                            params = [mobile,startTime,endTime,start, pageSize];
                            console.log(params)
                        }
                        db.query(sql, params, function (err, rows) {
                            if (err) {
                                res.json({
                                    "code": 501,
                                    "data": {
                                        "status": "fail",
                                        "error": err.message
                                    }
                                });
                            } else {
                                //insertLog(mobile,req.url,sql);
                                res.json({
                                    "code": 200,
                                    "data": {
                                        "status": "success",
                                        "error": "success",
                                        "rows": rows,
                                        "total": total
                                    }
                                });
                            }
                        });
                    }
                });
            } else {
                errMessage(res, 301, "用户未登录");
                return;
            }
        });
    } catch (e) {
        res.json({
            "code": 500,
            "data": {
                "status": "fail",
                "error": e.message
            }
        });
    }
}

//创建新的日志记录
function insertLog(mobile, operate, sql) {
    //插入一条新记录到日志表
    var timeStamp = new Date().getTime();
    db.query("insert into log(mobile,operate,sql1,timeStamp1) values(?,?,?,?)", [mobile, operate, sql, timeStamp],
        function (err, result) {});
}

exports.getLogList = getLogList;
// exports.listLog = listLog;
exports.insertLog = insertLog;
exports.listLogByMobile = listLogByMobile;