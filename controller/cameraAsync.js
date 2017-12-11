//摄像头数据与地图数据同步,必须在不执行其他sql语句时使用
var db = require("../lib/db");
var Log = require('./logController')

var map_db_name = "xc_baymin";
var map_table_name = "smdtv_2";

//创建新的摄像头
function createNewCamera(cam_id, X, Y, cam_sta, callback) {
	callback(true);
	return;
	//插入一条新纪录到摄像头表
    db.query("insert into "+map_db_name+"."+map_table_name+"(cam_id,SmX,SmY,cam_sta,is_del)values(?,?,?,?,?)", [cam_id, X, Y, cam_sta, 0],
        function(err, result) {
            if (err) {
                callback(false);
            } else {
                //更新smregister
                db.query("update "+map_db_name+".smregister set SmRecordCount=SmRecordCount+1 where SmDatasetID=?", [2], function(err, result) {
                    if (err) {
                        callback(false);
                    } else {
                        callback(true);
                    }
                });
            }
        });
}

//删除摄像头
function deleteCamera(cam_id,callback){
	// db.query("update "+map_db_name+"."+map_table_name+" set is_del=? where cam_id=?",[1,cam_id],
	// 	function(err,result){
	// 		if(err){
	// 			callback(false);
	// 		} else {
	// 			callback(true);
	// 		}
	// 	});
	//真的要删数据库了,whatafuckingday
	callback(true);
	return;
	db.query("delete from "+map_db_name+"."+map_table_name+" where cam_id=?",
				[cam_id],
				function(err,result){
					if(err){
						callback(false);
					} else {
						callback(true);
					}
				});
}

//更新摄像头状态
function updateCamera(cam_id,X,Y,cam_sta,callback){
	callback(true);
	return;
	db.query("update "+map_db_name+"."+map_table_name+" set SmX=?,SmY=?,cam_sta=? where cam_id=?",[X,Y,cam_sta,cam_id],
		function(err,result){
			if(err){
				callback(false);
			} else {
				callback(true);
			}
		});
}



exports.createNewCamera = createNewCamera;
exports.deleteCamera = deleteCamera;
exports.updateCamera = updateCamera;


