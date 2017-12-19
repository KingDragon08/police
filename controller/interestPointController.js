// var DB_CONFIG = require("../config/dbconfig");
// var mysql = require('mysql');
var crypto = require('crypto');
var Sync = require('sync');
var User = require('../controller/userController')
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

//添加兴趣点
function addPoint(req,res){
	var query = req.body;
	try{
		var mobile = query.mobile;
		var token = query.token;
		User.checkMobile2Token(mobile,token,function(result){
			if(result){
				var name = query.name || "unknown";
				var longitude = query.longitude || 0;
				var latitude = query.latitude || 0;
				var desc = query.desc || 0;
				conn.query("insert into interestPoint(name,longitude,"+
							"latitude,`desc`,status)values(?,?,?,?,?)",
							[name,longitude,latitude,desc,1],
							function(err,data){
								if(err){
									console.log(err);
									errorHandler(res,"添加兴趣点失败");
								} else {
									Log.insertLog(mobile,"添加兴趣点","addPoint");
									res.json({"code": 200, "data":{"status":"success","error":"success"}});
								}
							});
			} else {
				errorHandler(res,"账号和token不匹配");
			}
		});
	} catch(e) {
		console.log(e);
		errorHandler(res,"未知错误");
	}
}

//删除兴趣点
function delPoint(req,res){
	var query = req.body;
	try{
		var mobile = query.mobile;
		var token = query.token;
		User.checkMobile2Token(mobile,token,function(result){
			if(result){
				var Id = query.Id;
				conn.query("update interestPoint set status=0 where Id=?",
					[Id],
					function(err,data){
						if(err){
							console.log(err);
							errorHandler(res,"删除兴趣点失败");
						} else {
							Log.insertLog(mobile,"删除兴趣点","update interestPoint set status=0 where Id=?");
							res.json({"code": 200, "data":{"status":"success","error":"success"}});
						}
					});
			} else {
				errorHandler(res,"账号和token不匹配");
			}
		});
	} catch(e) {
		console.log(e);
		errorHandler(res,"未知错误");
	}
}

//获取兴趣点
function getPoint(req,res){
	var query = req.body;
	try{
		var mobile = query.mobile;
		var token = query.token;
		User.checkMobile2Token(mobile,token,function(result){
			if(result){
				var type = query.type || 1;
				var page = query.page || 1;
				var pageSize = query.pageSize || 20;
				var sql = "";
				//前端界面，一次性返回所有兴趣点
				if(type==1){
					sql = "select Id,name,longitude,latitude,`desc` from "+
							"interestPoint where status=? order by Id desc";
				} else {
					//管理界面，分页获取兴趣点
					if(page<1){
						page = 1;
					}
					var start = (page-1)*pageSize;
					sql = "select Id,name,longitude,latitude,`desc` from "+
							"interestPoint where status=? order by Id desc "+
							"limit " + start + "," + pageSize;
				}
				conn.query(sql,[1],function(err,data){
					if(err){
						console.log(err);
						errorHandler(res,"获取兴趣点失败");
					} else {
						var ret = {};
						ret["status"] = "success";
						ret["data"] = data;
						//Log.insertLog(mobile,req.url,sql);
						res.json({"code":200,"data":ret});
					}
				});
			} else {
				errorHandler(res,"账号和token不匹配");
			}
		});
	} catch(e) {
		console.log(e);
		errorHandler(res,"未知错误");
	}
}

//更新兴趣点
function updatePoint(req,res){
	var query = req.body;
	try{
		var mobile = query.mobile;
		var token = query.token;
		User.checkMobile2Token(mobile,token,function(result){
			if(result){
				var Id = query.Id || 0;
				var name = query.name || "unknown";
				var longitude = query.longitude || 0;
				var latitude = query.latitude || 0;
				var desc = query.desc || 0;
				var status = 1;
				if(Id==0){
					errorHandler(res,"参数错误");
				} else {
					conn.query("update interestPoint set name=?,longitude=?,"+
								"latitude=?,`desc`=?,status=? where Id=?",
								[name,longitude,latitude,desc,status,Id],
								function(err,data){
									if(err){
										console.log(err);
										errorHandler(res,"编辑兴趣点失败");
									} else {
										Log.insertLog(mobile,"编辑兴趣点","update interestPoint set name=?,longitude=?,latitude=?,`desc`=?,status=? where Id=?");
										res.json({"code": 200, "data":{"status":"success","error":"success"}});	
									}
								});
				}
			} else {
				errorHandler(res,"账号和token不匹配");
			}
		});
	} catch(e) {
		console.log(e);
		errorHandler(res,"未知错误");
	}
}

//关键字模糊搜索兴趣点
function searchPoint(req,res){
	var query = req.body;
	try{
		check(query,res,function(){
			var keyword = query.keyword;
			conn.query("select Id,name,longitude,latitude,`desc` "+
							"from interestPoint where name like " +
							conn.escape('%' + keyword + '%') +
							" order by Id desc",
							[keyword],
							function(err,data){
								if(err){
									console.log(err);
									errorHandler(res,"关键字模糊搜索兴趣点失败");
								} else {
									ret = {};
									ret["status"] = "success";
									ret["data"] = data;
									// Log.insertLog(mobile,req.url,"select Id,name,longitude,latitude,`desc` "+
									// 				"from interestPoint where name like " +
									// 				conn.escape('%' + keyword + '%') +
									// 				" order by Id desc");
									res.json({"code":200,"data":ret});
								}
							});
		});
	} catch(e) {
		console.log(e);
		errorHandler(res,"未知错误");
	}
}

/***************************
************公用部分**********
****************************/
function errorHandler(res,desc){
	res.json({"code": 300, "data":{"status":"fail","error":desc}});
}

function check(query,res,callback){
	var mobile = query.mobile;
	var token = query.token;
	User.checkMobile2Token(mobile,token,function(result){
		if(result){
			callback();
		} else {
			errorHandler(res,"账号和token不匹配");
		}
	});
}


exports.addPoint = addPoint;
exports.delPoint = delPoint;
exports.getPoint = getPoint;
exports.updatePoint = updatePoint;
exports.searchPoint = searchPoint;


