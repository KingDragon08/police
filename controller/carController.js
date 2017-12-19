var DB_CONFIG = require("../config/dbconfig");
// var mysql = require('mysql');
// var crypto = require('crypto');
// var Sync = require('sync');
var User = require('../controller/userController')
var db = require('../lib/db');
var dbCarTableAttr = require("../config/dbCarTableAttrConf");
var checked = require("../lib/check");
var Log=require("./logController");
// var conn = mysql.createConnection({
//     host: DB_CONFIG.host,
//     user: DB_CONFIG.user,
//     password: DB_CONFIG.password,
//     database: DB_CONFIG.database,
//     port: DB_CONFIG.port
// });
// conn.connect();


var CAR_TABLE = "car.smdtv_1";

/*
+----------+---------------+------+-----+---------+----------------+
| Field    | Type          | Null | Key | Default | Extra          |
+----------+---------------+------+-----+---------+----------------+
| id       | int(11)       | NO   | PRI | NULL    | auto_increment |
| car_x    | double(255,2) | NO   |     | 0.00    |                |
| car_y    | double(255,2) | NO   |     | 0.00    |                |
| car_no   | varchar(255)  | NO   |     | 1       |                |
| car_addr | varchar(255)  | NO   |     | 0       |                |
| car_type | int(4)        | YES  |     | NULL    |                |
| is_del   | int(4)        | NO   |     | NULL    |                |
+----------+---------------+------+-----+---------+----------------+
*/
//添加车辆
function addCar(req, res) {
    var query = req.body;
    try {
        var mobile = query.mobile;
        check(query, res, function() {
            var car_x = query.car_x || -1;
			var car_y = query.car_y || -1;
			var car_no = query.car_no || -1;
			var car_addr = query.car_addr || -1;
			var car_type = query.car_type || -1;
            if (car_x == -1 || car_y == -1 || car_no == -1 || car_addr == -1 || car_type == -1) {
                errorHandler(res, "参数错误");
            } else {
                // var sql = "insert into (car_x,car_y,car_no,car_addr,car_type,is_del) values(?,?,?,?,?,?)";
                var sql = "insert into " + CAR_TABLE + "(SmX,SmyY,car_no,car_addr,car_type,is_del) values(?,?,?,?,?,?)";
                db.query(sql,
                     [car_x,car_y,car_no,car_addr,car_type,0],
                    function(err, result) {
                        if (err) {
                        	// Log.insertLog(mobile,"car--addCar","insert into car values(?,?)");
                            console.log(err);
                            errorHandler(res, err.message);
                        } else {
                        	Log.insertLog(mobile,"添加车辆", sql);
                            res.json({ "code": 200, "data": { "status": "success", "error": "success" } });
                            
                        }
                    });
            }
        });
    } catch (e) {
        errorHandler(res, "未知错误");
    }
}

//删除车辆
function delCar(req, res) {
    var query = req.body;
    try {
        var mobile = query.mobile;
        check(query, res, function() {
            var id = query.id || -1;
            if (id == -1) {
                errorHandler(res, "参数错误");
            } else {
                // var sql = "update car set is_del = 1 where id = ?";
                var sql = "update " + CAR_TABLE + " set is_del = 1 where SmID = ?";
                db.query(sql, [id],
                    function(err, result) {
                        if (err) {
                        	// Log.insertLog(mobile,"car--delCar","delCarinsert into car values(?,?)");
                            console.log(err);
                            errorHandler(res, err.message);
                        } else {
                        	Log.insertLog(mobile,"删除车辆", sql);
                            res.json({ "code": 200, "data": { "status": "success", "error": "success" } });
                        }
                    });
            }
        });
    } catch (e) {
        errorHandler(res, "未知错误");
    }
}

