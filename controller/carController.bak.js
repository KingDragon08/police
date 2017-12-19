// var DB_CONFIG = require("../config/dbconfig");
// var mysql = require('mysql');
var crypto = require('crypto');
var Sync = require('sync');
var User = require('../controller/userController')

// var conn = mysql.createConnection({
//     host: DB_CONFIG.host,
//     user: DB_CONFIG.user,
//     password: DB_CONFIG.password,
//     database: DB_CONFIG.database,
//     port: DB_CONFIG.port
// });
// conn.connect();

var conn = require("../lib/db");
var Log = require('./logController')

//添加车辆
function addCar(req, res) {
    var query = req.body;
    try {
        check(query, res, function() {
            var NO = query.NO || -1;
            var type = parseInt(query.type) || 1;
            if (NO == -1) {
                errorHandler(res, "参数错误");
            } else {
                conn.query("insert into car(NO,type)values(?,?)", [NO, type],
                    function(err, result) {
                        if (err) {
                            console.log(err);
                            errorHandler(res, err.message);
                        } else {
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
        check(query, res, function() {
            var Id = query.Id || -1;
            if (Id == -1) {
                errorHandler(res, "参数错误");
            } else {
                conn.query("delete from car where Id=?", [Id],
                    function(err, result) {
                        if (err) {
                            console.log(err);
                            errorHandler(res, err.message);
                        } else {
                            res.json({ "code": 200, "data": { "status": "success", "error": "success" } });
                        }
                    });
            }
        });
    } catch (e) {
        errorHandler(res, "未知错误");
    }
}

//分类分页获取车辆或获取全部车辆
function getCar(req, res) {
    var query = req.body;
    try {
        check(query, res, function() {
            var page = parseInt(query.page) || -1;
            var pageSize = parseInt(query.pageSize) || 20;
            var type = parseInt(query.type) || 1;
            if (page == -1) {
                conn.query("select Id,NO from car where type=? order by Id desc", [type],
                    function(err, data) {
                        if (err) {
                            console.log(err);
                            errorHandler(res, err.message);
                        } else {
                            ret = {};
                            ret["status"] = "success";
                            ret["data"] = data;
                            res.json({ "code": 200, "data": ret });
                        }
                    });
            } else {
                if (page < 1) {
                    page = 1;
                }
                var start = (page - 1) * pageSize;
                conn.query("select Id,NO from car where type=? order by Id " +
                    "desc limit ?,?", [type, start, pageSize],
                    function(err, data) {
                        if (err) {
                            console.log(err);
                            errorHandler(res, err.message);
                        } else {
                            ret = {};
                            ret["status"] = "success";
                            ret["data"] = data;
                            res.json({ "code": 200, "data": ret });
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
        check(query, res, function() {
            var Id = query.Id || -1;
            if (Id == -1) {
                errorHandler(res, "参数错误");
            } else {
                conn.query("select * from car where Id=?", [Id],
                    function(err, data) {
                        if (err) {
                            console.log(err);
                            errorHandler(res, err.message);
                        } else {
                            ret = {};
                            ret["status"] = "success";
                            ret["data"] = data;
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
            var keyword = query.keyword;
            conn.query("select * from car where NO like " +
                conn.escape('%' + keyword + '%') +
                " order by Id desc", [keyword],
                function(err, data) {
                	if (err) {
                        console.log(err);
                        errorHandler(res, err.message);
                    } else {
                        ret = {};
                        ret["status"] = "success";
                        ret["data"] = data;
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
                res.json({ "code": 200, "data": ret });
            }
		});
	} catch(e) {
		errorHandler(res, "未知错误");
	}
}

function getCarAttrs(req,res){
    var query = req.body;
    try{
        check(query,res,function(){
            res.json({
                code:200,
                data:{
                    status:'success',
                    data:{
                        'Id':'Id',
                        'NO':'车牌号',
                        'type':'车辆类型',
                        'state':'暂时使用'
                    }
                }
            });
        });
    } catch(e) {
        errorHandler(ers,e.message);
    }
}


//函数模板
function funcName(req,res){
    var query = req.body;
    try{
        check(query,res,function(){
            
        });
    } catch(e) {
        errorHandler(ers,e.message);
    }
}


/*******************************************************
 ***********************公用部分***************************
 ********************************************************/
function errorHandler(res, desc) {
    res.json({ "code": 300, "data": { "status": "fail", "error": desc } });
}

function check(query, res, callback) {
    var mobile = query.mobile;
    var token = query.token;
    User.checkMobile2Token(mobile, token, function(result) {
        if (result) {
            callback();
        } else {
            errorHandler(res, "账号和token不匹配");
        }
    });
}

exports.addCar = addCar;
exports.delCar = delCar;
exports.getCar = getCar;
exports.getSingleCarInfo = getSingleCarInfo;
exports.searchCar = searchCar;
exports.getCarPosition = getCarPosition;
exports.getCarTrack = getCarTrack;
exports.getCarAttrs = getCarAttrs;
