var db = require("db");

// create table `camera`(
//     `cam_id` int(32) not null auto_increment comment '设备记录id',
//     `cam_no` varchar(32) not null comment '设备编号',
//     `cam_name` varchar(16) comment '设备名称',
//     `cam_loc` varchar(32) comment '设备位置',
//     `cam_sta` tinyint(2) unsigned not null default '0' comment '设备状态',
//     `addtime` varchar(32) comment '创建时间',
//     `uptime` varchar(32) comment '更新时间',
//     primary key (`cam_id`)
// ) default charset=utf8;


// 获取参数
function getParams(req,res){
    var cam_no = req.cam_no;
    var cam_name = req.cam_name;
    var cam_loc = req.cam_loc;
    var cam_sta = req.cam_sta;

	res.json({cam_no:cam_no,cam_name:cam_name,cam_loc:cam_loc,cam_sta:cam_sta});
}

// 添加摄像头
function addCamera(req,res){
	var query = req.query;
	try{
        var cam_no = req.cam_no;
        var cam_name = req.cam_name;
        var cam_loc = req.cam_loc;
        var cam_sta = req.cam_sta;
        var addtime = new Date().getTime();

        var sql = "select count(*) ad count from camera where cam_no = " + cam_no;

        db.query(sql, function(err,rows){
               if(err){
                   res.json({"code": 500, "data":{"status":"fail","error":err.message}});
               }else {
                   if(rows[0].count > 0 ){
                       res.json({"code": 400, "data":{"status":"fail","error":"camera exist"}});
                   }
                   else {
                       sql = "insert into camera (cam_no, cam_name, cam_loc, cam_sta, addtime, uptime) ";
                       sql += "values(" +cam_no+ ", " + cam_name + ", " + cam_loc + "," + cam_sta + ", " + addtime + ", " + addtime + ")";
                       db.query(sql, function(err,rows){
                              if(err){
                                  res.json({"code": 500, "data":{"status":"fail","error":err.message}});
                              }else {
                                  res.json({"code": 200, "data":{"status":"success","error":"success"}});
                              }
                          });
                   }
               }
           });
	} catch(e) {
		res.json({"code": 500, "data":{"status":"fail","error":e.message}});
	}
}

// 删除摄像头
function delCamera(req,res){
	var query = req.query;
	try{
        var cam_id = req.cam_id;
        var cam_no = req.cam_no;

        var sql = "select count(*) ad count from camera where cam_no = " + cam_no + " and cam_id = " + cam_id;

        db.query(sql, function(err,rows){
               if(err){
                   res.json({"code": 500, "data":{"status":"fail","error":err.message}});
               }else {
                   if(rows[0].count > 0 ){
                       sql = "delete from camera where cam_id = " + cam_id+" and cam_no" + cam_no;
                       db.query(sql, function(err,rows){
                              if(err){
                                  res.json({"code": 500, "data":{"status":"fail","error":err.message}});
                              }else {
                                  res.json({"code": 200, "data":{"status":"success","error":"success"}});
                              }
                          });

                   }
                   else {
                       res.json({"code": 400, "data":{"status":"fail","error":"camera not exist"}});
                   }
               }
           });
	} catch(e) {
		res.json({"code": 500, "data":{"status":"fail","error":e.message}});
	}
}


exports.getParams = getParams;
exports.addCamera = addCamera;