//分页获取车辆或获取全部车辆
function getCar(req, res) {
    var query = req.body;
	var mobile=query.mobile;
    try {
        check(query, res, function() {
            var page = parseInt(query.page) || -1;
            var pageSize = parseInt(query.pageSize) || 20;
            
			if (page == -1) {
                // var sql = "select * from car order by id desc limit 0,100"
                var sql = "select * from " + CAR_TABLE + " order by SmID desc limit 0,100"
                db.query( sql, [],
                    function(err, data) {
                        if (err) {
                        	// Log.insertLog(mobile,"car--getCar","select * from car order by id desc");
                            console.log(err);
                            errorHandler(res, err.message);
                        } else {
                            // ret = {};
                            // ret["status"] = "success";
                            // ret["data"] = data;
                            // Log.insertLog(mobile,"获取car列表","select * from car order by id desc");
                            // res.json({ "code": 200, "data": ret });

                            // 随机更新车辆位置
                            var tmpsql = "update " + CAR_TABLE + " set SmX = SmX + floor(rand()*1000 - 500), SmY = SmY + floor(rand()*1000 - 500) order by rand() limit 30";
                            db.query(tmpsql, [], function(merr, mdata){
                                ret = {};
                                ret["status"] = "success";
                                ret["data"] = data;
                                //Log.insertLog(mobile,"获取car列表", sql);
                                res.json({ "code": 200, "data": ret });
                                
                            });
                        }

                    });
            } else {
                if (page < 1) {
                    page = 1;
                }
                var start = (page - 1) * pageSize;
                // var sql = "select * from car  order by id desc limit ?,?";
                var sql = "select * from " + CAR_TABLE + " order by SmID desc limit ?,?";
                db.query(sql, [start, pageSize],
                    function(err, data) {
                        if (err) {
                        	// Log.insertLog(mobile,"car--getCar","select * from car  order by id desc limit ?,?");
                            console.log(err);
                            errorHandler(res, err.message);
                        } else {
                            // ret = {};
                            // ret["status"] = "success";
                            // ret["data"] = data;
                            // Log.insertLog(mobile,"分页获取car列表","select * from car  order by id desc limit ?,?");
                            // res.json({ "code": 200, "data": ret });
                            
                            // 随机更新车辆位置
                            var tmpsql = "update " + CAR_TABLE + " set SmX = SmX + floor(rand()*1000 - 500), SmY = SmY + floor(rand()*1000 - 500) order by rand() limit 30";
                            db.query(tmpsql, [], function(merr, mdata){
                                ret = {};
                                ret["status"] = "success";
                                ret["data"] = data;
                                //Log.insertLog(mobile,"分页获取car列表", sql);
                                res.json({ "code": 200, "data": ret });
                            });
                        }
                    });
            }
        });
    } catch (e) {
        errorHandler(res, "未知错误");
    }
}

//获取单个车辆信息
function getSingleCarInfo(req, res) {
    var query = req.body;
    try {
        var mobile = query.mobile;
        check(query, res, function() {
            var id = query.id || -1;
            // console.log(id);
            if (id == -1) {
                errorHandler(res, "参数错误");
            } else {
                // var sql = "select * from car where id=?";
                var sql = "select * from " + CAR_TABLE + " where SmID=?";
                db.query(sql, [id],
                    function(err, data) {
                        if (err) {
                        	// Log.insertLog(mobile,"car--getSingleCarInfo","select * from car where id=?");
                            console.log(err);
                            errorHandler(res, err.message);
                        } else {
                            ret = {};
                            ret["status"] = "success";
                            ret["data"] = data;
                            //Log.insertLog(mobile,"car--getSingleCarInfo","select * from car where id=?");
                            res.json({ "code": 200, "data": ret });
                        }
                    });
            }
        });
    } catch (e) {
        errorHandler(res, "未知错误");
    }
}

