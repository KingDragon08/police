var DB_CONFIG = require("../dbconfig");
var mysql = require('mysql');

var pool = mysql.createPool({
    host: DB_CONFIG.host,
    user: DB_CONFIG.user,
    password: DB_CONFIG.password,
    database:DB_CONFIG.database,
    port: DB_CONFIG.port
});

// function query(sql,callback){
//     conn.getConnection(function(err,connection){
//         connection.query(sql, function (err,rows) {
//             callback(err,rows);
//             connection.release();
//         });
//     });
// }

function query(sql,options,callback){
    pool.getConnection(function(err,conn){
        if(err){
            callback(err,null,null);
        }else{
            conn.query(sql,options,function(err,results,fields){
                //释放连接
                conn.release();
                //事件驱动回调
                callback(err,results,fields);
            });
        }
    });
};


exports.query = query;