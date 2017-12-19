// var DB_CONFIG = require("../dbconfig");
// var mysql = require('mysql');
// var crypto = require('crypto');
// var Sync = require('sync');
var conn = require("../lib/db");
var Log=require("./logController");

/* var conn = mysql.createConnection({
host: DB_CONFIG.host,
user: DB_CONFIG.user,
password: DB_CONFIG.password,
database:DB_CONFIG.database,
port: DB_CONFIG.port
});
conn.connect(); */

/******************************忧伤的分割线******************************/
//模糊查询地址；
function addressTestGetByName(req, res) {
    var query = req.body;
    try {
        console.log(query);	
    	var name = query.name || "-1";
        if (name == "-1") {
        	res.json({ "code": 300, "data": { "status": "error", "error": "参数为空" } });
        } else {
        	var sql = "select * from t_addr where addr_name like '%"+name+"%'";
            conn.query(sql,function(err,data){
            	if(err){
                	//Log.insertLog(mobile,"address--addressTestGetByName","select * from t_addr where addr_name like name");
            		res.json({ "code": 300, "data": { "status": "error", "error": err } });
            	}else
            		//Log.insertLog(mobile,"address--addressTestGetByName","select * from t_addr where addr_name like name");
            		res.json({ "code": 200, "data": { "status": "success", "message": data } });
            	});
        	};
        }catch (e) {
    	console.log(e.message);
    }
}

/******************************忧伤的分割线******************************/
exports.addressTestGetByName = addressTestGetByName;