//按车牌号搜索车辆
function searchCar(req, res) {
    var query = req.body;
    try {
        check(query, res, function() {
            var car_no = query.car_no;
            // var sql = "select * from car where car_no like '%"+car_no+"%' order by id desc";
            var sql = "select * from " + CAR_TABLE + " where car_no like '%"+car_no+"%' order by SmID desc";
            db.query(sql, 
                [car_no],
                function(err, data) {
                	if (err) {
                		/* Log.insertLog(mobile,"car--searchCar","select * from car where car_no like " +
                db.escape('%' + keyword + '%') +
                " order by id desc"); */
                        console.log(err);
                        errorHandler(res, err.message);
                    } else {
                        ret = {};
                        ret["status"] = "success";
                        ret["data"] = data;
                        /* Log.insertLog(mobile,"car--searchCar","select * from car where car_no like " +
                                db.escape('%' + keyword + '%') +
                                " order by id desc"); */
                        res.json({ "code": 200, "data": ret });
                    }
                });
        });
    } catch (e) {
        errorHandler(res, "未知错误");
    }
}

//获取车辆当前位置
function getCarPosition(req,res){
	var query = req.body;
	try{
		check(query,res,function(){
			var Id = query.Id || -1;
			if (Id == -1) {
                errorHandler(res, "参数错误");
            } else {
            	//需要对接接口,自己获取不了
            	var centerX = 500377.96;
            	var centerY = 305971.1;
            	var data = {longitude:centerX+Math.random(),
            				latitude:centerY+Math.random()
            				};
            	var ret = {};
                ret["status"] = "success";
                ret["data"] = data;
                //Log.insertLog(mobile,"获取car位置","getCarPosition");
                res.json({ "code": 200, "data": ret });
            }
		});
	} catch(e) {
		errorHandler(res, "未知错误");
	}
}

//获取车辆轨迹
function getCarTrack(req,res){
	var query = req.body;
	try{
		check(query,res,function(){
			var Id = query.Id || -1;
			if (Id == -1) {
                errorHandler(res, "参数错误");
            } else {
            	var centerX = 305971.1;
            	var centerY = 305971.1;
            	var track = [];
          		track.push({"longitude":499000.91363,"latitude":305156.92169});
                track.push({"longitude":498978.15278,"latitude":305646.27997});
                track.push({"longitude":499968.24976,"latitude":305638.69302});
                track.push({"longitude":499934.10849,"latitude":306228.68165});
                track.push({"longitude":500689.01002,"latitude":306241.85555});
                track.push({"longitude":501421.15070,"latitude":306249.44250});
                track.push({"longitude":501424.94417,"latitude":305657.66039});

            	var ret = {};
                ret["status"] = "success";
                ret["data"] = track;
                //Log.insertLog(mobile,"获取car路径","getCarTrack");
                res.json({ "code": 200, "data": ret });
            }
		});
	} catch(e) {
		errorHandler(res, "未知错误");
	}
}


/*******************************************************/
function errorHandler(res, desc) {
    res.json({ "code": 300, "data": { "status": "fail", "error": desc } });
}

function check(query, res, callback) {
    var mobile = query.mobile;
    var token = query.token;
    User.checkMobile2Token(mobile, token, function(result) {
        if (result) {
        	// Log.insertLog(mobile,"car--check","insert into car values(?,?)");
            callback();
        } else {
            errorHandler(res, "账号和token不匹配");
        }
    });
}


/******************************忧伤的分割线******************************/
/*
 *获取车辆的所有属性
 *@param type 1=>获取用户自定义属性,-1=>获取所有属性,默认－1
 */
