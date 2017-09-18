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
//     `is_del` tinyint(2) unsigned not null default '0' comment '是否删除',
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
                var sql = "select * from camera where cam_no = ?";

                db.query(sql, [cam_no], function(err,rows){
                       if(err){
                           res.json({"code": 501, "data":{"status":"fail","error":err.message}});
                       }else {
                           if(rows.length > 0 ){
                               is_del = rows[0].is_del || 0;
                               if (1 == is_del) {
                                  var cam_id = rows[0].cam_id;

                                  sql = "update camera set cam_no = ?, cam_name = ?, cam_loc_lan = ?, cam_loc_lon = ?,";
                                  sql += "cam_sta = ?, cam_desc = ?, uptime = ? ";
                                  sql += "where cam_id = ?";

                                  dataArr = [cam_no, cam_name, cam_loc_lan, cam_loc_lon, cam_sta, cam_desc, curtime, cam_id];
                               }
                               else {
                                   res.json({"code": 402, "data":{"status":"fail","error":"camera exist"}});
                                   return ;
                               }
                           }
                           else {
                               sql = "insert into camera (cam_no, cam_name, cam_loc_lan, cam_loc_lon,cam_sta, cam_desc, user_id, addtime, uptime) ";
                               sql += "values(?, ?, ?, ?, ?, ?, ?, ?, ?)";

                               var dataArr = [cam_no, cam_name, cam_loc_lan, cam_loc_lon, cam_sta, cam_desc, user_id, curtime, curtime];
                           }

                           db.query(sql, dataArr, function(err,rows){
                                  if(err){
                                      res.json({"code": 501, "data":{"status":"fail","error":err.message}});
                                  }else {
                                      cam_id = check.isNull(cam_id)? rows.insertId:cam_id;
                                      res.json({"code": 200, "data":{"status":"success","error":"success", "cam_id": cam_id}});
                                  }
                              });

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

        var mobile = query.mobile;
        var token = query.token;

        User.getUserInfo(mobile, token, function(user){
            if (user.error == 0) {
                user_info = user.data;

                var cam_id = query.cam_id;
                if (check.isNull(cam_id)) {
                    res.json({"code": 401, "data":{"status":"fail","error":"cam_id is null"}});
                    return ;
                }

                var sql = "select count(*) as total from camera where cam_id = ? and is_del = 0";
                var dataArr = [cam_id];

                db.query(sql, dataArr, function(err,rows){
                       if(err){
                           res.json({"code": 501, "data":{"status":"fail","error":err.message}});
                       }else {
                           if(rows[0].total > 0 ){
                               var curtime = new Date().getTime();

                               sql = "update camera set is_del = 1, uptime = ? where cam_id = ?";
                               dataArr = [curtime, cam_id];

                               db.query(sql, dataArr, function(err,rows){
                                      if(err){
                                          res.json({"code": 501, "data":{"status":"fail","error":err.message}});
                                      }else {
                                          res.json({"code": 200, "data":{"status":"success","error":"success"}});
                                      }
                                  });
                           }
                           else {
                               res.json({"code": 404, "data":{"status":"fail","error":"camera not exist"}});
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

// 修改摄像头信息
function editCamera(req,res){
	var query = req.body;
	try{
        var mobile = query.mobile;
        var token = query.token;

        User.getUserInfo(mobile, token, function(user){
            if (user.error == 0) {
                user_info = user.data;
            }

            var cam_id = query.cam_id;
            if (check.isNull(cam_id)) {
                res.json({"code": 401, "data":{"status":"fail","error":"cam_id is null"}});
                return ;
            }

            var sql = "select count(*) as total from camera where cam_id = ?";
            var dataArr = [cam_id];

            db.query(sql, dataArr, function(err,rows){
                   if(err){
                       res.json({"code": 501, "data":{"status":"fail","error":err.message}});
                   }else {
                       if(rows[0].total > 0 ){
                           var editType = query.editType || '';

                           switch (editType) {
                               case 'status':
                                    // 更新设备状态
                                    var cam_sta = query.cam_sta || 0;

                                    sql = "update camera set cam_sta = ?, uptime = ? ";
                                    sql += "where cam_id = ?";

                                    dataArr = [cam_sta, curtime, cam_id];

                                    break;

                                case 'all':
                                    // 更新设备全部信息
                                   var cam_no = query.cam_no;
                                   if (check.isNull(cam_no)) {
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

                                   var cam_name = query.cam_name || '';
                                   var cam_sta = query.cam_sta || 0;
                                   var cam_desc = query.cam_desc || '';

                                   var curtime = new Date().getTime();

                                   sql = "update camera set cam_no = ?, cam_name = ?, cam_loc_lan = ?, cam_loc_lon = ?,";
                                   sql += "cam_sta = ?, cam_desc = ?, uptime = ? ";
                                   sql += "where cam_id = ?";

                                   dataArr = [cam_no, cam_name, cam_loc_lan, cam_loc_lon, cam_sta, cam_desc, curtime, cam_id];

                                   break;

                               default:
                                   res.json({"code": 403, "data":{"status":"fail","error":"editType is illegal"}});
                                   return;
                           }

                           db.query(sql, dataArr, function(err,rows){
                                  if(err){
                                      res.json({"code": 501, "data":{"status":"fail","error":err.message}});
                                  }else {
                                      res.json({"code": 200, "data":{"status":"success","error":"success"}});
                                  }
                              });

                       }
                       else {
                           res.json({"code": 404, "data":{"status":"fail","error":"camera not exist"}});
                       }
                   }
               });
        });



	} catch(e) {
		res.json({"code": 500, "data":{"status":"fail","error":e.message}});
	}
}


exports.getParams = getParams;
exports.addCamera = addCamera;
exports.delCamera = delCamera;
exports.editCamera = editCamera;
