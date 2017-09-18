var db = require("./db");

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
    var query = req.body;

    console.log(query);

    var cam_no = query.cam_no;
    console.log(cam_no);
    var cam_name = query.cam_name;
    var cam_loc = query.cam_loc;
    var cam_sta = query.cam_sta;

	res.json({cam_no:cam_no,cam_name:cam_name,cam_loc:cam_loc,cam_sta:cam_sta});
}

// 添加摄像头
function addCamera(req,res){
	var query = req.body;
	try{
        var cam_no = query.cam_no;
        var cam_name = query.cam_name;
        var cam_loc = query.cam_loc;
        var cam_sta = query.cam_sta;
        var addtime = new Date().getTime();

        // var sql = "select count(*) as total from camera where cam_no = '" + cam_no +"'";
        var sql = "select count(*) as total from camera where cam_no = ?";

        db.query(sql, [cam_no], function(err,rows){
               if(err){
                   res.json({"code": 500, "data":{"status":"fail","error":err.message}});
               }else {
                   if(rows[0].total > 0 ){
                       res.json({"code": 400, "data":{"status":"fail","error":"camera exist"}});
                   }
                   else {
                       sql = "insert into camera (cam_no, cam_name, cam_loc, cam_sta, addtime, uptime) ";
                       sql += "values(?, ?, ?, ?, ?, ?)";

                       var dataArr = [cam_no, cam_name, cam_loc, cam_sta, addtime, addtime];

                       db.query(sql, dataArr, function(err,rows){
                              if(err){
                                  res.json({"code": 500, "data":{"status":"fail","error":err.message}});
                              }else {
                                  res.json({"code": 200, "data":{"status":"success","error":"success", "rows": rows_c}});
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
	var query = req.body;
	try{
        var cam_id = query.cam_id;
        var cam_no = query.cam_no;

        var sql = "select count(*) as total from camera where cam_no = ? and cam_id = ?";
        var dataArr = [cam_no, cam_id];

        db.query(sql, dataArr, function(err,rows){
               if(err){
                   res.json({"code": 500, "data":{"status":"fail","error":err.message}});
               }else {
                   if(rows[0].total > 0 ){
                       sql = "delete from camera where cam_id = ? and cam_no = ?";
                       dataArr = [cam_id, cam_no];
                       db.query(sql, dataArr, function(err,rows){
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

// 修改摄像头信息
function editCamera(req,res){
	var query = req.body;
	try{
        var cam_id = query.cam_id;
        var cam_no = query.cam_no;

        var cam_sta = query.cam_sta;

        var sql = "select count(*) as total from camera where cam_id = ? and cam_no = ?";
        var dataArr = [cam_id, cam_no];

        db.query(sql, dataArr, function(err,rows){
               if(err){
                   res.json({"code": 500, "data":{"status":"fail","error":err.message}});
               }else {
                   if(rows[0].total > 0 ){
                       sql = "update camera cam_sta = ?";
                       sql += "where cam_id = ? and cam_no = ?";

                       dataArr = [cam_sta, cam_id, cam_no];

                       db.query(sql, dataArr, function(err,rows){
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
exports.editCamera = editCamera;