function getCarAttrs(req,res){
    var query = req.body;
    try {
        var mobile = query.mobile;
        var token = query.token;
        User.getUserInfo(mobile, token, function(user) {
            if (user.error == 0) {
                // user_info = user.data;
                var type = query.type || -1;
                if(type==-1){
                    var sql = "select * from car_attr";
                    var data = Array();
                } else {
                    var sql = "select * from car_attr where Id>?";
                    var data = [6];
                }
                db.query(sql,data,function(err,rows){
                    if (err) {
                    	//  Log.insertLog(mobile,"car--getCarAttrs","select * from car_attr");
                        res.json({
                            "code": 501,
                            "data": {
                                "status": "fail",
                                "error": err.message
                            }
                        });
                    } else {
                    	 //Log.insertLog(mobile,"获取car属性","select * from car_attr where Id>?");
                        res.json({
                            "code": 200,
                            "data": {
                                "status": "success",
                                "error": "success",
                                "rows": rows
                            }
                        });
                    }
                });
            } else {
                res.json({
                    "code": 301,
                    "data": {
                        "status": "fail",
                        "error": "用户未登录"
                    }
                });
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
/*
 *添加车辆属性
 *@param attr_name=>属性名字
 *@param attr_desc=>属性描述
 */
function addCarAttr(req,res){
    var query = req.body;
    try {
        var mobile = query.mobile;
        var token = query.token;
        User.getUserInfo(mobile, token, function(user) {
            if (user.error == 0) {
                // user_info = user.data;
                var attr_name = query.attr_name || -1;
                var attr_desc = query.attr_desc || -1;
                var attr_comment = query.attr_comment || -1;
                var attr_show_1 = query.attr_show_1 || 1;
                var attr_show_2 = query.attr_show_2 || 1;
                var attr_show_3 = query.attr_show_3 || 1;
                var reg= /^[A-Za-z]+$/;
                if(attr_name==-1 || attr_desc==-1 || attr_comment==-1){
                    res.json({
                        "code": 303,
                        "data": {
                            "status": "fail",
                            "error": "参数错误"
                        }
                    });
                    return;
                }
                if(reg.test(attr_name)){
                    //给car表添加字段
                    // var sql = "alter table car add column "+attr_name+" varchar(1000)";
                    var sql = "alter table " + CAR_TABLE + " add column "+attr_name+" varchar(200)";
                    var dataArr = [];
                    db.query(sql,dataArr,function(err,rows){
                        if(err){
                        	//  Log.insertLog(mobile,"car--addCarAttr","alter table car add column attr_name varchar(1000)");
                            res.json({
                                "code": 501,
                                "data": {
                                    "status": "fail",
                                    "error": err.message
                                }
                            });
                        } else {
                            //给car_attr添加记录
                            sql = "insert into car_attr(attr_name,attr_desc,attr_comment,attr_show_1,attr_show_2,attr_show_3)"+
                                    "values(?,?,?,?,?,?)";
                            dataArr = [attr_name,attr_desc,attr_comment,attr_show_1,attr_show_2,attr_show_3];
                            db.query(sql,dataArr,function(err,rows){
                                if(err){
                                	//  Log.insertLog(mobile,"car--addCarAttr","insert into car_attr(attr_name,attr_desc,attr_comment,attr_show_1,attr_show_2,attr_show_3) values(?,?,?,?,?,?)");
                                    res.json({
                                        "code": 502,
                                        "data": {
                                            "status": "fail",
                                            "error": err.message
                                        }
                                    }); 
                                } else {
                               	 Log.insertLog(mobile,"添加车辆属性", sql);
                                    res.json({
                                        "code": 200,
                                        "data": {
                                            "status": "success",
                                            "error": "success"
                                        }
                                    });   
                                }
                            });
                        }
                    });
                } else {
                    res.json({
                        "code": 302,
                        "data": {
                            "status": "fail",
                            "error": "属性名称必须为英文字母"
                        }
                    });
                    return;    
                }
            } else {
                res.json({
                    "code": 301,
                    "data": {
                        "status": "fail",
                        "error": "用户未登录"
                    }
                });
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

/*
 *编辑车辆属性
 *@param attrId=>属性Id >6 is needed
 *@param attrNewName=>属性名字
 *@param attrNewDesc=>属性描述
 */
function editCarAttr(req,res){
    var query = req.body;
    try {
        var mobile = query.mobile;
        var token = query.token;
        User.getUserInfo(mobile, token, function(user) {
            if (user.error == 0) {
                // user_info = user.data;
                var attrId = query.attrId || -1;
                var attrNewName = query.attrNewName || -1;
                var attrNewDesc = query.attrNewDesc || -1;
                var attrNewComment = query.attrNewComment || -1;
                var attr_show_1 = query.attr_show_1 || 1;
                var attr_show_2 = query.attr_show_2 || 1;
                var attr_show_3 = query.attr_show_3 || 1;
                if(attrId==-1 || attrNewName==-1 || attrNewDesc==-1){
                    res.json({
                        "code": 302,
                        "data": {
                            "status": "fail",
                            "error": "参数错误"
                        }
                    });
                    return;    
                } else {
                    if(attrId<7){
                        res.json({
                            "code": 403,
                            "data": {
                                "status": "fail",
                                "error": "前6项属性不允许修改"
                            }
                        });
                        return;    
                    }
                    //获取对应Id的字段名称
                    db.query("select attr_name from car_attr where Id=?",
                        [parseInt(attrId)],function(err,rows){
                            if(rows && rows.length && rows[0].attr_name){
                                var attrName = rows[0].attr_name;
                                //更新car表
                                // var sql = "alter table car change "+attrName+" "+attrNewName+" varchar(1000)";
                                var sql = "alter table " + CAR_TABLE + " change "+attrName+" "+attrNewName+" varchar(200)";
                                db.query(sql,[],function(err,rows){
                                    if(err){
                                      	//  Log.insertLog(mobile,"car--addCarAttr","alter table car change attrNewName varchar(1000)");
                                        res.json({
                                            "code": 501,
                                            "data": {
                                                "status": "fail",
                                                "error": err.message
                                            }
                                        }); 
                                    } else {
                                        //更新car_attr表
                                        sql = "update car_attr set attr_name=?,attr_desc=?,attr_comment=?,attr_show_1=?,attr_show_2=?,attr_show_3=? where Id=?";
                                        db.query(sql,[attrNewName,attrNewDesc,attrNewComment,parseInt(attr_show_1),parseInt(attr_show_2),parseInt(attr_show_3),parseInt(attrId)],function(err,rows){
                                            if(err){
                                           	//  Log.insertLog(mobile,"car--editCarAttr","update car_attr set attr_name=?,attr_desc=?,attr_comment=?,attr_show_1=?,attr_show_2=?,attr_show_3=? where Id=?");
                                                console.log(err);
                                                res.json({
                                                    "code": 502,
                                                    "data": {
                                                        "status": "fail",
                                                        "error": err.message
                                                    }
                                                }); 
                                            } else {
                                              	 Log.insertLog(mobile,"编辑车辆属性", sql);
                                                res.json({
                                                    "code": 200,
                                                    "data": {
                                                        "status": "success",
                                                        "error": "success"
                                                    }
                                                });   
                                            }
                                        });
                                    }
                                });

                            } else {
                                res.json({
                                    "code": 401,
                                    "data": {
                                        "status": "fail",
                                        "error": "属性未找到"
                                    }
                                });         
                            }
                        });
                }
            } else {
                res.json({
                    "code": 301,
                    "data": {
                        "status": "fail",
                        "error": "用户未登录"
                    }
                });
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

//编辑摄像头属性的展示方式
function editCarAttrShow(req, res) {
    var query = req.body;
    try {
        var mobile = query.mobile;
        var token = query.token;
        User.getUserInfo(mobile, token, function (user) {
            if (user.error == 0) {
                var attrId = query.attrId;
                var attr_show_1 = query.attr_show_1;
                var attr_show_2 = query.attr_show_2;
                var attr_show_3 = query.attr_show_3;
                var sql = "update car_attr set attr_show_1=?,attr_show_2=?,attr_show_3=? where Id=?";
                db.query(sql,
                    [attr_show_1, attr_show_2, attr_show_3, attrId],
                    function (err, result) {
                        if (err) {
                          	//  Log.insertLog(mobile,"car--editCarAttrShow","update car_attr set attr_show_1=?,attr_show_2=?,attr_show_3=? where Id=?");
                            res.json({
                                "code": 404,
                                "data": {
                                    "status": "fail",
                                    "error": err.message
                                }
                            });
                        } else {
                        	Log.insertLog(mobile,"编辑车辆属性展示", sql);
                            res.json({
                                "code": 200,
                                "data": {
                                    "status": "success",
                                    "error": "success"
                                }
                            });
                        }
                    });
            } else {
                res.json({
                    "code": 301,
                    "data": {
                        "status": "fail",
                        "error": "用户未登录"
                    }
                });
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

/**
 * 指定字段获取车辆列表
 * @param  {[type]} req [description]
 * @param  {[type]} res [description]
 * @return {[type]}     [description] 
 */
function getCarListByAttr(req, res) {
    var query = req.body;
    var mobile=query.mobile;
    attrName = query.attrName || '';
    if (dbCarTableAttr.carAttrList.indexOf(attrName) == -1) {
        res.json({
            "code": 401,
            "data": {
                "status": "fail",
                "error": "属性名称不存在"
            }
        });
        return;
    }
    attrValue = query.attrValue || '';
    if (checked.isNull(attrValue)) {
        res.json({
            "code": 401,
            "data": {
                "status": "fail",
                "error": "属性值为空"
            }
        });
        return;
    }
    try {
        // var sql = "select count(*) as total from car where is_del = 0 and " + attrName + " like " + "'%" + attrValue + "%'";
        var sql = "select count(*) as total from " + CAR_TABLE + " where is_del = 0 and " + attrName + " like " + "'%" + attrValue + "%'";
        // var dataArr = [attrName, attrValue];
        var dataArr = [];
        db.query(sql, dataArr, function(err, rows) {
            if (err) {
            	// Log.insertLog(mobile,"car--getCarListByAttr","select count(*) as total from car where is_del = 0 and   attrName like attrValue%");
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
                var start = (page - 1) * pageSize;
                if (-1 == page) {
                    // sql = "select * from car where is_del = 0 and " + attrName + " like " + "'%" + attrValue + "%'";
                    sql = "select * from " + CAR_TABLE + " where is_del = 0 and " + attrName + " like " + "'%" + attrValue + "%'";
                    pageSize = total;
                    dataArr = [];
                } else {
                    // sql = "select * from car where is_del = 0 and " + attrName + " like " + "'%" + attrValue + "%'" + " order by id limit ?, ?";
                    sql = "select * from " + CAR_TABLE + " where is_del = 0 and " + attrName + " like " + "'%" + attrValue + "%'" + " order by SmID limit ?, ?";
                    dataArr = [start, parseInt(pageSize)];
                }
                db.query(sql, dataArr, function(err, rows) {
                    if (err) {
                    	// Log.insertLog(mobile,"car--getCarListByAttr","select * from car where is_del = 0 and  attrValue ");
                        res.json({
                            "code": 501,
                            "data": {
                                "status": "fail",
                                "error": err.message
                            }
                        });
                    } else {
                    	//Log.insertLog(mobile,"根据car属性展示", sql);
                        res.json({
                            "code": 200,
                            "data": {
                                "status": "success",
                                "error": "success",
                                "rows": rows,
                                "total": total,
                                "page": page,
                                "pageSize": pageSize
                            }
                        });
                    }
                });
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
/******************************忧伤的分割线******************************/

exports.addCar = addCar;
exports.delCar = delCar;
exports.getCar = getCar;
exports.getSingleCarInfo = getSingleCarInfo;
exports.searchCar = searchCar;
exports.getCarPosition = getCarPosition;
exports.getCarTrack = getCarTrack;

/******************************忧伤的分割线******************************/
exports.getCarAttrs = getCarAttrs;
exports.addCarAttr = addCarAttr;
exports.editCarAttr = editCarAttr;
exports.editCarAttrShow = editCarAttrShow;
exports.getCarListByAttr = getCarListByAttr;

// exports.test = test;