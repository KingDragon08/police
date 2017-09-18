var db = require("../lib/db");
var check = require("../lib/check");
var User = require("./userController");

// create table `camera`(
//     `cam_id` int(32) not null auto_increment comment '设备记录id',
//     `cam_no` varchar(32) not null comment '设备编号',
//     `cam_name` varchar(16) comment '设备名称',
//     `user_id` int(32) comment '用户id',
//     `cam_loc_lon` varchar(32) comment '设备经度',
//     `cam_loc_lan` varchar(32) comment '设备维度',
//     `cam_desc` varchar(32) comment '设备描述',
//     `cam_sta` tinyint(2) unsigned not null default '0' comment '设备状态',
//     `addtime` varchar(32) comment '创建时间',
//     `uptime` varchar(32) comment '更新时间',
//     primary key (`cam_id`)
// ) default charset=utf8;

// 获取参数
function getParams(req,res){
    var query = req.body;

    var cam_no = query.cam_no;
    var cam_name = query.cam_name;
    var cam_sta = query.cam_sta;

	res.json({cam_no:cam_no,cam_name:cam_name,cam_loc:cam_loc,cam_sta:cam_sta});
}

// 添加摄像头
function addCamera(req,res){
	var query = req.body;
	try{
        var mobile = query.mobile;
        var token = query.token;

        User.getUserInfo(mobile, token, function(user){
            if (user.error == 0) {
                user_info = user.data;

                var cam_no = query.cam_no;
                if (check.isNull(cam_no)) {
                    console.log(check.isNull(cam_no));
                    res.json({"code": 401, "data":{"status":"fail","error":"camera no is null"}});
                    return ;
                }

                var cam_loc_lon = query.cam_loc_lon;
                if (check.isNull(cam_loc_lon)) {
                    res.json({"code": 401, "data":{"status":"fail","error":"cam_loc_lon is null"}});
                    return ;
                }

                var cam_loc_lan = query.cam_loc_lan;
                if (check.isNull(cam_loc_lan)) {
                    res.json({"code": 401, "data":{"status":"fail","error":"cam_loc_lan is null"}});
                    return ;
                }

                var cam_name = query.cam_name;
                var cam_sta = query.cam_sta || 0;
                var cam_desc = query.cam_desc;
                var user_id = user_info.Id;

                var curtime = new Date().getTime();

                // var sql = "select count(*) as total from camera where cam_no = '" + cam_no +"'";
                var sql = "select count(*) as total from camera where cam_no = ?";

                db.query(sql, [cam_no], function(err,rows){
                       if(err){
                           res.json({"code": 501, "data":{"status":"fail","error":err.message}});
                       }else {
                           if(rows[0].total > 0 ){
                               res.json({"code": 402, "data":{"status":"fail","error":"camera exist"}});
                           }
                           else {
                               sql = "insert into camera (cam_no, cam_name, cam_loc_lan, cam_loc_lon,cam_sta, cam_desc, user_id, addtime, uptime) ";
                               sql += "values(?, ?, ?, ?, ?, ?, ?, ?, ?)";

                               var dataArr = [cam_no, cam_name, cam_loc_lan, cam_loc_lon, cam_sta, cam_desc, user_id, curtime, curtime];

                               db.query(sql, dataArr, function(err,rows){
                                      if(err){
                                          res.json({"code": 501, "data":{"status":"fail","error":err.message}});
                                      }else {
                                          res.json({"code": 200, "data":{"status":"success","error":"success", "cam_id": rows.insertId}});
                                      }
                                  });
                           }
                       }
                   });
            }
            else {
                res.json({"code": 301, "data":{"status":"fail","error":"user not login"}});
                return ;
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
