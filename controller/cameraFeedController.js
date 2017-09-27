var db = require("../lib/db");
var check = require("../lib/check");
var mobileUser = require("./mobileController");

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

        mobileUser.getUserInfo(mobile, token, function(user){
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
 * 获取摄像头自己反馈信息列表
 * @param  {[type]} req [description]
 * @param  {[type]} res [description]
 * @return {[type]}     [description]
 */
function getSelfFeedBackList(req,res){
	var query = req.body;
	try{

		var mobile = query.mobile;
		var token = query.token;

		mobileUser.getUserInfo(mobile, token, function(user){
			if (user.error == 0) {
				user_info = user.data;

				var user_id = user_info.Id;

				var sql = "select count(*) as total from camera_feedback where user_id = ?";
		        var dataArr = [user_id];

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
					   var lastPage = Math.ceil(total/ pageSize);
					   if (page > lastPage) {
						   res.json({"code": 200,
							   "data":{"status":"success",
									 "error":"success",
									 "rows": "",
									 "total":total,
									 "page": lastPage,
									 "pageSize":pageSize}
								 });
							 return ;
					   }

		               var start = (page - 1) * pageSize;

		               if (-1 == page) {
		                   sql = "select * from camera_feedback where user_id = ?";
		                   dataArr = [user_id];
		               }
		               else {
		                   sql = "select * from camera_feedback where user_id = ? order by addtime limit ?, ?";
		                   dataArr = [user_id, start, pageSize];
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

exports.addFeedBack = addFeedBack;
exports.getSelfFeedBackList = getSelfFeedBackList;