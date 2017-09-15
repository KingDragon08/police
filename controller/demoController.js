var DB_CONFIG = require("../dbconfig");
var mysql = require('mysql');
var conn = mysql.createConnection({
    host: DB_CONFIG.host,
    user: DB_CONFIG.user,
    password: DB_CONFIG.password,
    database:DB_CONFIG.database,
    port: DB_CONFIG.port
});

function demo(req,res){
	var query = req.query;
	var name = query.name;
	var password =query.password;
	res.json({name:name,password:password});
}

exports.demo = demo;