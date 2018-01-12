var db = require("../lib/db");
var mapConfig = require("../config/mapConfig");
var check = require("../lib/check");
var User = require("./userController");
var request = require("../lib/request");

//获取日志操作
function getLogOperate(req,res) {
    var query = req.body;
    try{
        var mobile = query.mobile;
        var token = query.token;
        var pid = query.pid || -1;
        User.getUserInfo(mobile, token, function (user) {
            if(user.error == 0){
                if(pid == -1){
                    var sql = "select * from log_operate where pid=?";
                    db.query(sql,[0],function (err,data) {
                        if(err){
                            res.json({"code": 501, "data": {"status": "fail", "error": "数据查询错误"}});
                        }else{
                            res.json({"code": 200, "data": {"status": "fail", "data":data}});
                        }
                    });
                }else{
                    var sql = "select * from log_operate where pid =?";
                    db.query(sql,[pid],function (err,data) {
                        if(err){
                            res.json({"code": 501, "data": {"status": "fail", "error": "数据查询错误"}});
                        }else{
                            res.json({"code": 200, "data": {"status": "fail", "data":data}});
                        }
                    });
                }
            }else {
                res.json({"code": 501, "data": {"status": "fail", "error":"用户未登录"}});
            }
        });
    }catch (e){
        res.json({"code": 500, "data": {"status": "fail", "error": e.message}});
    }
}

//分页查询日志；
function getLogList(req, res) {
    var query = req.body;
    try {
        var mobile = query.mobile;
        var token = query.token;
        User.getUserInfo(mobile, token, function (user) {
            if (user.error == 0) {
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
                        if (page < 1 && page != -1) {
                            page = 1;
                        }
                        pageSize = parseInt(pageSize);
                        var start = (page - 1) * pageSize;
                        if (-1 == page) {
                            sql = "select * from log order by id desc";
                            pageSize = total;
                            dataArr = [];
                        } else {
                            sql = "select * from log order by id desc limit ?, ? ";
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
                var mobile=query.mobile || -1;
            	var startTime=query.startTime || -1;
                var endTime=query.endTime || -1;
                var page = query.page || -1;
                var pageSize = query.pageSize || 20;
                var operate = query.operate || -1;
                var key = [];
                var value = [];
                var sqls = "select * from log ";
                var sql = "select count(0) as total from log";
                if(mobile != -1){
                    key.push("mobile");
                    value.push(mobile);
                }
                if(operate != -1){
                    key.push("operate");
                    value.push(operate);
                }
                if (page < 1 && page != -1) {
                    page = 1;
                }
                pageSize = parseInt(pageSize);
                var start = (page - 1) * pageSize;
                for(var i=0;i<key.length;i++){
                    if(i==0){
                        sqls += " where ";
                        sql += " where ";
                    }else{
                        sqls += " and ";
                        sql += " and ";
                    }
                    var a = value[i];
                    sqls += key[i]+" like '%"+a+"%'";
                    sql += key[i]+" like '%"+a+"%'";
                }
                if(startTime != -1){
                    if(key.length<1){
                        sqls += " where timeStamp1 > "+startTime;
                        sql += " where timeStamp1 > "+startTime;
                    }
                    sqls += " and timeStamp1 > "+startTime;
                    sql += " and timeStamp1 > "+startTime;
                }
                if(endTime != -1){
                    if(key.length<1){
                        if(startTime == -1){
                            sqls += " where timeStamp1 < "+endTime;
                            sql += " where timeStamp1 < "+endTime;
                        }else{
                            sqls += " and timeStamp1 < "+endTime;
                            sql += " and timeStamp1 < "+endTime;
                        }

                    }
                    sqls += " and timeStamp1 < "+endTime;
                    sql += " and timeStamp1 < "+endTime;
                }
                sqls += " order by id desc limit "+start+","+pageSize;
                // console.log(sqls);
                // console.log(sql);
                db.query(sqls, null, function (err, result) {
                    if (err) {
                        console.log(err);
                        res.json({
                            "code": 501,
                            "data": {
                                "status": "fail",
                                "error": err.message
                            }
                        });
                    } else {
                        //insertLog(mobile,req.url,sql);
                        db.query(sql,null,function (err,rows) {
                            if(err){
                                res.json({
                                    "code": 501,
                                    "data": {
                                        "status": "fail",
                                        "error": err.message
                                    }
                                });
                            }else{
                                res.json({
                                    "code": 200,
                                    "data": {
                                        "status": "success",
                                        "error": "success",
                                        "rows": result,
                                        "total": rows[0].total
                                    }
                                });
                            }
                        })

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
exports.getLogOperate = getLogOperate;