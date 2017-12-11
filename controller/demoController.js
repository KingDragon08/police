// var DB_CONFIG = require("../config/dbconfig");
// var mysql = require('mysql');
// var conn = mysql.createConnection({
//     host: DB_CONFIG.host,
//     user: DB_CONFIG.user,
//     password: DB_CONFIG.password,
//     database:DB_CONFIG.database,
//     port: DB_CONFIG.port
// });

// conn.connect();

var conn = require("../lib/db");
var Log = require('./logController')

function demo(req,res){
	var query = req.query;
	var name = query.name;
	var password =query.password;
	res.json({name:name,password:password});
}

// function test(req,res){
// 	conn.query("truncate table camera");
// 	createCameraPosition(500377.96,305971.1,100,function(){
// 		res.json({"data":"ok"});
// 	});
// }

function createCameraPosition(x,y,times,callback){
	var xp = Math.random()>=0.5?1:-1;
	var rx = Math.random()*1000*xp + x;
	var yp = Math.random()>=0.5?1:-1;
	var ry = Math.random()*1000*yp + y;
	var status = parseInt(Math.random()*3);
	var timestamp = new Date().getTime();
	conn.query("insert into camera(cam_no,cam_name,cam_sta,addtime,"+
				"uptime,user_id,cam_loc_lan,cam_loc_lon,cam_desc,cam_addr)"+
				"values(?,?,?,?,?,?,?,?,?,?)",
				["cam_"+times,"cam_"+times,status,timestamp,timestamp,
				1,ry,rx,"cam_"+times+"_desc","cam_"+times+"_addr"],
				function(err,result){
					if(times>0){
						times--;
						createCameraPosition(x,y,times,callback);
					} else {
						callback();
					}
				});
}

exports.demo = demo;
