var db = require("../lib/db");
var check = require("../lib/check");
var User = require("./mobileController");

// create table `camera_feedback`(
//     `fb_id` int(32) not null auto_increment comment '设备反馈id',
//     `cam_id` int(32) comment '设备id',
//     `user_id` int(32) comment '上传用户id',
//     `fb_loc_lon` varchar(32) comment '反馈地点经度',
//     `fb_loc_lan` varchar(32) comment '反馈地点维度',
//     `fb_addr` text comment '反馈地点详细地址',
//     `content` text comment '反馈内容',
//     `addtime` varchar(32) comment '创建时间',
//     primary key (`fb_id`)
// ) default charset=utf8;

// create table `camera_feedback_pics`(
//     `pic_id` int(32) not null auto_increment comment '反馈图片id',
//     `fb_id` int(32) comment '反馈id',
//     `pic`  varchar(255) comment '图片链接',
//     `addtime` varchar(32) comment '创建时间',
//     primary key (`pic_id`)
// ) default charset=utf8;

/**
 * 添加反馈
 * @param {[type]} req [description]
 * @param {[type]} res [description]
 */
function addFeedBack(req,res){
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

                var sql = "select * from camera where is_del = 0 and cam_id = ?";
                var dataArr = [cam_id];

                db.query(sql, dataArr, function(err,rows){
                       if(err){
                           res.json({"code": 501, "data":{"status":"fail","error":err.message}});
                       }else {
                           if(rows.length > 0 ){

                               var content = query.content;
                               if (check.isNull(content)) {
                                   res.json({"code": 401, "data":{"status":"fail","error":"content is null"}});
                                   return ;
                               }

                               var fb_loc_lan = query.fb_loc_lan || 0;
                               var fb_loc_lon = query.fb_loc_lon || 0;
                               var fb_addr = query.fb_addr || '';
                               var user_id = user_info.Id;
                               var curtime = new Date().getTime();

                               sql = "insert into camera_feedback (cam_id, content, addtime, user_id, fb_loc_lon, fb_loc_lan, fb_addr) ";
                               sql += "values (?, ?, ?, ?, ?, ?, ?)";

                               dataArr = [cam_id, content, curtime, user_id, fb_loc_lon, fb_loc_lan, fb_addr];
                           }
                           else {
                               res.json({"code": 404, "data":{"status":"fail","error":"camera not exist"}});
                               return ;
                           }

                           db.query(sql, dataArr, function(err,rows){
                              if(err){
                                  res.json({"code": 501, "data":{"status":"fail","error":err.message}});
                              }else {
                                  fb_id = rows.insertId;
                                  res.json({"code": 200, "data":{"status":"success","error":"success", "fb_id": fb_id}});

                                  var pics = query.pics || '';
                                  if (check.isNull(pics)) {
                                      return ;
                                  }

                                  pics.forEach(function(pic){
                                      sql = "insert into camera_feedback_pics (fb_id, pic, addtime) values (?, ?, ?)";
                                      dataArr = [fb_id, pic, curtime];
                                      db.query(sql, dataArr, function(err,rows){
                                         if(err){
                                             res.json({"code": 501, "data":{"status":"fail","error":err.message}});
                                         }
                                     });
                                  });

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

/**
 * 删除摄像头
 * @param  {[type]} req [description]
 * @param  {[type]} res [description]
 * @return {[type]}     [description]
 */
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

/**
 * 修改摄像头信息
 * @param  {[type]} req [description]
 * @param  {[type]} res [description]
 * @return {[type]}     [description]
 */
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
                                   var cam_addr = query.cam_addr || '';


                                   var curtime = new Date().getTime();

                                   sql = "update camera set cam_no = ?, cam_name = ?, cam_loc_lan = ?, cam_loc_lon = ?,";
                                   sql += "cam_sta = ?, cam_desc = ?, uptime = ?, cam_addr = ? ";
                                   sql += "where cam_id = ?";

                                   dataArr = [cam_no, cam_name, cam_loc_lan, cam_loc_lon, cam_sta, cam_desc, curtime, cam_addr, cam_id];

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

/**
 * 获取摄像头列表
 * @param  {[type]} req [description]
 * @param  {[type]} res [description]
 * @return {[type]}     [description]
 */
function getCameraList(req,res){
	var query = req.body;
	try{
        var sql = "select count(*) as total from camera where is_del = 0";
        var dataArr = [];

        db.query(sql, dataArr, function(err,rows){
           if(err){
               res.json({"code": 501, "data":{"status":"fail","error":err.message}});
           }else {
               var total = rows[0].total;

               var page = query.page || -1;
               var pageSize = query.pageSize || 20;

               if (page < 1) {
                   page = 1;
               }
               var start = (page - 1) * pageSize;


               if (-1 == page) {
                   sql = "select * from camera where is_del = 0";
                   dataArr = [];
               }
               else {
                   sql = "select * from camera where is_del = 0 order by cam_id limit ?, ?";
                   dataArr = [start, pageSize];
               }

               db.query(sql, dataArr, function(err,rows){
                      if(err){
                          res.json({"code": 501, "data":{"status":"fail","error":err.message}});
                      }else {
                          res.json({"code": 200,
                              "data":{"status":"success",
                                    "error":"success",
                                    "rows": rows,
                                    "total":total,
                                    "page": page,
                                    "pageSize":pageSize}
                                });
                      }
                  });
           }
       });
	} catch(e) {
		res.json({"code": 500, "data":{"status":"fail","error":e.message}});
	}
}

/**
 * 获取单个摄像头信息
 * @param  {[type]} req [description]
 * @param  {[type]} res [description]
 * @return {[type]}     [description]
 */
function getCameraInfo(req,res){
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
                               sql = "select * from camera where cam_id = ?";
                               dataArr = [cam_id];

                               db.query(sql, dataArr, function(err,rows){
                                      if(err){
                                          res.json({"code": 501, "data":{"status":"fail","error":err.message}});
                                      }else {
                                          res.json({"code": 200,
                                                    "data":{"status":"success",
                                                            "error":"success",
                                                            "rows": rows,
                                                            "cam_id": cam_id}
                                                        });
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

/**
 * 查找摄像头
 * 已实现根据设备名称或者地址模糊查找
 * @param  {[type]} req [description]
 * @param  {[type]} res [description]
 * @return {[type]}     [description]
 */
function searchCamera(req,res){
	var query = req.body;
	try{
            var mobile = query.mobile;
            var token = query.token;

            User.getUserInfo(mobile, token, function(user){
                if (user.error == 0) {
                    user_info = user.data;
                }

                var info = "%" + query.info + "%"|| "%%";
                console.log(info);

                var sql = "select count(*) as total from camera where is_del = 0 ";
                sql += "and (cam_name like ? or cam_addr like ?)";
                var dataArr = [info, info];
                console.log(dataArr);

                db.query(sql, dataArr, function(err,rows){
                       if(err){
                           res.json({"code": 501, "data":{"status":"fail","error":err.message}});
                       }else {
                           console.log(rows);
                           var total = rows[0].total;

                           if(rows[0].total > 0 ){
                               sql = "select * from camera where is_del = 0 and (cam_name like ? or cam_addr like ?)";
                               dataArr = [info, info];

                               db.query(sql, dataArr, function(err,rows){
                                      if(err){
                                          res.json({"code": 501, "data":{"status":"fail","error":err.message}});
                                      }else {
                                          res.json({"code": 200,
                                                    "data":{"status":"success",
                                                            "error":"success",
                                                            "rows": rows,
                                                            "total": total}
                                                        });
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


exports.addFeedBack = addFeedBack;
