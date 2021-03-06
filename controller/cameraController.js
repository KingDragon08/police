var db = require("../lib/db");
var check = require("../lib/check");
var User = require("./userController");
var mobileUser = require("./mobileController");
var cameraAsync = require("./cameraAsync");
var dbTableAttr = require("../config/dbTableAttrConf");
var xlsx = require('node-xlsx');
var fs = require('fs');
var async = require('async')
var Log = require('./logController');
var ejsExcel = require("ejsexcel");

var map_db_name = "xc_baymin";

// create table `camera`(
//     `cam_id` int(32) not null auto_increment comment '设备记录id',
//     `cam_no` varchar(32) not null comment '设备编号',
//     `cam_name` varchar(16) comment '设备名称',
//     `user_id` int(32) comment '用户id',
//     `cam_loc_lon` varchar(32) comment '设备经度',
//     `cam_loc_lan` varchar(32) comment '设备维度',
//     `cam_desc` varchar(32) comment '设备描述',
//     `cam_addr` text comment '设备详细地址',
//     `cam_sta` tinyint(2) unsigned not null default '0' comment '设备状态',
//     `is_del` tinyint(2) unsigned not null default '0' comment '是否删除',
//     `addtime` varchar(32) comment '创建时间',
//     `uptime` varchar(32) comment '更新时间',
//     primary key (`cam_id`)
// ) default charset=utf8;

// CREATE TABLE `base_point` (
//   `id` int(32) NOT NULL AUTO_INCREMENT comment 'id',
//   `outX` varchar(50) comment '外部地图经度',
//   `outY` varchar(50) comment '外部地图维度',
//   `inX` varchar(50) comment '内部地图X',
//   `inY` varchar(50) comment '内部地图Y',
//   PRIMARY KEY (`id`)
// ) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8;


/**
 * 添加摄像头
 * @param {[type]} req [description]
 * @param {[type]} res [description]
 */
function addCamera(req, res) {
    var query = req.body;
    try {
        var mobile = query.mobile;
        var token = query.token;
        User.getUserInfo(mobile, token, function(user) {
            if (user.error == 0) {
                user_info = user.data;
                var user_id = user_info.Id;
                var cam_no = query.cam_no || -1;
                var cam_name = query.cam_name || -1;
                var cam_sta = query.cam_sta || -1;
                var cam_desc = query.cam_desc || -1;
                var cam_addr = query.cam_addr || -1;
                var cam_loc_lan = query.cam_loc_lan || -1;
                var cam_loc_lon = query.cam_loc_lon || -1
                var cam_extra = query.cam_extra || -1;
                var curtime = new Date().getTime();
                if(cam_no==-1 || cam_name==-1 || cam_sta==-1 ||
                    cam_desc==-1 || cam_addr==-1 || cam_loc_lan==-1 ||
                    cam_loc_lon==-1 || cam_extra==-1){
                        res.json({
                            "code": 401,
                            "data": {
                                "status": "fail",
                                "error": "参数错误"
                            }
                        });
                        return;    
                } else {
                    //原始坐标需要转换
                    // if(cam_loc_lon<180 && cam_loc_lan<180){
                    //     transformPoint(cam_loc_lon, cam_loc_lan, function(temp){
                    //         cam_loc_lon = temp.x;
                    //         cam_loc_lan = temp.y;
                    //         cam_extra = JSON.parse(cam_extra);
                    //         createNewCamera(cam_no,cam_name,cam_sta,curtime,curtime,
                    //                         user_id,cam_loc_lan,cam_loc_lon,cam_desc,
                    //                         cam_addr,cam_extra,function(ret){
                    //                             Log.insertLog(mobile,"添加摄像头","add Camera");
                    //                             res.json(ret);
                    //                             //删除重复记录
                    //                             deleteRepeatCameras();
                    //                         });
                    //     });
                    // } else {
                        cam_extra = JSON.parse(cam_extra);
                        createNewCamera(cam_no,cam_name,cam_sta,curtime,curtime,
                                        user_id,cam_loc_lan,cam_loc_lon,cam_desc,
                                        cam_addr,cam_extra,function(ret){
                                            Log.insertLog(mobile,"添加摄像头","add Camera");
                                            res.json(ret);
                                            //删除重复记录
                                            deleteRepeatCameras();
                                        });
                    // }
                }
                
            } else {
                res.json({
                    "code": 301,
                    "data": {
                        "status": "fail",
                        "error": "用户未登录"
                    }
                });
                return;
            }
        });
    } catch (e) {
        res.json({
            "code": 500,
            "data": {
                "status": "fail",
                "error": e.message
            }
        });
    }
}

/**
 * 删除重复记录
 */
 function deleteRepeatCameras(){
    //step1 获取摄像头所有的属性
    db.query("select attr_name from camera_attr",[],
        function(err,result){
            if(err){
                return;
            } else {
                camera_attrs = []
                for(var i=0; i<result.length; i++){
                    //排除cam_id和is_del
                    if(i!=0 && i!=10){
                        camera_attrs.push(result[i].attr_name);
                    }
                }
                camera_attrs = camera_attrs.join(",");
                //step2删除重复数据
                sql = "delete a from camera a left join( select cam_id from camera group "+
                        "by "+camera_attrs +" )b on a.cam_id=b.cam_id where b.cam_id is null";
                db.query(sql,[],function(err,result){
                    if(err){
                        console.log(err);
                    }
                });
            }
        });
 }


/**
 * 添加摄像头
 * @param  cam_no 摄像头编号
 * @param  cam_name 摄像头名字
 * @param  cam_sta 摄像头类型
 * @param  addtime 添加时间
 * @param  uptime 更新时间
 * @param  user_id 添加用户Id
 * @param  cam_loc_lan 摄像头纬度
 * @param  cam_loc_lon 摄像头经度
 * @param  cam_desc 摄像头描述,来自采集信息时的文字反馈
 * @param  cam_addr 摄像头地址文字信息
 * @param  cam_extra 摄像头自定义属性集,hashmap
 * @param  callback 回调函数
 */
function createNewCamera(cam_no,cam_name,cam_sta,addtime,uptime,
                        user_id,cam_loc_lan,cam_loc_lon,cam_desc,
                        cam_addr,cam_extra,callback){
    ret = {};
    //获取所有的额外属性名
    db.query("select attr_name from camera_attr where Id>30",[],
        function(err,rows){
            if(err){
                ret = {
                        "code": 501,
                        "data": {
                            "status": "fail",
                            "error": err.message
                        }
                    };
                callback(ret);
                return;
            } else {
                var flag = 1;
                var sql_before = "insert into camera (cam_no, cam_name, cam_sta, addtime, uptime, "+
                            "user_id, cam_loc_lan, cam_loc_lon, cam_desc, cam_addr, is_del";
                var sql_after = "values(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";
                var dataArr = [cam_no,cam_name,cam_sta,addtime,uptime,user_id,cam_loc_lan,
                                cam_loc_lon,cam_desc,cam_addr,0];
                for(var i=0; i<rows.length; i++){
                    if(cam_extra[rows[i].attr_name]!=undefined){
                        sql_before += ", " + rows[i].attr_name;
                        sql_after += ",?";
                        dataArr.push(cam_extra[rows[i].attr_name])
                    }// else {
                    //    flag = 0;
                    //    break;
                    //}
                }
                if(!flag){
                    ret = {
                            "code": 502,
                            "data": {
                                "status": "fail",
                                "error": "摄像头标识符不完全"
                            }
                        };
                    callback(ret);
                    return;
                } else {
                    sql_before += ")";
                    sql_after += ")";
                    var sql = sql_before + sql_after;
                    db.query(sql,dataArr,function(err,rows){
                        if(err){
                            ret = {
                                "code": 503,
                                "data": {
                                    "status": "fail",
                                    "error": err.message
                                }
                            };
                            callback(ret);
                        } else {
                            //同步摄像头图层的数据
                            var cam_id = rows.insertId;
                            cameraAsync.createNewCamera(cam_id,cam_loc_lan,cam_loc_lon,cam_sta,function(result){
                                ret = {
                                    "code": 200,
                                    "data": {
                                        "status": "success",
                                        "error": "success",
                                        "cam_id": rows.insertId
                                    }
                                };
                                callback(ret);
                            });
                        }
                    });
                }
                
            }
        });
}


/**
 * 删除摄像头
 * @param  {[type]} req [description]
 * @param  {[type]} res [description]
 * @return {[type]}     [description]
 */
function delCamera(req, res) {
    var query = req.body;
    try {
        var mobile = query.mobile;
        var token = query.token;
        User.getUserInfo(mobile, token, function(user) {
            if (user.error == 0) {
                user_info = user.data;
                var cam_id = query.cam_id;
                if (check.isNull(cam_id)) {
                    res.json({
                        "code": 401,
                        "data": {
                            "status": "fail",
                            "error": "摄像头ID为空"
                        }
                    });
                    return;
                }
                var sql = "select count(*) as total from camera where cam_id = ? and is_del = 0";
                var dataArr = [cam_id];
                db.query(sql, dataArr, function(err, rows) {
                    if (err) {
                        res.json({
                            "code": 501,
                            "data": {
                                "status": "fail",
                                "error": err.message
                            }
                        });
                    } else {
                        if (rows[0].total > 0) {
                            var curtime = new Date().getTime();
                            // sql = "update camera set is_del = 1, uptime = ? where cam_id = ?";
                            //真的要从数据库里面删除摄像头了！whatafuckingday
                            sql = "delete from camera where cam_id=?"
                            dataArr = [cam_id];
                            db.query(sql, dataArr, function(err, rows) {
                                if (err) {
                                    res.json({
                                        "code": 501,
                                        "data": {
                                            "status": "fail",
                                            "error": err.message
                                        }
                                    });
                                } else {
                                    //同步更新摄像头地图表
                                    cameraAsync.deleteCamera(cam_id,function(result){
                                        if(result){
                                            Log.insertLog(mobile,"删除摄像头",sql);
                                            res.json({
                                                "code": 200,
                                                "data": {
                                                    "status": "success",
                                                    "error": "success"
                                                }
                                            });        
                                        } else {
                                            res.json({
                                                "code": 500,
                                                "data": {
                                                    "status": "fail",
                                                    "error": "删除摄像头失败"
                                                }
                                            });        
                                        }
                                    });
                                    
                                }
                            });
                        } else {
                            res.json({
                                "code": 404,
                                "data": {
                                    "status": "fail",
                                    "error": "摄像头不存在"
                                }
                            });
                        }
                    }
                });
            } else {
                res.json({
                    "code": 301,
                    "data": {
                        "status": "fail",
                        "error": "用户未登录"
                    }
                });
                return;
            }
        });
    } catch (e) {
        res.json({
            "code": 500,
            "data": {
                "status": "fail",
                "error": e.message
            }
        });
    }
}
/**
 * 修改摄像头信息
 * @param  {[type]} req [description]
 * @param  {[type]} res [description]
 * @return {[type]}     [description]
 */
function editCamera(req, res) {
    var query = req.body;
    console.log(query);
    try {
        var mobile = query.mobile;
        var token = query.token;
        User.getUserInfo(mobile, token, function(user) {
            if (user.error == 0) {
                user_info = user.data;
            } else {
                res.json({
                    "code": 301,
                    "data": {
                        "status": "fail",
                        "error": "用户未登录"
                    }
                });
                return;
            }
            var cam_id = query.cam_id || -1;
            var cam_no = query.cam_no || -1;
            var cam_name = query.cam_name || -1;
            var cam_desc = query.cam_desc || -1;
            var cam_addr = query.cam_addr || -1;
            var cam_loc_lon = query.cam_loc_lon || -1;
            var cam_loc_lan = query.cam_loc_lan || -1;
            var cam_sta = query.cam_sta || -1;
            var cam_extra = query.cam_extra || -1;
            if(cam_id==-1 || cam_no==-1 || cam_name==-1 ||
                cam_desc==-1 || cam_addr==-1 || cam_loc_lon==-1 ||
                cam_loc_lan==-1 || cam_sta==-1 || cam_extra==-1){
                res.json({
                        "code": 300,
                        "data": {
                            "status": "fail",
                            "error": "参数错误"
                        }
                    });
            } else {
                cam_id = parseInt(cam_id);
                cam_sta = parseInt(cam_sta);
                var sql = "select count(*) as total from camera where cam_id = ?";
                var dataArr = [cam_id];
                db.query(sql, dataArr, function(err, rows) {
                    if (err) {
                        res.json({
                            "code": 501,
                            "data": {
                                "status": "fail",
                                "error": err.message
                            }
                        });
                    } else {
                        var curtime = new Date().getTime();
                        if (rows[0].total > 0) {
                            var sql = "update camera set cam_no=?,cam_name=?,cam_sta=?,"+
                                                "uptime=?,cam_loc_lan=?,cam_loc_lon=?,"+
                                                "cam_desc=?,cam_addr=?"
                            var dataArr = [cam_no,cam_name,cam_sta,curtime,cam_loc_lan,cam_loc_lon,
                                            cam_desc,cam_addr];
                            db.query("select attr_name from camera_attr where Id>30",[],
                                function(err,rows){
                                    cam_extra = JSON.parse(cam_extra);
                                    for(var i=0; i<rows.length; i++){
                                        if(cam_extra[rows[i].attr_name]!=undefined){
                                            sql += "," + rows[i].attr_name + "=?";
                                            dataArr.push(cam_extra[rows[i].attr_name])
                                        }
                                    }
                                    sql += " where cam_id=?";
                                    dataArr.push(cam_id);
                                    console.log(sql);
                                    db.query(sql,dataArr,function(err,result){
                                        if(err){
                                            res.json({
                                                "code": 500,
                                                "data": {
                                                    "status": "fail",
                                                    "error": err.message
                                                }
                                            });
                                        } else {
                                            //同步更新摄像头图层数据表
                                            cameraAsync.updateCamera(cam_id,cam_loc_lan,cam_loc_lon,cam_sta,function(result){
                                                if(result){
                                                    Log.insertLog(mobile,"修改摄像头信息",sql);
                                                    res.json({
                                                        "code": 200,
                                                        "data": {
                                                            "status": "success",
                                                            "error": "success"
                                                        }
                                                    });
                                                } else {
                                                    res.json({
                                                        "code": 500,
                                                        "data": {
                                                            "status": "fail",
                                                            "error": "修改摄像头信息失败"
                                                        }
                                                    });
                                                }
                                            });
                                        }
                                    });
                                });
                        } else {
                            res.json({
                                "code": 404,
                                "data": {
                                    "status": "fail",
                                    "error": "摄像头不存在"
                                }
                            });
                        }
                    }
                });
            }
        });
    } catch (e) {
        res.json({
            "code": 500,
            "data": {
                "status": "fail",
                "error": e.message
            }
        });
    }
}
/**
 * 获取摄像头列表
 * @param  {[type]} req [description]
 * @param  {[type]} res [description]
 * @return {[type]}     [description]
 */
function getCameraList(req, res) {
    var query = req.body;
    try {
        var sql = "select count(cam_id) as total from camera where is_del = 0";
        var dataArr = [];
        db.query(sql, dataArr, function(err, rows) {
            if (err) {
                res.json({
                    "code": 501,
                    "data": {
                        "status": "fail",
                        "error": err.message
                    }
                });
            } else {
                var total = rows[0].total;
                var page = query.page || -1;
                var pageSize = query.pageSize || 20;
                if (page < 1 && page != -1) {
                    page = 1;
                }
                pageSize = parseInt(pageSize);
                var start = (page - 1) * pageSize;
                if (-1 == page) {
                    //sql = "select cam_id,cast(cam_loc_lan as decimal(20,2)) as cam_loc_lan,cast(cam_loc_lon as decimal(20,2)) as cam_loc_lon from camera where is_del = 0 order by cam_id limit 0,100";
                    sql = "select *,from_unixtime(addtime div 1000,'%Y-%m-%d %H:%I:%S') as addtime,from_unixtime(uptime div 1000,'%Y-%m-%d %H:%I:%S') as uptime from camera where is_del = 0 order by cam_id";

                    pageSize = total;
                    dataArr = [];
                } else {
                    //sql = "select *,cast(cam_loc_lan as decimal(20,2)) as cam_loc_lan,cast(cam_loc_lon as decimal(20,2)) as cam_loc_lon,from_unixtime(addtime div 1000,'%Y-%m-%d %H:%I:%S') as addtime from camera where is_del = 0 order by cam_id limit ?, ?";
                    sql = "select *,from_unixtime(addtime div 1000,'%Y-%m-%d %H:%I:%S') as addtime,from_unixtime(uptime div 1000,'%Y-%m-%d %H:%I:%S') as uptime from camera where is_del = 0 order by cam_id limit ?, ?";
                    dataArr = [start, pageSize];
                }
                db.query(sql, dataArr, function(err, rows) {
                    if (err) {
                        res.json({
                            "code": 501,
                            "data": {
                                "status": "fail",
                                "error": err.message
                            }
                        });
                    } else {
                        //Log.insertLog(query.mobile,req.url,sql);

                        /**************************************************忧伤的分割线**************************************************/
                        for(var i = 0;i<rows.length;i++){
                            // rows[i].cam_loc_lan = parseFloat(rows[i].cam_loc_lan).toFixed(2);
                            // rows[i].cam_loc_lon = parseFloat(rows[i].cam_loc_lon).toFixed(2);
                            rows[i].cam_loc_lan = rows[i].cam_loc_lan;
                            rows[i].cam_loc_lon = rows[i].cam_loc_lon;
                        }
                        /**************************************************忧伤的分割线**************************************************/

                        res.json({
                            "code": 200,
                            "data": {
                                "status": "success",
                                "error": "success",
                                "rows": rows,
                                "total": total,
                                "page": page,
                                "pageSize": pageSize
                            }
                        });
                    }
                });
            }
        });
    } catch (e) {
        res.json({
            "code": 500,
            "data": {
                "status": "fail",
                "error": e.message
            }
        });
    }
}
/**
 * 指定字段获取摄像头列表
 * @param  {[type]} req [description]
 * @param  {[type]} res [description]
 * @return {[type]}     [description]
 */
function getCameraListByAttr(req, res) {
    var query = req.body;
    attrName = query.attrName || '';

    if (dbTableAttr.cameraAttrList.indexOf(attrName) == -1) {
        res.json({
            "code": 401,
            "data": {
                "status": "fail",
                "error": "标识符不存在"
            }
        });
        return;
    }
    attrValue = query.attrValue || '';
    if (check.isNull(attrValue)) {
        res.json({
            "code": 401,
            "data": {
                "status": "fail",
                "error": "属性值为空"
            }
        });
        return;
    }
    try {
        var sql = "select count(*) as total from camera where is_del = 0 and " + attrName + " like " +
                    "'" + attrValue + "'";
        // var dataArr = [attrName, attrValue];
        var dataArr = [];
        db.query(sql, dataArr, function(err, rows) {
            if (err) {
                res.json({
                    "code": 501,
                    "data": {
                        "status": "fail",
                        "error": err.message
                    }
                });
            } else {
                var total = rows[0].total;
                var page = query.page || -1;
                var pageSize = query.pageSize || 20;
                if (page < 1 && page != -1) {
                    page = 1;
                }
                var start = (page - 1) * pageSize;
                if (-1 == page) {
                    sql = "select * from camera where is_del = 0 and " + attrName + " like " +
                            "'" + attrValue + "'";
                    pageSize = total;
                    dataArr = [];
                } else {
                    sql = "select * from camera where is_del = 0 and " + attrName + " like " +
                            "'" + attrValue + "'" + " order by cam_id limit ?, ?";
                    dataArr = [start, parseInt(pageSize)];
                }
                db.query(sql, dataArr, function(err, rows) {
                    if (err) {
                        res.json({
                            "code": 501,
                            "data": {
                                "status": "fail",
                                "error": err.message
                            }
                        });
                    } else {
                
                        //var mobile = req.body.mobile || -1;
                        //Log.insertLog(mobile,req.url,sql);
                        res.json({
                            "code": 200,
                            "data": {
                                "status": "success",
                                "error": "success",
                                "rows": rows,
                                "total": total,
                                "page": page,
                                "pageSize": pageSize
                            }
                        });
                    }
                });
            }
        });
    } catch (e) {
        res.json({
            "code": 500,
            "data": {
                "status": "fail",
                "error": e.message
            }
        });
    }
}
/**
 * 获取单个摄像头信息
 * @param  {[type]} req [description]
 * @param  {[type]} res [description]
 * @return {[type]}     [description]
 */
function getCameraInfo(req, res) {
    var query = req.body;
    try {
        var mobile = query.mobile;
        var token = query.token;
        User.getUserInfo(mobile, token, function(user) {
            if (user.error == 0) {
                user_info = user.data;
            } else {
                res.json({
                    "code": 301,
                    "data": {
                        "status": "fail",
                        "error": "用户未登录"
                    }
                });
                return;
            }
            var cam_id = query.cam_id;
            if (check.isNull(cam_id)) {
                res.json({
                    "code": 401,
                    "data": {
                        "status": "fail",
                        "error": "摄像头ID为空"
                    }
                });
                return;
            }
            var sql = "select count(*) as total from camera where cam_id = ?";
            var dataArr = [cam_id];
            db.query(sql, dataArr, function(err, rows) {
                if (err) {
                    res.json({
                        "code": 501,
                        "data": {
                            "status": "fail",
                            "error": err.message
                        }
                    });
                } else {
                    if (rows[0].total > 0) {
                        //sql = "select *,cast(cam_loc_lan as decimal(20,2)) as cam_loc_lan,cast(cam_loc_lon as decimal(20,2)) as cam_loc_lon,from_unixtime(addtime div 1000,'%Y-%m-%d %H:%I:%S') as addtime from camera where cam_id=?";
                        sql = "select *,from_unixtime(addtime div 1000,'%Y-%m-%d %H:%I:%S') as addtime from camera where cam_id=?";

                        dataArr = [cam_id];
                        db.query(sql, dataArr, function(err, rows) {
                            if (err) {
                                res.json({
                                    "code": 501,
                                    "data": {
                                        "status": "fail",
                                        "error": err.message
                                    }
                                });
                            } else {
                                //Log.insertLog(mobile,req.url,sql);

/**************************************************忧伤的分割线**************************************************/

                                for(var i = 0;i<rows.length;i++){
                                    rows[i].cam_loc_lan = parseFloat(rows[i].cam_loc_lan).toFixed(2);
                                    rows[i].cam_loc_lon = parseFloat(rows[i].cam_loc_lon).toFixed(2);
                                }
/**************************************************忧伤的分割线**************************************************/

                                res.json({
                                    "code": 200,
                                    "data": {
                                        "status": "success",
                                        "error": "success",
                                        "rows": rows,
                                        "cam_id": cam_id
                                    }
                                });
                            }
                        });
                    } else {
                        res.json({
                            "code": 404,
                            "data": {
                                "status": "fail",
                                "error": "摄像头不存在"
                            }
                        });
                    }
                }
            });
        });
    } catch (e) {
        res.json({
            "code": 500,
            "data": {
                "status": "fail",
                "error": e.message
            }
        });
    }
}
/**
 * 查找摄像头
 * 已实现根据设备名称或者地址模糊查找
 * @param  {[type]} req [description]
 * @param  {[type]} res [description]
 * @return {[type]}     [description]
 */
// function searchCamera(req, res) {
//     var query = req.body;
//     try {
//         var mobile = query.mobile;
//         var token = query.token;
//         User.getUserInfo(mobile, token, function(user) {
//             if (user.error == 0) {
//                 user_info = user.data;
//             } else {
//                 res.json({
//                     "code": 301,
//                     "data": {
//                         "status": "fail",
//                         "error": "user not login"
//                     }
//                 });
//                 return;
//             }
//             var loc_lon = query.loc_lon || '';
//             if (check.isNull(loc_lon)) {
//                 res.json({
//                     "code": 401,
//                     "data": {
//                         "status": "fail",
//                         "error": "loc_lon is null"
//                     }
//                 });
//                 return;
//             }
//             var loc_lan = query.loc_lan || '';
//             if (check.isNull(loc_lan)) {
//                 res.json({
//                     "code": 401,
//                     "data": {
//                         "status": "fail",
//                         "error": "loc_lan is null"
//                     }
//                 });
//                 return;
//             }
//             var radius = query.radius || 20;
//             var size = query.size || 20;
//             var sql = "select count(*) as total from camera where is_del = 0 ";
//             sql += "and (cam_name like " +
//                     conn.escape('%' + keyword + '%') +
//                     " or cam_addr like ?)";
//             var dataArr = [info, info];
//             console.log(dataArr);
//             db.query(sql, dataArr, function(err, rows) {
//                 if (err) {
//                     res.json({
//                         "code": 501,
//                         "data": {
//                             "status": "fail",
//                             "error": err.message
//                         }
//                     });
//                 } else {
//                     console.log(rows);
//                     var total = rows[0].total;
//                     if (rows[0].total > 0) {
//                         sql = "select * from camera where is_del = 0 and (cam_name like ? or cam_addr like ?)";
//                         dataArr = [info, info];
//                         db.query(sql, dataArr, function(err, rows) {
//                             if (err) {
//                                 res.json({
//                                     "code": 501,
//                                     "data": {
//                                         "status": "fail",
//                                         "error": err.message
//                                     }
//                                 });
//                             } else {
//                                 res.json({
//                                     "code": 200,
//                                     "data": {
//                                         "status": "success",
//                                         "error": "success",
//                                         "rows": rows,
//                                         "total": total
//                                     }
//                                 });
//                             }
//                         });
//                     } else {
//                         res.json({
//                             "code": 404,
//                             "data": {
//                                 "status": "fail",
//                                 "error": "camera not exist"
//                             }
//                         });
//                     }
//                 }
//             });
//         });
//     } catch (e) {
//         res.json({
//             "code": 500,
//             "data": {
//                 "status": "fail",
//                 "error": e.message
//             }
//         });
//     }
// }

/********************************KingDragon*************************************/

/*
 *获取摄像头的所有属性
 *@param type 1=>获取用户自定义属性,-1=>获取所有属性,默认－1
 */
function getCameraAttrs(req,res){
    var query = req.body;
    try {
        var mobile = query.mobile;
        var token = query.token;
        var page = query.page || -1;
        var pageSize = query.pageSize || -1;
        User.getUserInfo(mobile, token, function(user) {
            if (user.error == 0) {
                // user_info = user.data;
                var type = query.type || -1;
                if(type==-1){
                    if(page==-1&&pageSize==-1){
                        var sql = "select * from camera_attr";
                        var data = Array();
                    }else{
                        if (page < 1) {
                            page = 1;
                        }
                        var start = (page - 1) * pageSize;
                        pageSize = parseInt(pageSize);
                        var sql ="select * from camera_attr limit ?,?";
                        var data=[start,pageSize];
                    }
                } else {
                    var sql = "select * from camera_attr where Id>?";
                    var data = [30];
                }
                db.query(sql,data,function(err,rows){
                    if (err) {
                        res.json({
                            "code": 501,
                            "data": {
                                "status": "fail",
                                "error": err.message
                            }
                        });
                    } else {
                        var sql ="select count(id) as total from camera_attr";
                        db.query(sql,null,function (err,result) {
                            if(err){
                                res.json({
                                    "code": 501,
                                    "data": {
                                        "status": "fail",
                                        "error": err.message
                                    }
                                });
                            }else{
                                res.json({
                                    "code": 200,
                                    "data": {
                                        "status": "success",
                                        "error": "success",
                                        "rows": rows,
                                        "total":result[0].total
                                    }
                                });
                            }
                        })
                    }
                });
            } else {
                res.json({
                    "code": 301,
                    "data": {
                        "status": "fail",
                        "error": "用户未登录"
                    }
                });
                return;
            }
        });
    } catch (e) {
        res.json({
            "code": 500,
            "data": {
                "status": "fail",
                "error": e.message
            }
        });
    }
}

/*
 *获取摄像头的所有属性_APP
 *@param type 1=>获取用户自定义属性,-1=>获取所有属性,默认－1
 */
function getCameraAttrs_APP(req,res){
    var query = req.body;
    try {
        var mobile = query.mobile;
        var token = query.token;
        checkMobile2Token_MOBILE(mobile, token, function(result) {
            if (result) {
                // user_info = user.data;
                var type = query.type || -1;
                if(type==-1){
                    var sql = "select * from camera_attr";
                    var data = Array();
                } else {
                    var sql = "select * from camera_attr where Id>?";
                    var data = [30];
                }
                db.query(sql,data,function(err,rows){
                    if (err) {
                        res.json({
                            "code": 501,
                            "data": {
                                "status": "fail",
                                "error": err.message
                            }
                        });
                    } else {
                        //Log.insertLog(mobile,req.url,sql);
                        res.json({
                            "code": 200,
                            "data": {
                                "status": "success",
                                "error": "success",
                                "rows": rows
                            }
                        });
                    }
                });
            } else {
                res.json({
                    "code": 301,
                    "data": {
                        "status": "fail",
                        "error": "用户未登录"
                    }
                });
                return;
            }
        });
    } catch (e) {
        res.json({
            "code": 500,
            "data": {
                "status": "fail",
                "error": e.message
            }
        });
    }
}

/*
 *添加摄像头属性
 *@param attr_name=>属性名字
 *@param attr_desc=>属性描述
 */
function addCameraAttr(req,res){
    var query = req.body;
    try {
        var mobile = query.mobile;
        var token = query.token;
        User.getUserInfo(mobile, token, function(user) {
            if (user.error == 0) {
                // user_info = user.data;
                var attr_name = query.attr_name || -1;
                var attr_desc = query.attr_desc || -1;
                var attr_comment = query.attr_comment || -1;
                var attr_show_1 = query.attr_show_1 || 1;
                var attr_show_2 = query.attr_show_2 || 1;
                var attr_show_3 = query.attr_show_3 || 1;
                var reg = /^(?!.*?_$)[a-zA-Z][a-zA-Z0-9_]*$/;
                if(attr_name==-1 || attr_desc==-1 ){
                    res.json({
                        "code": 303,
                        "data": {
                            "status": "fail",
                            "error": "参数错误"
                        }
                    });
                    return;
                }
                var sqls = "select * from camera_attr where attr_name = ?"
                db.query(sqls,[attr_name],function (err,datas) {
                    if(err){
                        res.json({
                            "code": 303,
                            "data": {
                                "status": "fail",
                                "error": err.message
                            }
                        });
                        return;
                    }else{
                        if(datas.length > 0){
                            res.json({
                                "code": 303,
                                "data": {
                                    "status": "fail",
                                    "error": "字段名已存在！"
                                }
                            });
                            return;
                        }else{
                            if(reg.test(attr_name)){
                                //给camera表添加字段
                                var sql = "alter table camera add column "+attr_name+" text";
                                var dataArr = [];
                                db.query(sql,dataArr,function(err,rows){
                                    if(err){
                                        res.json({
                                            "code": 501,
                                            "data": {
                                                "status": "fail",
                                                "error": err.message
                                            }
                                        });
                                    } else {
                                        //给camera_attr添加记录
                                        sql = "insert into camera_attr(attr_name,attr_desc,attr_comment,attr_show_1,attr_show_2,attr_show_3)"+
                                            "values(?,?,?,?,?,?)";
                                        dataArr = [attr_name,attr_desc,attr_comment,attr_show_1,attr_show_2,attr_show_3];
                                        db.query(sql,dataArr,function(err,rows){
                                            if(err){
                                                res.json({
                                                    "code": 502,
                                                    "data": {
                                                        "status": "fail",
                                                        "error": err.message
                                                    }
                                                });
                                            } else {
                                                Log.insertLog(mobile,"添加摄像头属性",sql);
                                                res.json({
                                                    "code": 200,
                                                    "data": {
                                                        "status": "success",
                                                        "error": "success"
                                                    }
                                                });
                                            }
                                        });
                                    }
                                });
                            } else {
                                res.json({
                                    "code": 302,
                                    "data": {
                                        "status": "fail",
                                        "error": "标识符格式输入有误"
                                    }
                                });
                                return;
                            }
                        }
                    }
                })
            } else {
                res.json({
                    "code": 301,
                    "data": {
                        "status": "fail",
                        "error": "用户未登录"
                    }
                });
                return;
            }
        });
    } catch (e) {
        res.json({
            "code": 500,
            "data": {
                "status": "fail",
                "error": e.message
            }
        });
    }
}

/*
 *编辑摄像头属性
 *@param attrId=>属性Id >43 is needed
 *@param attrNewName=>属性名字
 *@param attrNewDesc=>属性描述
 */
function editCameraAttr(req,res){
    var query = req.body;
    try {
        var mobile = query.mobile;
        var token = query.token;
        var Ids = [1,2,3,12,16,17,18];
        User.getUserInfo(mobile, token, function(user) {
            if (user.error == 0) {
                // user_info = user.data;
                var attrId = query.attrId || -1;
                var attrNewName = query.attrNewName || -1;
                var attrNewDesc = query.attrNewDesc || -1;
                var attrNewComment = query.attrNewComment || -1;
                var attr_show_1 = query.attr_show_1 || 1;
                var attr_show_2 = query.attr_show_2 || 1;
                var attr_show_3 = query.attr_show_3 || 1;
                if(attrId==-1 || attrNewName==-1 || attrNewDesc==-1){
                    res.json({
                        "code": 302,
                        "data": {
                            "status": "fail",
                            "error": "参数错误"
                        }
                    });
                    return;    
                } else {
                    if(Ids.indexOf(attrId) != -1){
                        res.json({
                            "code": 403,
                            "data": {
                                "status": "fail",
                                "error": "该属性不能修改"
                            }
                        });
                        return;    
                    }
                    var sqls="select * from camera_attr where attr_name=? and Id not in (?)";
                    db.query(sqls,[attrNewName,attrId],function (err,result) {
                        if(err){
                            res.json({
                                "code": 501,
                                "data": {
                                    "status": "fail",
                                    "error": err.message
                                }
                            });
                            return;
                        }else{
                            if(result.length>0){
                                res.json({
                                    "code": 403,
                                    "data": {
                                        "status": "fail",
                                        "error": "字段名已存在！"
                                    }
                                });
                                return;
                            }else{
                                //获取对应Id的字段名称
                                db.query("select attr_name from camera_attr where Id=?",
                                    [parseInt(attrId)],function(err,rows){
                                        if(rows && rows.length && rows[0].attr_name){
                                            var attrName = rows[0].attr_name;
                                            //更新camera表
                                            var sql = "alter table camera change "+attrName+" "+
                                                attrNewName+" text";
                                            db.query(sql,[],function(err,rows){
                                                if(err){
                                                    res.json({
                                                        "code": 501,
                                                        "data": {
                                                            "status": "fail",
                                                            "error": err.message
                                                        }
                                                    });
                                                } else {
                                                    //更新camera_attr表
                                                    sql = "update camera_attr set attr_name=?,attr_desc=?,attr_comment=?,attr_show_1=?,attr_show_2=?,attr_show_3=? where Id=?";
                                                    db.query(sql,[attrNewName,attrNewDesc,attrNewComment,attr_show_1,attr_show_2,attr_show_3,attrId],function(err,rows){
                                                        if(err){
                                                            res.json({
                                                                "code": 502,
                                                                "data": {
                                                                    "status": "fail",
                                                                    "error": err.message
                                                                }
                                                            });
                                                        } else {
                                                            Log.insertLog(mobile,"编辑摄像头属性",sql);
                                                            res.json({
                                                                "code": 200,
                                                                "data": {
                                                                    "status": "success",
                                                                    "error": "success"
                                                                }
                                                            });
                                                        }
                                                    });
                                                }
                                            });

                                        } else {
                                            res.json({
                                                "code": 401,
                                                "data": {
                                                    "status": "fail",
                                                    "error": "属性未找到"
                                                }
                                            });
                                        }
                                    });
                            }
                        }
                    })

                }
            } else {
                res.json({
                    "code": 301,
                    "data": {
                        "status": "fail",
                        "error": "用户未登录"
                    }
                });
                return;
            }
        });
    } catch (e) {
        res.json({
            "code": 500,
            "data": {
                "status": "fail",
                "error": e.message
            }
        });
    }
}

//验证账号和token是否匹配_手机端
function checkMobile2Token_MOBILE(mobile, token, callback) {
    db.query("select count(Id) as total from mobileUser where mobile=? and token=? and status=?", [mobile, token, 1],
        function(err, result) {
            if (result && result.length && result[0].total > 0) {
                callback(true);
            } else {
                callback(false);
            }
        });
}


//编辑摄像头属性的展示方式
function editCameraAttrShow(req,res){
    var query = req.body;
    try {
        var mobile = query.mobile;
        var token = query.token;
        User.getUserInfo(mobile, token, function(user) {
            if (user.error == 0) {
                var attrId = query.attrId;
                var attr_show_1 = query.attr_show_1;
                var attr_show_2 = query.attr_show_2;
                var attr_show_3 = query.attr_show_3;
                db.query("update camera_attr set attr_show_1=?,attr_show_2=?,attr_show_3=? where Id=?",
                            [attr_show_1,attr_show_2,attr_show_3,attrId],
                            function(err,result){
                                if(err){
                                    res.json({
                                        "code": 404,
                                        "data": {
                                            "status": "fail",
                                            "error": err.message
                                        }
                                    });                    
                                } else {
                                    Log.insertLog(mobile,"编辑摄像头属性展示方式","editCameraAttrShow");
                                    res.json({
                                        "code": 200,
                                        "data": {
                                            "status": "success",
                                            "error": "success"
                                        }
                                    });   
                                }
                            });
            } else {
                res.json({
                    "code": 301,
                    "data": {
                        "status": "fail",
                        "error": "用户未登录"
                    }
                });
                return;
            }
        });
    } catch (e) {
        res.json({
            "code": 500,
            "data": {
                "status": "fail",
                "error": e.message
            }
        });
    }
}

//批量添加摄像头数据
function multiAddCameras(req,res){
    var query = req.body;
    try {
        var mobile = query.mobile;
        var token = query.token;
        User.getUserInfo(mobile, token, function(user) {
            if (user.error == 0) {
                // user_info = user.data;
                var excel = query.excel;//excel文件的地址
                excel = "./upload/" + excel.split("/")[excel.split("/").length-1];
                fs.stat(excel,function(err,stats){
                    if(err){
                        res.json({
                            "code": 404,
                            "data": {
                                "status": "fail",
                                "error": "文件不存在"
                            }
                        });
                        return;
                    } else {
                        var obj = xlsx.parse(excel);
                        var excelObj = obj[0].data;
                        
                        //获取摄像头属性的总数
                        db.query("select attr_name from camera_attr",[],
                            function(err,attr_name){
                                if(err){
                                    res.json({
                                        "code": 501,
                                        "data": {
                                            "status": "fail",
                                            "error": err.message
                                        }
                                    });
                                } else {
                                    console.log(attr_name);
                                    //attr_name中包含cam_id和is_del,这两个属性批量导入的时候不需要
                                    if(excelObj.length && excelObj[0].length!=attr_name.length-2){
                                    // if(excelObj[0].length!=attr_name.length){
                                        //模版格式不对
                                        res.json({
                                            "code": 502,
                                            "data": {
                                                "status": "fail",
                                                "error": "模板格式错误，请重新下载最新模板"
                                            }
                                        }); 
                                    } else {
                                        //对当前的数据做备份
                                        db.query("select table_name from information_schema.tables where table_schema='police' and table_type='base table'",
                                            [],function(err,data){
                                                if(err){
                                                    res.json({
                                                        "code": 501,
                                                        "data": {
                                                            "status": "fail",
                                                            "error": err.message
                                                        }
                                                    });
                                                } else {
                                                    var camera_copy_exist = false;
                                                    for(var i=0; i<data.length; i++){
                                                        if(data[i].table_name=="camera_copy"){
                                                            camera_copy_exist = true;
                                                            break;
                                                        }
                                                    }
                                                    if(camera_copy_exist){
                                                        // 删除上次的备份表
                                                        // 删除而不是清空的原因是最新版的camera可能已经添加了新的字段 
                                                        db.query("drop table camera_copy",[],function(err,data){
                                                            if(err){
                                                                res.json({
                                                                    "code": 502,
                                                                    "data": {
                                                                        "status": "fail",
                                                                        "error": err.message
                                                                    }
                                                                });
                                                            } else {
                                                                //备份数据及其他后续操作
                                                                multiAddCamerasThen(req,res,excelObj,attr_name);
                                                            }
                                                        });

                                                    } else {
                                                        //备份数据及其他后续操作
                                                        multiAddCamerasThen(req,res,excelObj,attr_name);
                                                    }
                                                }
                                            });
                                    }
                                }
                            });
                    }
                });
            } else {
                res.json({
                    "code": 301,
                    "data": {
                        "status": "fail",
                        "error": "用户未登录"
                    }
                });
                return;
            }
        });
    } catch (e) {
        res.json({
            "code": 500,
            "data": {
                "status": "fail",
                "error": e.message
            }
        });
    }
}

//下载模板
function downloadModel(req,res) {
    var data= [];
    var exlBuf = fs.readFileSync("../police/public/template/template.xlsx");
    db.query("select attr_desc from camera_attr where id not in (1,36)",[],function (err,result) {
        if(err){
            res.json({"code": 503, "data": {"status": "fail", "error": err.message}});
        }else{
            var fileName = "模板";
            ejsExcel.renderExcel(exlBuf,result).then(function (exlBuf2) {
                res.setHeader('Content-Type','application/vnd.openxmlformats');
                res.setHeader('Content-Disposition','attachment;filename='+encodeURI(fileName)+'.xlsx');
                res.write(exlBuf2,'binary');
                res.end();
            });
        }
    });
}

//批量上传摄像头删除上次备份的后续操作
//@param data excel中上传的数据
//@param attr_name camera表的字段名数组，包括cam_id
function multiAddCamerasThen(req,res,data,attr_name){
    // res.json({
    //     "code": 200,
    //     "data": {
    //         "status": "success",
    //         "error": "success"
    //     }
    // });
    db.query("create table camera_copy like camera",[],function(err,result){
       if(err){
            res.json({
                "code": 503,
                "data": {
                    "status": "fail",
                    "error": err.message
                }
            });
       } else {
            db.query("insert into camera_copy select * from camera",[],
                function(err,result){
                    if(err){
                        res.json({
                            "code": 504,
                            "data": {
                                "status": "fail",
                                "error": err.message
                            }
                        });         
                    } else {
                        //弹出cam_id
                        attr_name.shift();
                        //弹出is_del
                        attr_name.splice(34,1);
                        //弹出表头
                        data.shift();
                        //开始导入
                        var date;
                        for(var i=0;i<data[0].length;i++){
                            date = data[0][i];
                            if( date == "更新时间" || date == "安装时间" )
                            {
                                data[1][i] = new date(data[1][i]).getTime();
                            }
                        }
                        var flag = true;
                        var attr_name_list = [];
                        for(var i=0; i<attr_name.length; i++){
                            attr_name_list.push(attr_name[i].attr_name);
                        }

                        async.map(data,function(item,call){
                            var spaceStr = "";
                            for(var i=0; i<item.length; i++){
                                // item[i] = escape(item[i]);
                                spaceStr += "?,";
                            }
                            spaceStr = spaceStr.substring(0,spaceStr.length-1);
                            //item[6]->cam_loc_lan,item[7]->cam_loc_lon
                            //原始坐标需要转换

                            // if(item.length>7 && item[6]<180 && item[7]<180){
                            //     transformPoint(item[7], item[6], function(temp){
                            //         item[6] = temp.x;
                            //         item[7] = temp.y;    
                            //         //插入摄像头数据
                            //         db.query("insert into camera("+attr_name_list.join(',')+")values("+spaceStr+")",item,
                            //             function(err,data){
                            //                 if(err){
                            //                     flag = false;
                            //                     console.log(err.message);
                            //                     call(null, item);
                            //                 } else {
                            //                     call(null, item);
                            //                 }
                            //             });
                            //     });
                                
                            // } else {
                                //插入摄像头数据
                                db.query("insert into camera("+attr_name_list.join(',')+")values("+spaceStr+")",item,
                                    function(err,data){
                                        if(err){
                                            flag = false;
                                            console.log(err.message);
                                            call(null, item);
                                        } else {
                                            call(null, item);
                                        }
                                    });
                            // }
                        },function(err,results){
                            deleteRepeatCameras();
                            autoAddCameraTypes();
                            if(flag){
                                Log.insertLog(req.body.mobile,"批量添加摄像头","multiAddCameras");
                                res.json({
                                    "code": 200,
                                    "data": {
                                        "status": "success",
                                        "error": "success"
                                    }
                                });
                            } else {
                                res.json({
                                    "code": 404,
                                    "data": {
                                        "status": "fail",
                                        "error": "数据出错"
                                    }
                                });
                            }
                        });
                    }
                });
       }
    });
}

/**
 * 自动识别添加摄像头类型
 */
function autoAddCameraTypes(){
    //获取camera表中的摄像头类型
    //获取camera_type中的所有类型
    db.query("select name from camera_type",[],
                function(err, result){
                    if(err){
                        return;
                    } else {
                        cam_categorys = []
                        for(var i=0; i<result.length; i++){
                            cam_categorys.push(result[i]['name']);
                        }
                        //获取camera_type中的所有类型
                        db.query("select distinct(cam_category) as cam_category from camera",[],
                                    function(err, result){
                                        if(err){
                                            return
                                        } else {
                                            for(var i=0; i<result.length; i++){
                                                //不存在则创建
                                                if(cam_categorys.indexOf(result[i].cam_category)==-1){
                                                    autoCreateCameraType(result[i].cam_category);
                                                }
                                            }
                                        }
                                    });
                    }
                });
}

/**
 * 批量导入时自动创建摄像头类型 
 */
function autoCreateCameraType(typeName){
    db.query("insert into camera_type(name)values(?)",[typeName],function(err, result){});
}

//备份摄像头数据
function backupCameras(req,res){
    var query = req.body;
    try {
        var mobile = query.mobile;
        var token = query.token;
        User.getUserInfo(mobile, token, function(user) {
            if (user.error == 0) {
                db.query("select table_name from information_schema.tables where table_schema='police' and table_type='base table'",
                    [],function(err,data){
                        if(err){
                            res.json({
                                "code": 501,
                                "data": {
                                    "status": "fail",
                                    "error": err.message
                                }
                            });
                        } else {
                            var camera_copy_exist = false;
                            for(var i=0; i<data.length; i++){
                                if(data[i].table_name=="camera_copy"){
                                    camera_copy_exist = true;
                                    break;
                                }
                            }
                            if(camera_copy_exist){
                                //删除上次的备份表
                                db.query("drop table camera_copy",[],function(err,data){
                                    if(err){
                                        res.json({
                                            "code": 502,
                                            "data": {
                                                "status": "fail",
                                                "error": err.message
                                            }
                                        });
                                    } else {
                                        //备份数据
                                        backupCamerasThen(req,res);
                                    }
                                });

                            } else {
                                //备份数据
                                backupCamerasThen(req,res);
                            }
                        }
                    });
            } else {
                res.json({
                    "code": 301,
                    "data": {
                        "status": "fail",
                        "error": "用户未登录"
                    }
                });
                return;
            }
        });
    } catch (e) {
        res.json({
            "code": 500,
            "data": {
                "status": "fail",
                "error": e.message
            }
        });
    }
}

//备份摄像头数据
function backupCamerasThen(req,res){
	var query=req.body;
	var mobile=query.mobile;
    db.query("create table camera_copy like camera",[],function(err,data){
       if(err){
            res.json({
                "code": 503,
                "data": {
                    "status": "fail",
                    "error": err.message
                }
            });
       } else {
            db.query("insert into camera_copy select * from camera",[],
                function(err,data){
                    if(err){
                        res.json({
                            "code": 504,
                            "data": {
                                "status": "fail",
                                "error": err.message
                            }
                        }); 
                    } else {
                        Log.insertLog(req.body.mobile,"备份摄像头数据","backupCameras");
                        res.json({
                            "code": 200,
                            "data": {
                                "status": "success",
                                "error": "success"
                            }
                        });
                    }
                });
        }
    });
}

//手动还原摄像头数据
function restoreCameras(req,res){
    var query = req.body;
    try {
        var mobile = query.mobile;
        var token = query.token;
        User.getUserInfo(mobile, token, function(user) {
            if (user.error == 0) {
                db.query("select table_name from information_schema.tables where table_schema='police' and table_type='base table'",
                    [],function(err,data){
                        // console.log(data);
                        if(err){
                            res.json({
                                "code": 501,
                                "data": {
                                    "status": "fail",
                                    "error": err.message
                                }
                            });
                        } else {
                            var camera_copy_exist = false;
                            for(var i=0; i<data.length; i++){
                                if(data[i].table_name=="camera_copy"){
                                    camera_copy_exist = true;
                                    break;
                                }
                            }
                            if(camera_copy_exist){
                                // 清空摄像头表
                                db.query("truncate table camera",[],
                                    function(err,data){
                                        if(err){
                                            res.json({
                                                "code": 502,
                                                "data": {
                                                    "status": "fail",
                                                    "error": err.message
                                                }
                                            });
                                        } else {
                                            //获取camera_copy的所有字段名
                                            db.query("select COLUMN_NAME from information_schema.COLUMNS where "+
                                                        "table_name = 'camera_copy' and table_schema = 'police';",[],
                                                        function(err,data){
                                                            var columns = "";
                                                            for(var i=0; i<data.length; i++){
                                                                columns += data[i].COLUMN_NAME;
                                                                columns += ",";
                                                            }
                                                            columns = columns.substring(0,columns.length-1);
                                                            db.query("insert into camera("+columns+") select * from camera_copy",[],
                                                                function(err,data){
                                                                    if(err){
                                                                         //如果真出错的话，就必须人工调了
                                                                         res.json({
                                                                            "code": 502,
                                                                            "data": {
                                                                                "status": "fail",
                                                                                "error": err.message
                                                                            }
                                                                        });
                                                                       } else {
                                                                            Log.insertLog(mobile,"还原摄像头数据","restoreCameras");
                                                                            res.json({
                                                                                "code": 200,
                                                                                "data": {
                                                                                    "status": "success",
                                                                                    "error": "success"
                                                                                }
                                                                            });
                                                                            //清空地图中的摄像头数据
                                                                            //采用清空的原因是地图中的摄像头数据字段是固定的
                                                                            // db.query("truncate table xc_baymin.smdtv_2",[],
                                                                            //     function(err,data){
                                                                            //         if(err){
                                                                            //             res.json({
                                                                            //                 "code": 502,
                                                                            //                 "data": {
                                                                            //                     "status": "fail",
                                                                            //                     "error": err.message
                                                                            //                 }
                                                                            //             });
                                                                            //         } else {
                                                                            //             //从camera中重新导入数据
                                                                            //             db.query("insert into xc_baymin.smdtv_2(SmX,SmY,cam_id,cam_no,"+
                                                                            //                         "cam_name,cam_sta,cam_loc_la,cam_loc_lo,is_del) select "+
                                                                            //                         "cam_loc_lan,cam_loc_lon,cam_id,cam_no,cam_name,cam_sta,"+
                                                                            //                         "cam_loc_lan,cam_loc_lon,is_del from police.camera",[],
                                                                            //                         function(err,data){
                                                                            //                             if(err){
                                                                            //                                 res.json({
                                                                            //                                     "code": 502,
                                                                            //                                     "data": {
                                                                            //                                         "status": "fail",
                                                                            //                                         "error": err.message
                                                                            //                                     }
                                                                            //                                 });
                                                                            //                             } else {
                                                                            //                                 Log.insertLog(mobile,req.url,"restoreCameras");
                                                                            //                                 res.json({
                                                                            //                                     "code": 200,
                                                                            //                                     "data": {
                                                                            //                                         "status": "success",
                                                                            //                                         "error": "success"
                                                                            //                                     }
                                                                            //                                 });
                                                                            //                             }
                                                                            //                         });
                                                                            //         }
                                                                            //     });
                                                                       }
                                                                });
                                                        });
                                        }    
                                    });
                            } else {
                                //没有可还原的数据
                                res.json({
                                    "code": 404,
                                    "data": {
                                        "status": "fail",
                                        "error": "摄像头备份数据未找到"
                                    }
                                });
                            }
                        }
                    });
            } else {
                res.json({
                    "code": 301,
                    "data": {
                        "status": "fail",
                        "error": "用户未登录"
                    }
                });
                return;
            }
        });
    } catch (e) {
        res.json({
            "code": 500,
            "data": {
                "status": "fail",
                "error": e.message
            }
        });
    }
}

//批量更改摄像头的列属性
function multiEditCamerasByAttr(req,res){
    var query = req.body;
    try {
        var mobile = query.mobile;
        var token = query.token;
        var attrName = query.attrName || -1;
        var excel = query.excel || -1;
        if(attrName==-1 || excel==-1){
            errMessage(res,300,"参数错误");
            return;
        }
        User.getUserInfo(mobile, token, function(user) {
            if (user.error == 0) {
                //获取摄像头的所有属性名
                db.query("select COLUMN_NAME from information_schema.COLUMNS where "+
                            "table_name = 'camera' and table_schema = 'police';",[],
                            function(err,data){
                                if(err){
                                    errMessage(res,404,err.message);
                                    return;
                                } else {
                                    var column_exist = false;
                                    for(var i=0; i<data.length; i++){
                                        if(data[i].COLUMN_NAME==attrName){
                                            column_exist = true;
                                            break;
                                        }
                                    }
                                    if(column_exist){
                                        //读表格
                                        excel = "./upload/" + excel.split("/")[excel.split("/").length-1];
                                        fs.stat(excel,function(err,stats){
                                            if(err){
                                                errMessage(res,404,"文件不存在");
                                                return;
                                            } else {
                                                var obj = xlsx.parse(excel);
                                                var excelObj = obj[0].data;
                                                //判断数据是否够两列
                                                for(var i=0; i<excelObj.length; i++){
                                                    //第一列为ID，第二列为值
                                                    if(excelObj[i].length>=2){
                                                        var cam_id = excelObj[i][0];
                                                        var val = excelObj[i][1];
                                                        db.query("update camera set " + attrName + "=? where cam_id=?",
                                                                    [val,parseInt(cam_id)],function(err,data){
                                                                        if(err){
                                                                            console.log(err.message);
                                                                        }
                                                                    });
                                                    }
                                                }
                                                Log.insertLog(mobile,"批量修改摄像头的列属性","multiEditCamerasByAttr");
                                                sucMessage(res);
                                            }
                                        });
                                    } else {
                                        errMessage(res,404,"摄像头列表中不存在该属性");
                                    }
                                }
                            });
            } else {
                errMessage(res,301,"用户未登录");
                return;
            }
        });
    } catch (e) {
        errMessage(res,500,e.message);
    }
}

//获取摄像头类别
function getCameraTypes(req,res){
    var query = req.body;
    try {
        var mobile = query.mobile;
        var token = query.token;
        User.getUserInfo(mobile, token, function(user) {
            if (user.error == 0) {
                var userId = user.Id
                db.query("select * from camera_type",[],function(err,data){
                    if(err){
                        errMessage(res,500,"数据查询错误");
                    } else {
                        res.json({
                            "code": 200,
                            "data": {
                                "status": "success",
                                "error": "success",
                                "rows": data
                            }
                        });
                    }
                })
            } else {
                errMessage(res,301,"用户未登录");
                return;
            }
        });
    } catch (e) {
        errMessage(res,500,e.message);
    }
}

//编辑摄像头类型
function editCameraTypes(req,res){
    var query = req.body;
    try {
        var mobile = query.mobile;
        var token = query.token;
        User.getUserInfo(mobile, token, function(user) {
            if (user.error == 0) {
                var userId = user.Id;
                var Id = query.Id || -1;
                var name = query.name || -1;
                var url = query.url || -1;
                if(Id==-1 || name==-1 || url==-1){
                    errMessage(res,300,"参数错误");
                    return;
                }
                db.query("update camera_type set name=?,url=? where id=?",
                            [name, url, Id],
                            function(err, result){
                                if(err){
                                    errMessage(res, 500, "数据库查询错误");
                                } else {
                                    Log.insertLog(mobile,"编辑摄像头类型","editCameraTypes");
                                    sucMessage(res);
                                }
                            });
            } else {
                errMessage(res,301,"用户未登录");
                return;
            }
        });
    } catch (e) {
        errMessage(res,500,e.message);
    }
}


//添加摄像头类别
function addCameraTypes(req,res){
    var query = req.body;
    try {
        var mobile = query.mobile;
        var token = query.token;
        User.getUserInfo(mobile, token, function(user) {
            if (user.error == 0) {
                var userId = user.Id;
                var name = query.name || -1;
                var url = query.url || -1;
                var photoMap_url = query.photoMap_url || -1;
                if(name==-1 || url==-1){
                    errMessage(res,300,"参数错误");
                    return;
                }
                //判断类别是否已经存在
                db.query("select count(0) as total from camera_type where name=?",
                            [name],
                            function(err, result){
                                if(err){
                                    errMessage(res, 500, "数据查询错误");
                                } else {
                                    if(result[0].total>0){
                                        errMessage(res, 300, "类别已存在");
                                    } else {
                                        db.query("insert into camera_type(name,url,photoMap_url)values(?,?,?)",
                                                    [name, url, photoMap_url==-1?url:photoMap_url],
                                                    function(err, result){
                                                        if(err){
                                                            errMessage(res, 501, "数据查询错误");
                                                        } else {
                                                            Log.insertLog(mobile,"添加摄像头类别","addCameraTypes");
                                                            sucMessage(res);
                                                        }
                                                    });
                                    }
                                }
                            });
            } else {
                errMessage(res,301,"用户未登录");
                return;
            }
        });
    } catch (e) {
        errMessage(res,500,e.message);
    }
}

//删除类别
function delCameraTypes(req,res){
    var query = req.body;
    try {
        var mobile = query.mobile;
        var token = query.token;
        User.getUserInfo(mobile, token, function(user) {
            if (user.error == 0) {
                var userId = user.Id;
                var Id = query.Id || -1;
                if(Id==-1){
                    errMessage(res, 500, '参数错误');
                } else {
                    //判断类别是否存在
                    db.query("select name from camera_type where id=?",
                                [Id],
                                function(err, result){
                                    if(err){
                                        errMessage(res, 500, "数据查询错误");
                                    } else {
                                        if(result[0].name){
                                            var name = result[0].name;
                                            //删除摄像头类别表记录
                                            db.query("delete from camera_type where id=?",[Id],function(err,result){
                                                if(err){
                                                    errMessage(res, 500, "数据查询错误");
                                                } else {
                                                    //删除这一个类别的摄像头数据
                                                    db.query("delete from camera where cam_category=?",
                                                                [name],
                                                                function(err, result){
                                                                    if(err){
                                                                        errMessage(res, 500, "数据查询错误");
                                                                    } else {
                                                                        Log.insertLog(mobile,"删除摄像头类别","delCameraTypes");
                                                                        sucMessage(res);
                                                                    }
                                                                });
                                                }
                                            });
                                        } else {
                                            errMessage(res, 404, "类别不存在");
                                        }
                                    }
                                });
                }
            } else {
                errMessage(res,301,"用户未登录");
                return;
            }
        });
    } catch (e) {
        errMessage(res,500,e.message);
    }
}

//公用错误输出函数
function errMessage(res,code,msg){
    res.json({
        "code": code,
        "data": {
            "status": "fail",
            "error": msg
        }
    });
}

//公用成功输出函数
function sucMessage(res){
    res.json({
        "code": 200,
        "data": {
            "status": "success",
            "error": "success"
        }
    });
}

//删除摄像字段
function delCameraColumn(req,res){
    var query = req.body;
    try {
        var mobile = query.mobile;
        var token = query.token;
        User.getUserInfo(mobile, token, function(user) {
            if (user.error == 0) {
                var userId = user.Id;
                var targetColumnName = query.targetColumnName || -1;
                if(targetColumnName==-1){
                    errMessage(res,300,"参数错误")
                } else {
                    //判断字段名是否存在
                    db.query("select Id,attr_name from camera_attr where attr_name=?",
                                [targetColumnName],
                                function (error, result) {
                                    if(error){
                                        errMessage(res, 500, error.message);
                                    } else {
                                        if(result && result.length){
                                            var attrId = result[0].Id;
                                            var attrName = result[0].attr_name;
                                            //var Ids = [1,2,3,12,16,17,18];
                                            if(attrId>30){
                                                //删除字段
                                                db.query("alter table camera drop column " + attrName,[],
                                                    function(err,result){
                                                        if(err){
                                                            errMessage(res, 500, err.message);
                                                        } else {
                                                            //删除表记录
                                                            db.query("delete from camera_attr where Id=?",
                                                                [attrId],
                                                                function(err,result){
                                                                    if(err){
                                                                        errMessage(res, 500, err.message);
                                                                    } else {
                                                                        Log.insertLog(mobile,"删除摄像头属性","delCameraColumn");
                                                                        sucMessage(res);
                                                                    }
                                                            });
                                                        }
                                                    });
                                            } else {
                                                errMessage(res, 403, "该字段不允许删除");
                                            }

                                        } else {
                                            errMessage(res, 404, "该字段不存在");
                                        }
                                    }
                                });
                }
            } else {
                errMessage(res,301,"用户未登录");
                return;
            }
        });
    } catch (e) {
        errMessage(res,500,e.message);
    }
}

//坐标转换
function transformPointReq(req,res){
    var query = req.body;
    try {
        var mobile = query.mobile;
        var token = query.token;
        var is_mobile = query.is_mobile || -1;
        if(is_mobile == -1){
            User.getUserInfo(mobile, token, function(user) {
                if (user.error == 0) {
                    var userId = user.Id;
                    var cam_loc_lan = query.cam_loc_lan || 0;
                    var cam_loc_lon = query.cam_loc_lon || 0;
                    transformPoint(cam_loc_lon, cam_loc_lan, function(temp){
                        var ret = {
                            "code": 200,
                            "data": {
                                "cam_loc_lon": cam_loc_lon,
                                "cam_loc_lan": cam_loc_lan,
                                "x": temp.x,
                                "y": temp.y,
                                "status": "success",
                                "error": "success",
                            }
                        }
                        res.json(ret);
                    });
                } else {
                    errMessage(res,301,"用户未登录");
                    return;
                }
            });
        }else{
            mobileUser.getUserInfo(mobile, token, function (mobileUser) {
                if (mobileUser.error == 0) {
                    var mobileUserId = mobileUser.Id;
                    var cam_loc_lan = query.cam_loc_lan || 0;
                    var cam_loc_lon = query.cam_loc_lon || 0;
                    transformPoint(cam_loc_lon, cam_loc_lan, function(temp){
                        var ret = {
                            "code": 200,
                            "data": {
                                "cam_loc_lon": cam_loc_lon,
                                "cam_loc_lan": cam_loc_lan,
                                "x": temp.x,
                                "y": temp.y,
                                "status": "success",
                                "error": "success",
                            }
                        }
                        res.json(ret);
                    });
                } else {
                    errMessage(res,301,"用户未登录");
                    return;
                }
            });
        }
    } catch (e) {
        errMessage(res,500,e.message);
    }
}

/**
 * 坐标转换
 * lon->x, lan->y
 * 备注：数据库中配置的基准点>=2
 */
function transformPoint(x6, y6, callback){
    var offsetX = -550;
    var offsetY = -130;
    var points = [{"outX":116.327776,"outY":39.875582,"inX":498033.469932327,"inY":301059.195618461},{"outX":116.333432,"outY":39.914138,"inX":498518.957701742,"inY":305338.839840951},{"outX":116.356,"outY":39.912359,"inX":500449.868372255,"inY":305141.474901199},{"outX":116.373888,"outY":39.95534,"inX":501979.274145773,"inY":309912.717173924},{"outX":116.370491,"outY":39.910545,"inX":501695.598947556,"inY":304935.534786311},{"outX":116.381665,"outY":39.96497,"inX":502641.758628613,"inY":310981.547784663},{"outX":116.332259,"outY":39.934771,"inX":498419.247007168,"inY":307629.104838969},{"outX":116.351267,"outY":39.942077,"inX":500045.170228061,"inY":308440.156649569},{"outX":116.381078,"outY":39.94459,"inX":502590.366589563,"inY":308716.382775245},{"outX":116.331105,"outY":39.877171,"inX":498318.544755132,"inY":301235.551723765},{"outX":116.370142,"outY":39.877685,"inX":501660.177440119,"inY":301292.834209424},{"outX":116.329821,"outY":39.904577,"inX":498238.024304889,"inY":304277.288432881},{"outX":116.329772,"outY":39.906747,"inX":498205.51575213,"inY":304518.454070742},{"outX":116.346958,"outY":39.907383,"inX":499676.181511844,"inY":304589.064378449},{"outX":116.347562,"outY":39.871629,"inX":499727.327489252,"inY":300620.398469454},{"outX":116.340389,"outY":39.899239,"inX":499113.889763722,"inY":303685.058275527},{"outX":116.358398,"outY":39.885262,"inX":500655.00114947,"inY":302133.72949302},{"outX":116.372927,"outY":39.874461,"inX":501898.586227307,"inY":300935.014242912},{"outX":116.383472,"outY":39.966575,"inX":502798.169967404,"inY":311160.053840673},{"outX":116.383569,"outY":39.966495,"inX":502806.462950322,"inY":311151.175926381},{"outX":116.383569,"outY":39.966495,"inX":502806.462950322,"inY":311151.175926381},{"outX":116.387263,"outY":39.946905,"inX":503122.925086999,"inY":308976.709402005},{"outX":116.386914,"outY":39.954382,"inX":503092.807582348,"inY":309806.672796036},{"outX":116.386914,"outY":39.954382,"inX":503092.807582348,"inY":309806.672796036},{"outX":116.387094,"outY":39.954379,"inX":503108.193838618,"inY":309806.34435738},{"outX":116.387094,"outY":39.954379,"inX":503108.193838618,"inY":309806.34435738},{"outX":116.34938,"outY":39.94607,"inX":499883.828434463,"inY":308883.368457823},{"outX":116.332253,"outY":39.926692,"inX":498419.59117469,"inY":306717.180678796},{"outX":116.337393,"outY":39.927548,"inX":498858.228000242,"inY":306827.348915283},{"outX":116.337331,"outY":39.927614,"inX":498852.92572194,"inY":306834.674858017},{"outX":116.341965,"outY":39.921212,"inX":499249.220261081,"inY":306124.06219751},{"outX":116.345254,"outY":39.921719,"inX":499530.608735075,"inY":306180.354273055},{"outX":116.356529,"outY":39.91218,"inX":500495.126332604,"inY":305121.61135604},{"outX":116.358922,"outY":39.914368,"inX":500699.855314355,"inY":305364.50780983},{"outX":116.366752,"outY":39.911102,"inX":501388.967160334,"inY":305002.086875439},{"outX":116.373599,"outY":39.956689,"inX":501954.539139388,"inY":310062.454315266},{"outX":116.388816,"outY":39.9323,"inX":503256.262456384,"inY":307355.549056841},{"outX":116.383103,"outY":39.94713,"inX":502768.389762732,"inY":308982.749824228},{"outX":116.382741,"outY":39.968532,"inX":502735.628216399,"inY":311377.270268891},{"outX":116.356346,"outY":39.929399,"inX":500479.507009938,"inY":307032.934349074},{"outX":116.35703,"outY":39.927527,"inX":500538.010081362,"inY":306825.147889814},{"outX":116.354388,"outY":39.911677,"inX":500311.94959519,"inY":305065.756412715},{"outX":116.386819,"outY":39.951506,"inX":503084.564983004,"inY":309507.043339345},{"outX":116.383021,"outY":39.967357,"inX":502766.57661416,"inY":311249.830270425},{"outX":116.365943,"outY":39.941272,"inX":501279.293135835,"inY":308348.462466692},{"outX":116.387039,"outY":39.933636,"inX":503104.270302839,"inY":307503.804755722},{"outX":116.323453,"outY":39.941327,"inX":497666.227653257,"inY":308356.859873864},{"outX":116.330349,"outY":39.911495,"inX":498255.061259584,"inY":305045.476478958},{"outX":116.330843,"outY":39.91716,"inX":498305.426734425,"inY":305695.755071817},{"outX":116.330843,"outY":39.91716,"inX":498305.426734425,"inY":305695.755071817},{"outX":116.330843,"outY":39.91716,"inX":498305.426734425,"inY":305695.755071817},{"outX":116.330843,"outY":39.91716,"inX":498305.426734425,"inY":305695.755071817},{"outX":116.331786,"outY":39.918766,"inX":498378.267385722,"inY":305852.549951529},{"outX":116.332433,"outY":39.918527,"inX":498438.957971441,"inY":305826.021057444},{"outX":116.333843,"outY":39.911487,"inX":498554.044164245,"inY":305044.579191176},{"outX":116.333425,"outY":39.913656,"inX":498518.343731149,"inY":305285.338023787},{"outX":116.333425,"outY":39.913656,"inX":498518.343731149,"inY":305285.338023787},{"outX":116.335734,"outY":39.911948,"inX":498715.868396865,"inY":305095.748161498},{"outX":116.335721,"outY":39.911981,"inX":498714.756949419,"inY":305099.411156017},{"outX":116.335721,"outY":39.911981,"inX":498714.756949419,"inY":305099.411156017},{"outX":116.335734,"outY":39.911944,"inX":498715.868283374,"inY":305095.304162803},{"outX":116.335721,"outY":39.911981,"inX":498714.756949419,"inY":305099.411156017},{"outX":116.335721,"outY":39.911981,"inX":498714.756949419,"inY":305099.411156017},{"outX":116.335734,"outY":39.911944,"inX":498715.868283374,"inY":305095.304162803},{"outX":116.335721,"outY":39.911981,"inX":498714.756949419,"inY":305099.411156017},{"outX":116.335721,"outY":39.911981,"inX":498714.756949419,"inY":305099.411156017},{"outX":116.33542,"outY":39.912026,"inX":498689.002257196,"inY":305104.406290153},{"outX":116.33542,"outY":39.912026,"inX":498689.002257196,"inY":305104.406290153},{"outX":116.33542,"outY":39.912026,"inX":498689.002257196,"inY":305104.406290153},{"outX":116.33543,"outY":39.912063,"inX":498689.859001602,"inY":305108.513271944},{"outX":116.33582,"outY":39.912034,"inX":498723.229674788,"inY":305105.294101904},{"outX":116.336492,"outY":39.911146,"inX":498780.706781176,"inY":305006.72627662},{"outX":116.336273,"outY":39.913051,"inX":498762.01999657,"inY":305218.180724274},{"outX":116.336273,"outY":39.913051,"inX":498762.01999657,"inY":305218.180724274},{"outX":116.336273,"outY":39.913051,"inX":498762.01999657,"inY":305218.180724274},{"outX":116.338475,"outY":39.911,"inX":498950.384596709,"inY":304990.521506346},{"outX":116.338475,"outY":39.911,"inX":498950.384596709,"inY":304990.521506346},{"outX":116.338408,"outY":39.914317,"inX":498944.734480092,"inY":305358.707834559},{"outX":116.339508,"outY":39.916543,"inX":499038.906320512,"inY":305605.795539607},{"outX":116.332092,"outY":39.926676,"inX":498405.816874718,"inY":306715.404989261},{"outX":116.33396,"outY":39.922139,"inX":498544.887482264,"inY":306232.81552736},{"outX":116.333785,"outY":39.926545,"inX":498549.538488908,"inY":306716.01502958},{"outX":116.334777,"outY":39.921432,"inX":498634.257235399,"inY":306148.471011549},{"outX":116.334535,"outY":39.922265,"inX":498616.766614453,"inY":306246.994008617},{"outX":116.334613,"outY":39.922235,"inX":498626.355418039,"inY":306246.853703177},{"outX":116.334163,"outY":39.926633,"inX":498598.0104315,"inY":306720.226272647},{"outX":116.334129,"outY":39.926654,"inX":498595.102335346,"inY":306722.557301917},{"outX":116.334126,"outY":39.926656,"inX":498594.845743017,"inY":306722.779304551},{"outX":116.335025,"outY":39.921408,"inX":498655.474594083,"inY":306145.806892828},{"outX":116.336285,"outY":39.925941,"inX":498763.397782283,"inY":306648.970464509},{"outX":116.336285,"outY":39.925941,"inX":498763.397782283,"inY":306648.970464509},{"outX":116.338587,"outY":39.921607,"inX":498975.251302853,"inY":306169.254698318},{"outX":116.338641,"outY":39.923364,"inX":498964.890933472,"inY":306362.925705},{"outX":116.339592,"outY":39.921629,"inX":499046.211037053,"inY":306170.342286984},{"outX":116.339606,"outY":39.921539,"inX":499047.406723548,"inY":306160.352300642},{"outX":116.339724,"outY":39.921583,"inX":499057.503086549,"inY":306165.236585},{"outX":116.331294,"outY":39.932473,"inX":498336.624448543,"inY":307374.027988213},{"outX":116.332114,"outY":39.930634,"inX":498406.712653657,"inY":307169.896957041},{"outX":116.339351,"outY":39.940383,"inX":499030.266340253,"inY":308252.231461694},{"outX":116.340378,"outY":39.9099,"inX":499118.912097384,"inY":304872.461919411},{"outX":116.341674,"outY":39.917341,"inX":499218.358575494,"inY":305694.377861611},{"outX":116.341674,"outY":39.917341,"inX":499218.358575494,"inY":305694.377861611},{"outX":116.341912,"outY":39.918004,"inX":499244.621112109,"inY":305767.973249045},{"outX":116.342063,"outY":39.91733,"inX":499257.526633712,"inY":305779.75149172},{"outX":116.34624,"outY":39.910385,"inX":499614.790617575,"inY":304922.282512435},{"outX":116.346271,"outY":39.911388,"inX":499617.458453359,"inY":305033.615786245},{"outX":116.348159,"outY":39.919774,"inX":499779.105699246,"inY":305964.476174182},{"outX":116.34134,"outY":39.921648,"inX":499195.758624605,"inY":306172.456169433},{"outX":116.341969,"outY":39.921028,"inX":499249.55878371,"inY":306115.953446853},{"outX":116.342986,"outY":39.926224,"inX":499336.662864658,"inY":306680.400351819},{"outX":116.342986,"outY":39.926224,"inX":499336.662864658,"inY":306680.400351819},{"outX":116.344847,"outY":39.92255,"inX":499495.803334905,"inY":306272.593491669},{"outX":116.344847,"outY":39.92255,"inX":499495.803334905,"inY":306272.593491669},{"outX":116.345269,"outY":39.921729,"inX":499531.892148787,"inY":306181.464359139},{"outX":116.345247,"outY":39.927052,"inX":499530.093972348,"inY":306782.367025341},{"outX":116.347715,"outY":39.924935,"inX":499741.187184311,"inY":306537.347258173},{"outX":116.348036,"outY":39.923087,"inX":499768.624256355,"inY":306332.220246887},{"outX":116.348028,"outY":39.924288,"inX":499767.954708453,"inY":306465.531983371},{"outX":116.348459,"outY":39.924458,"inX":499804.826696432,"inY":306484.405166255},{"outX":116.349112,"outY":39.920738,"inX":499860.646205357,"inY":306071.487507777},{"outX":116.342378,"outY":39.931529,"inX":499284.751892674,"inY":307269.255922213},{"outX":116.342458,"outY":39.931612,"inX":499291.596639924,"inY":307278.4693257},{"outX":116.342457,"outY":39.931735,"inX":499291.513412874,"inY":307292.122406889},{"outX":116.342077,"outY":39.934685,"inX":499259.064929371,"inY":307619.572951692},{"outX":116.342825,"outY":39.939821,"inX":499323.138238761,"inY":308189.676961775},{"outX":116.34374,"outY":39.931808,"inX":499401.261412699,"inY":307300.231503584},{"outX":116.343021,"outY":39.932277,"inX":499339.767421454,"inY":307352.287348588},{"outX":116.343468,"outY":39.937512,"inX":499378.093896274,"inY":307933.378968412},{"outX":116.345873,"outY":39.935643,"inX":499583.769321359,"inY":307725.932059661},{"outX":116.346687,"outY":39.930391,"inX":499653.321996342,"inY":307142.960529525},{"outX":116.346821,"outY":39.93052,"inX":499664.785897963,"inY":307157.280524388},{"outX":116.346876,"outY":39.937443,"inX":499669.581581873,"inY":307925.740639281},{"outX":116.346806,"outY":39.938178,"inX":499663.604063528,"inY":308007.32596342},{"outX":116.346806,"outY":39.938178,"inX":499663.604063528,"inY":308007.32596342},{"outX":116.347541,"outY":39.930223,"inX":499730.167753906,"inY":307124.80971525},{"outX":116.347142,"outY":39.937653,"inX":499692.335107769,"inY":307949.052750074},{"outX":116.347142,"outY":39.937653,"inX":499692.335107769,"inY":307949.052750074},{"outX":116.347279,"outY":39.937169,"inX":499704.046588603,"inY":307895.329194377},{"outX":116.348058,"outY":39.931511,"inX":499770.60812111,"inY":307267.291062831},{"outX":116.342958,"outY":39.941097,"inX":499334.536138788,"inY":308331.314925814},{"outX":116.346078,"outY":39.940807,"inX":499601.375226325,"inY":308299.142987671},{"outX":116.351004,"outY":39.91154,"inX":500022.420189263,"inY":305050.519673945},{"outX":116.351467,"outY":39.918159,"inX":500062.090978512,"inY":305785.235621525},{"outX":116.353012,"outY":39.913521,"inX":500194.235353128,"inY":305270.428532809},{"outX":116.353905,"outY":39.918345,"inX":500282.596596032,"inY":305793.310481813},{"outX":116.35419,"outY":39.9136,"inX":500295.01960953,"inY":305279.208532033},{"outX":116.354018,"outY":39.918363,"inX":500280.329714274,"inY":305807.902954874},{"outX":116.35884,"outY":39.913362,"inX":500692.840720128,"inY":305252.84005506},{"outX":116.358986,"outY":39.913654,"inX":500705.331037564,"inY":305285.254003116},{"outX":116.358986,"outY":39.913654,"inX":500705.331037564,"inY":305285.254003116},{"outX":116.359055,"outY":39.913708,"inX":500711.234017573,"inY":305291.248863637},{"outX":116.359055,"outY":39.913708,"inX":500711.234017573,"inY":305291.248863637},{"outX":116.359328,"outY":39.913609,"inX":500734.589511583,"inY":305280.263044403},{"outX":116.353382,"outY":39.928968,"inX":500225.980790039,"inY":306985.061399791},{"outX":116.353387,"outY":39.929109,"inX":500228.455917287,"inY":306989.235002847},{"outX":116.353387,"outY":39.929109,"inX":500226.409223199,"inY":306991.014145212},{"outX":116.353387,"outY":39.929109,"inX":500227.65503704,"inY":306995.552194073},{"outX":116.353387,"outY":39.929109,"inX":500226.142263071,"inY":306996.085764934},{"outX":116.353851,"outY":39.929445,"inX":500266.099343351,"inY":307038.013624662},{"outX":116.353851,"outY":39.929445,"inX":500266.099343351,"inY":307038.013624662},{"outX":116.353851,"outY":39.929445,"inX":500266.099343351,"inY":307038.013624662},{"outX":116.353851,"outY":39.929445,"inX":500266.099343351,"inY":307038.013624662},{"outX":116.353851,"outY":39.929445,"inX":500266.099343351,"inY":307038.013624662},{"outX":116.35886,"outY":39.921865,"inX":500709.784254133,"inY":306202.988987166},{"outX":116.35964,"outY":39.921331,"inX":500761.267912483,"inY":306137.416156712},{"outX":116.350035,"outY":39.934235,"inX":499939.737478635,"inY":307569.673504648},{"outX":116.350062,"outY":39.934253,"inX":499942.046997912,"inY":307571.671753754},{"outX":116.350979,"outY":39.937862,"inX":500020.507772259,"inY":307972.283189826},{"outX":116.353295,"outY":39.934255,"inX":500226.214486029,"inY":307580.09303312},{"outX":116.353986,"outY":39.93504,"inX":500277.671195299,"inY":307659.066901143},{"outX":116.354003,"outY":39.934838,"inX":500279.124318944,"inY":307636.644810349},{"outX":116.354157,"outY":39.935624,"inX":500292.298804261,"inY":307723.893484325},{"outX":116.354157,"outY":39.935624,"inX":500292.298804261,"inY":307723.893484325},{"outX":116.358577,"outY":39.935603,"inX":500670.321861198,"inY":307721.613773984},{"outX":116.35115,"outY":39.940298,"inX":500035.151111208,"inY":308242.68402882},{"outX":116.35115,"outY":39.940298,"inX":500035.151111208,"inY":308242.68402882},{"outX":116.353104,"outY":39.942706,"inX":500243.52582286,"inY":308499.538494597},{"outX":116.356391,"outY":39.941751,"inX":500483.370860242,"inY":308404.024877422},{"outX":116.359623,"outY":39.941646,"inX":500774.82949391,"inY":308393.446951337},{"outX":116.359863,"outY":39.941227,"inX":500780.286615979,"inY":308345.904058414},{"outX":116.359834,"outY":39.94125,"inX":500777.806570227,"inY":308348.45670914},{"outX":116.365846,"outY":39.911112,"inX":501292.217337243,"inY":305003.18116472},{"outX":116.368249,"outY":39.916892,"inX":501497.718931583,"inY":305644.804898328},{"outX":116.36295,"outY":39.926233,"inX":501044.374088735,"inY":306681.588498244},{"outX":116.362946,"outY":39.926237,"inX":501044.031933187,"inY":306682.032447166},{"outX":116.36244,"outY":39.929816,"inX":501000.731379131,"inY":307079.299566406},{"outX":116.36311,"outY":39.926206,"inX":501058.059455956,"inY":306678.593736234},{"outX":116.364563,"outY":39.921285,"inX":501182.377877024,"inY":306132.377008089},{"outX":116.36613,"outY":39.922906,"inX":501329.833202399,"inY":306310.644839392},{"outX":116.367515,"outY":39.921955,"inX":501434.873211057,"inY":306206.793204},{"outX":116.367532,"outY":39.922049,"inX":501436.326181655,"inY":306217.227614466},{"outX":116.360932,"outY":39.939749,"inX":500871.709923217,"inY":308181.858022931},{"outX":116.360932,"outY":39.939749,"inX":500871.709923217,"inY":308181.858022931},{"outX":116.360932,"outY":39.939749,"inX":500871.709923217,"inY":308181.858022931},{"outX":116.360932,"outY":39.939749,"inX":500871.709923217,"inY":308181.858022931},{"outX":116.360932,"outY":39.939749,"inX":500871.709923217,"inY":308181.858022931},{"outX":116.361276,"outY":39.938774,"inX":500901.132759519,"inY":308073.636069313},{"outX":116.36161,"outY":39.938658,"inX":500929.696403468,"inY":308060.764565848},{"outX":116.361731,"outY":39.938836,"inX":500940.043072001,"inY":308080.524604783},{"outX":116.369958,"outY":39.936638,"inX":501643.606507448,"inY":307836.673673891},{"outX":116.360197,"outY":39.940205,"inX":500806.821657096,"inY":308213.44572696},{"outX":116.36176,"outY":39.944578,"inX":500942.489425722,"inY":308717.898008046},{"outX":116.362205,"outY":39.940571,"inX":500980.567456342,"inY":308273.119632903},{"outX":116.365472,"outY":39.941279,"inX":501259.934183536,"inY":308351.75885254},{"outX":116.365731,"outY":39.941961,"inX":501282.07435951,"inY":308427.466431991},{"outX":116.365464,"outY":39.942232,"inX":501259.24010115,"inY":308457.543710795},{"outX":116.365823,"outY":39.942688,"inX":501273.599218063,"inY":308503.702357789},{"outX":116.367846,"outY":39.956024,"inX":501462.732662231,"inY":309988.528738952},{"outX":116.368014,"outY":39.954735,"inX":501477.113932202,"inY":309845.449293266},{"outX":116.368014,"outY":39.954735,"inX":501477.113932202,"inY":309845.449293266},{"outX":116.369726,"outY":39.950705,"inX":501623.543418767,"inY":309398.139528595},{"outX":116.368534,"outY":39.96469,"inX":501521.416904496,"inY":310950.491574682},{"outX":116.370997,"outY":39.916755,"inX":501732.782412839,"inY":305629.6434404},{"outX":116.371168,"outY":39.916793,"inX":501742.126079892,"inY":305637.617691324},{"outX":116.373809,"outY":39.921106,"inX":501978.271853711,"inY":306106.94506749},{"outX":116.373768,"outY":39.922335,"inX":501969.697044612,"inY":306249.082030508},{"outX":116.373771,"outY":39.92233,"inX":501969.953729899,"inY":306248.527077496},{"outX":116.374276,"outY":39.926181,"inX":502013.067297828,"inY":306676.004706557},{"outX":116.370001,"outY":39.936634,"inX":501647.283680552,"inY":307836.230426083},{"outX":116.370028,"outY":39.942948,"inX":501649.4912482,"inY":308537.098944725},{"outX":116.371393,"outY":39.946991,"inX":501754.907568541,"inY":308983.985586732},{"outX":116.372938,"outY":39.943993,"inX":501898.290444663,"inY":308653.150676032},{"outX":116.37296,"outY":39.944015,"inX":501900.171065079,"inY":308655.593154784},{"outX":116.378514,"outY":39.943088,"inX":502375.065602742,"inY":308552.806921015},{"outX":116.379887,"outY":39.943656,"inX":502492.439352938,"inY":308615.886388329},{"outX":116.379872,"outY":39.943633,"inX":502491.157544998,"inY":308613.332992902},{"outX":116.379716,"outY":39.948584,"inX":502475.473416829,"inY":309149.955535261},{"outX":116.370544,"outY":39.951426,"inX":501693.467052984,"inY":309478.187470658},{"outX":116.371381,"outY":39.957555,"inX":501764.819227017,"inY":310155.936987045},{"outX":116.372377,"outY":39.959794,"inX":501850.011779318,"inY":310407.094196139},{"outX":116.373628,"outY":39.953124,"inX":501957.094745563,"inY":309666.729578879},{"outX":116.3738,"outY":39.954193,"inX":501971.776063449,"inY":309785.395076906},{"outX":116.374551,"outY":39.954053,"inX":502035.981484107,"inY":309769.86986205},{"outX":116.379029,"outY":39.967417,"inX":502418.411371218,"inY":311253.413678363},{"outX":116.376223,"outY":39.97037,"inX":502178.507599374,"inY":311581.144469657},{"outX":116.376324,"outY":39.970256,"inX":502187.142725152,"inY":311568.492275123},{"outX":116.386156,"outY":39.921941,"inX":503042.666469131,"inY":306211.586629334},{"outX":116.380023,"outY":39.932269,"inX":502504.39023645,"inY":307351.902613978},{"outX":116.384436,"outY":39.932951,"inX":502881.722702226,"inY":307427.705615648},{"outX":116.384436,"outY":39.932951,"inX":502881.722702226,"inY":307427.705615648},{"outX":116.384436,"outY":39.932951,"inX":502881.722702226,"inY":307427.705615648},{"outX":116.384371,"outY":39.939681,"inX":502875.937934521,"inY":308174.752647399},{"outX":116.385336,"outY":39.93221,"inX":502958.704654145,"inY":307345.473853327},{"outX":116.380618,"outY":39.945583,"inX":502554.880989891,"inY":308829.805159429},{"outX":116.381559,"outY":39.949194,"inX":502635.219592679,"inY":309230.658323992},{"outX":116.381574,"outY":39.949631,"inX":502636.488376942,"inY":309279.167013856},{"outX":116.381542,"outY":39.949681,"inX":502629.497541044,"inY":309273.182520118},{"outX":116.381659,"outY":39.949886,"inX":502623.070532264,"inY":309276.370680681},{"outX":116.385876,"outY":39.940101,"inX":503004.597971018,"inY":308221.409968405},{"outX":116.386123,"outY":39.940414,"inX":503025.704462704,"inY":308256.15991218},{"outX":116.384536,"outY":39.953413,"inX":502889.571021118,"inY":309699.051352159},{"outX":116.385939,"outY":39.951988,"inX":503009.553372176,"inY":309540.906109178},{"outX":116.385623,"outY":39.953347,"inX":502982.491606786,"inY":309691.751854119},{"outX":116.385629,"outY":39.953346,"inX":502983.004528858,"inY":309691.640999536},{"outX":116.386529,"outY":39.952474,"inX":503059.969688059,"inY":309594.868500343},{"outX":116.386529,"outY":39.952474,"inX":503059.969688059,"inY":309594.868500343},{"outX":116.386504,"outY":39.952647,"inX":503057.826191843,"inY":309614.071462124},{"outX":116.382256,"outY":39.968314,"inX":502694.729578652,"inY":311347.009152316},{"outX":116.382741,"outY":39.968532,"inX":502735.628216399,"inY":311377.270268891},{"outX":116.382142,"outY":39.969913,"inX":502691.961676028,"inY":311530.912654037},{"outX":116.384494,"outY":39.969664,"inX":502885.405380889,"inY":311502.969917756},{"outX":116.382206,"outY":39.97017,"inX":502689.850559334,"inY":311559.081432906},{"outX":116.318386,"outY":39.883806,"inX":497229.933063856,"inY":301972.136665807},{"outX":116.318415,"outY":39.883836,"inX":497232.4173224,"inY":301975.466214386},{"outX":116.319962,"outY":39.892469,"inX":497365.283453423,"inY":302933.69267741},{"outX":116.319962,"outY":39.892469,"inX":497365.283453423,"inY":302933.69267741},{"outX":116.319961,"outY":39.892469,"inX":497365.197854077,"inY":302933.692689162},{"outX":116.346412,"outY":39.868527,"inX":499628.819513342,"inY":300276.076535828},{"outX":116.365344,"outY":39.870163,"inX":501249.566440281,"inY":300457.828687526},{"outX":116.319637,"outY":39.881737,"inX":497336.927934237,"inY":301742.466140214},{"outX":116.323535,"outY":39.889162,"inX":497670.97925259,"inY":302566.583895414},{"outX":116.323535,"outY":39.889162,"inX":497670.97925259,"inY":302566.583895414},{"outX":116.32888,"outY":39.889214,"inX":498211.306213087,"inY":302584.667336593},{"outX":116.33907,"outY":39.898395,"inX":499000.986485819,"inY":303591.373040064},{"outX":116.344952,"outY":39.874996,"inX":499503.944793483,"inY":300994.120783889},{"outX":116.34513,"outY":39.875003,"inX":499519.18326212,"inY":300994.898349773},{"outX":116.347968,"outY":39.877976,"inX":499762.183286664,"inY":301324.909210329},{"outX":116.347836,"outY":39.878176,"inX":499750.886748152,"inY":301347.108339346},{"outX":116.356064,"outY":39.877359,"inX":500455.200628275,"inY":301256.478781266},{"outX":116.350157,"outY":39.895794,"inX":499949.779438205,"inY":303302.707154795},{"outX":116.352041,"outY":39.891781,"inX":500110.973143933,"inY":302857.279103346},{"outX":116.352041,"outY":39.891781,"inX":500110.973143933,"inY":302857.279103346},{"outX":116.352719,"outY":39.895543,"inX":500169.029721301,"inY":303274.86528304},{"outX":116.366659,"outY":39.88677,"inX":501361.996052408,"inY":302301.217965843},{"outX":116.339652,"outY":39.907527,"inX":499051.01522786,"inY":304605.021167249},{"outX":116.346958,"outY":39.907383,"inX":499676.181511844,"inY":304589.064378449},{"outX":116.346958,"outY":39.907383,"inX":499676.181511844,"inY":304589.064378449},{"outX":116.355801,"outY":39.906716,"inX":500432.823058231,"inY":304515.097138473},{"outX":116.349556,"outY":39.902974,"inX":499898.431656854,"inY":304099.681751356},{"outX":116.383566,"outY":39.898875,"inX":502917.561109014,"inY":303710.68883778},{"outX":116.382358,"outY":39.888528,"inX":502706.388973164,"inY":302513.958321059},{"outX":116.319622,"outY":39.881717,"inX":497335.642736701,"inY":301740.246371913},{"outX":116.319424,"outY":39.882344,"inX":497318.723040872,"inY":301809.844458234},{"outX":116.319842,"outY":39.882283,"inX":497354.50583773,"inY":301803.068392855},{"outX":116.321568,"outY":39.87965,"inX":497502.145656164,"inY":301510.791009467},{"outX":116.32252,"outY":39.87697,"inX":497583.525118371,"inY":301213.306745648},{"outX":116.323853,"outY":39.875519,"inX":497697.587388171,"inY":301052.235564346},{"outX":116.323853,"outY":39.875519,"inX":497697.587388171,"inY":301052.235564346},{"outX":116.323298,"outY":39.878911,"inX":497650.224674585,"inY":301428.74539586},{"outX":116.32406,"outY":39.875388,"inX":497715.304596474,"inY":301037.692870424},{"outX":116.32406,"outY":39.875388,"inX":497715.304596474,"inY":301037.692870424},{"outX":116.320649,"outY":39.885145,"inX":497423.734500929,"inY":302120.734685712},{"outX":116.320568,"outY":39.886252,"inX":497416.854303085,"inY":302243.610379538},{"outX":116.320898,"outY":39.887882,"inX":497445.183358758,"inY":302424.533404722},{"outX":116.320898,"outY":39.887882,"inX":497445.183358758,"inY":302424.533404722},{"outX":116.322536,"outY":39.887845,"inX":497585.401670076,"inY":302420.408978255},{"outX":116.323275,"outY":39.889166,"inX":497648.722871347,"inY":302567.030338748},{"outX":116.323509,"outY":39.88917,"inX":497668.753957349,"inY":302567.47212425},{"outX":116.32891,"outY":39.884286,"inX":498130.897315224,"inY":302025.315528897},{"outX":116.329066,"outY":39.88384,"inX":498149.732800685,"inY":301987.671839018},{"outX":116.329083,"outY":39.884199,"inX":498145.703788638,"inY":302015.657666232},{"outX":116.322752,"outY":39.893714,"inX":497598.524247953,"inY":303085.236880838},{"outX":116.323886,"outY":39.895279,"inX":497701.29666747,"inY":303245.557761588},{"outX":116.32394,"outY":39.895246,"inX":497705.917307661,"inY":303241.894335771},{"outX":116.323994,"outY":39.895231,"inX":497710.53874312,"inY":303240.228884987},{"outX":116.324069,"outY":39.89522,"inX":497716.95783663,"inY":303239.00724751},{"outX":116.339138,"outY":39.874167,"inX":499006.183792917,"inY":300902.093902981},{"outX":116.334084,"outY":39.882425,"inX":498573.755793862,"inY":301818.725398724},{"outX":116.334943,"outY":39.887596,"inX":498647.451084447,"inY":302392.696937552},{"outX":116.335061,"outY":39.881095,"inX":498657.350985761,"inY":301671.095108397},{"outX":116.335062,"outY":39.881236,"inX":498657.440973536,"inY":301686.745883869},{"outX":116.333185,"outY":39.897397,"inX":498449.542954936,"inY":303470.172369858},{"outX":116.333185,"outY":39.897397,"inX":498468.369356679,"inY":303497.672133949},{"outX":116.334152,"outY":39.890687,"inX":498579.840350874,"inY":302735.795690411},{"outX":116.337101,"outY":39.898631,"inX":498832.478845485,"inY":303617.568091087},{"outX":116.337759,"outY":39.899819,"inX":498888.824531695,"inY":303749.435239293},{"outX":116.347589,"outY":39.871351,"inX":499729.634525963,"inY":300589.540987176},{"outX":116.347017,"outY":39.872052,"inX":499680.676364181,"inY":300667.348531755},{"outX":116.349414,"outY":39.876226,"inX":499885.941093512,"inY":301130.668783392},{"outX":116.342052,"outY":39.880446,"inX":499255.800075835,"inY":301599.056118824},{"outX":116.342185,"outY":39.880378,"inX":499267.183845515,"inY":301591.508457547},{"outX":116.344119,"outY":39.884884,"inX":499432.829023704,"inY":302091.674166654},{"outX":116.344292,"outY":39.884536,"inX":499447.630537706,"inY":302053.04707986},{"outX":116.344292,"outY":39.884536,"inX":499447.630537706,"inY":302053.04707986},{"outX":116.345677,"outY":39.884646,"inX":499566.184033601,"inY":302065.261994371},{"outX":116.346265,"outY":39.883392,"inX":499616.493245641,"inY":301926.071645385},{"outX":116.347461,"outY":39.887114,"inX":499718.924567892,"inY":302339.215909587},{"outX":116.349957,"outY":39.885554,"inX":499932.541160052,"inY":302166.071200231},{"outX":116.349957,"outY":39.885554,"inX":499932.541160052,"inY":302166.071200231},{"outX":116.341977,"outY":39.890521,"inX":499249.603470834,"inY":302717.369967212},{"outX":116.341448,"outY":39.895754,"inX":499204.442852399,"inY":303298.227641862},{"outX":116.341286,"outY":39.897169,"inX":499190.609769211,"inY":303455.291333811},{"outX":116.341286,"outY":39.897169,"inX":499190.609769211,"inY":303455.291333811},{"outX":116.34129,"outY":39.89717,"inX":499190.952124766,"inY":303455.402341817},{"outX":116.34129,"outY":39.89717,"inX":499190.952124766,"inY":303455.402341817},{"outX":116.341284,"outY":39.897219,"inX":499190.439720276,"inY":303460.841296996},{"outX":116.34414,"outY":39.893294,"inX":499434.788779246,"inY":303025.177088495},{"outX":116.34517,"outY":39.897261,"inX":499523.012395298,"inY":303465.515844286},{"outX":116.345172,"outY":39.897262,"inX":499523.18357447,"inY":303465.626852391},{"outX":116.345988,"outY":39.897176,"inX":499602.018576847,"inY":303467.037040662},{"outX":116.353757,"outY":39.870866,"inX":500257.669946548,"inY":300535.743402042},{"outX":116.353145,"outY":39.879112,"inX":500205.351400031,"inY":301451.036356592},{"outX":116.350213,"outY":39.88585,"inX":499954.456306936,"inY":302198.928604535},{"outX":116.350329,"outY":39.885895,"inX":499956.720831757,"inY":302191.751222199},{"outX":116.350311,"outY":39.88719,"inX":499962.860061335,"inY":302347.668321455},{"outX":116.35008,"outY":39.888576,"inX":499943.105327447,"inY":302501.511952649},{"outX":116.351493,"outY":39.88328,"inX":500063.986495652,"inY":301913.669020815},{"outX":116.351493,"outY":39.88328,"inX":500063.986495652,"inY":301913.669020815},{"outX":116.351492,"outY":39.883278,"inX":500063.900880541,"inY":301913.44701542},{"outX":116.35147,"outY":39.883255,"inX":500062.017567489,"inY":301910.893880905},{"outX":116.351943,"outY":39.887662,"inX":500102.546709112,"inY":302400.071329243},{"outX":116.352223,"outY":39.881525,"inX":500126.453124888,"inY":301718.870548184},{"outX":116.352338,"outY":39.881275,"inX":500136.294252065,"inY":301691.121580335},{"outX":116.352152,"outY":39.883022,"inX":500120.390385308,"inY":301885.035878125},{"outX":116.352166,"outY":39.883553,"inX":500121.593825804,"inY":301943.976590716},{"outX":116.352166,"outY":39.883553,"inX":500121.593825804,"inY":301943.976590716},{"outX":116.352613,"outY":39.883333,"inX":500159.85198068,"inY":301919.56004163},{"outX":116.352613,"outY":39.883333,"inX":500159.85198068,"inY":301919.56004163},{"outX":116.352113,"outY":39.884689,"inX":500135.904695881,"inY":302066.012943009},{"outX":116.352043,"outY":39.887065,"inX":500111.099838436,"inY":302333.805405024},{"outX":116.358039,"outY":39.884388,"inX":500624.273462531,"inY":302036.712179774},{"outX":116.350682,"outY":39.890426,"inX":499994.650045773,"inY":302706.864922707},{"outX":116.350718,"outY":39.892194,"inX":499997.75051888,"inY":302903.112343584},{"outX":116.350943,"outY":39.892242,"inX":500017.007312136,"inY":302908.44189512},{"outX":116.35356,"outY":39.893959,"inX":500240.98917414,"inY":303099.048559185},{"outX":116.353122,"outY":39.896822,"inX":500203.527429649,"inY":303416.837364659},{"outX":116.35372,"outY":39.896923,"inX":500254.702549586,"inY":303428.053416435},{"outX":116.35372,"outY":39.896923,"inX":500254.702549586,"inY":303428.053416435},{"outX":116.353735,"outY":39.898861,"inX":500255.999376933,"inY":303643.171413848},{"outX":116.353735,"outY":39.898861,"inX":500255.999376933,"inY":303643.171413848},{"outX":116.353735,"outY":39.898861,"inX":500255.999376933,"inY":303643.171413848},{"outX":116.353735,"outY":39.898861,"inX":500255.999376933,"inY":303643.171413848},{"outX":116.355946,"outY":39.899637,"inX":500445.203116959,"inY":303729.327908472},{"outX":116.35601,"outY":39.894588,"inX":500450.659330017,"inY":303168.889525206},{"outX":116.356349,"outY":39.898531,"inX":500479.684201234,"inY":303606.565790255},{"outX":116.356349,"outY":39.898531,"inX":500479.684201234,"inY":303606.565790255},{"outX":116.356018,"outY":39.899528,"inX":500451.363784339,"inY":303717.22960433},{"outX":116.357439,"outY":39.892342,"inX":500579.885992837,"inY":302919.309796823},{"outX":116.359295,"outY":39.891575,"inX":500731.775186542,"inY":302834.480636816},{"outX":116.359696,"outY":39.895066,"inX":500766.090872791,"inY":303221.986133511},{"outX":116.361725,"outY":39.87024,"inX":500961.181452072,"inY":300464.889064488},{"outX":116.364201,"outY":39.877242,"inX":501151.691017991,"inY":301243.579158451},{"outX":116.367578,"outY":39.879499,"inX":501440.711904068,"inY":301494.150426392},{"outX":116.367578,"outY":39.879499,"inX":501440.711904068,"inY":301494.150426392},{"outX":116.368631,"outY":39.874877,"inX":501530.883151272,"inY":300981.12469503},{"outX":116.368631,"outY":39.874877,"inX":501530.883151272,"inY":300981.12469503},{"outX":116.368835,"outY":39.879411,"inX":501548.295330162,"inY":301484.400501755},{"outX":116.36921,"outY":39.879381,"inX":501580.390484142,"inY":301481.076022134},{"outX":116.361159,"outY":39.882451,"inX":500891.308091311,"inY":301821.739547101},{"outX":116.361796,"outY":39.885989,"inX":500945.819244261,"inY":302214.463982841},{"outX":116.365993,"outY":39.887117,"inX":501304.997682988,"inY":302339.725725962},{"outX":116.366006,"outY":39.887127,"inX":501306.110130578,"inY":302340.835905366},{"outX":116.366015,"outY":39.887129,"inX":501306.88032484,"inY":302341.058029406},{"outX":116.360077,"outY":39.898677,"inX":500798.690694669,"inY":303622.812114526},{"outX":116.361974,"outY":39.899042,"inX":500961.01234723,"inY":303663.350185006},{"outX":116.366564,"outY":39.895905,"inX":501353.786016419,"inY":303315.20383248},{"outX":116.366564,"outY":39.895905,"inX":501353.786016419,"inY":303315.20383248},{"outX":116.366256,"outY":39.896354,"inX":501325.077935579,"inY":303369.068513718},{"outX":116.370035,"outY":39.877577,"inX":501651.020900373,"inY":301280.84461466},{"outX":116.378297,"outY":39.879165,"inX":502358.08360867,"inY":301457.251404295},{"outX":116.378297,"outY":39.879165,"inX":502358.08360867,"inY":301457.251404295},{"outX":116.372757,"outY":39.886094,"inX":501883.852345403,"inY":302226.275191076},{"outX":116.377997,"outY":39.885283,"inX":502332.2725915,"inY":302136.346169725},{"outX":116.378186,"outY":39.885312,"inX":502348.444986351,"inY":302139.568718391},{"outX":116.379138,"outY":39.88154,"inX":502429.99904918,"inY":301720.892936529},{"outX":116.379461,"outY":39.88463,"inX":502457.564810939,"inY":302063.890554509},{"outX":116.379425,"outY":39.887682,"inX":502454.409619903,"inY":302402.663707523},{"outX":116.373057,"outY":39.893635,"inX":501909.398459936,"inY":303063.334733662},{"outX":116.376034,"outY":39.893962,"inX":502164.116174574,"inY":303099.684483083},{"outX":116.376995,"outY":39.899383,"inX":502246.221781716,"inY":303710.670550056},{"outX":116.377502,"outY":39.896559,"inX":502289.662435235,"inY":303387.981033744},{"outX":116.377088,"outY":39.899008,"inX":502257.583929796,"inY":303681.972328926},{"outX":116.377088,"outY":39.899008,"inX":502257.583929796,"inY":303681.972328926},{"outX":116.377134,"outY":39.899034,"inX":502261.518896095,"inY":303684.859224948},{"outX":116.377115,"outY":39.899018,"inX":502259.893702167,"inY":303683.082849317},{"outX":116.377134,"outY":39.89901,"inX":502261.519433462,"inY":303682.195200234},{"outX":116.377102,"outY":39.899021,"inX":502258.781415038,"inY":303683.415606753},{"outX":116.377172,"outY":39.899293,"inX":502261.36703591,"inY":303691.451486034},{"outX":116.377165,"outY":39.89928,"inX":502260.768442459,"inY":303690.008339852},{"outX":116.377165,"outY":39.89928,"inX":502260.768442459,"inY":303690.008339852},{"outX":116.378692,"outY":39.890873,"inX":502391.612573033,"inY":302756.852874168},{"outX":116.379154,"outY":39.89342,"inX":502431.080841358,"inY":303039.58091988},{"outX":116.379081,"outY":39.89465,"inX":502424.804761017,"inY":303176.110620777},{"outX":116.381854,"outY":39.871717,"inX":502662.683384968,"inY":300630.589821597},{"outX":116.381956,"outY":39.878738,"inX":502671.22407848,"inY":301409.924620809},{"outX":116.382467,"outY":39.871786,"inX":502697.458353699,"inY":300644.591877495},{"outX":116.382467,"outY":39.871786,"inX":502697.212199979,"inY":300644.335685547},{"outX":116.38254,"outY":39.878558,"inX":502721.205799592,"inY":301389.956262558},{"outX":116.382801,"outY":39.878818,"inX":502763.419329685,"inY":301433.286183163},{"outX":116.388076,"outY":39.872511,"inX":503195.154182944,"inY":300718.853751801},{"outX":116.388676,"outY":39.87238,"inX":503224.020710463,"inY":300712.042327215},{"outX":116.388897,"outY":39.872594,"inX":503265.411840395,"inY":300728.085070427},{"outX":116.388383,"outY":39.87395,"inX":503210.531005925,"inY":300884.014614005},{"outX":116.388671,"outY":39.879688,"inX":503245.820346227,"inY":301515.518245796},{"outX":116.389003,"outY":39.872604,"inX":503219.123182832,"inY":300706.033502776},{"outX":116.389732,"outY":39.872025,"inX":503441.959278887,"inY":300709.576543232},{"outX":116.389777,"outY":39.875358,"inX":503340.619829837,"inY":301034.910497264},{"outX":116.383734,"outY":39.881388,"inX":502823.300334525,"inY":301704.112159105},{"outX":116.384818,"outY":39.88077,"inX":502916.079040504,"inY":301635.536523221},{"outX":116.384891,"outY":39.880823,"inX":502922.324152767,"inY":301641.421103588},{"outX":116.384502,"outY":39.883529,"inX":502888.954060631,"inY":301941.780684913},{"outX":116.385232,"outY":39.885406,"inX":502951.35980098,"inY":302150.144743991},{"outX":116.385231,"outY":39.885406,"inX":502951.274235125,"inY":302150.144722435},{"outX":116.380749,"outY":39.899179,"inX":502567.395348154,"inY":303678.867732375},{"outX":116.382352,"outY":39.893656,"inX":502704.693326412,"inY":303065.841541586},{"outX":116.383626,"outY":39.892271,"inX":502813.735131999,"inY":302912.131850386},{"outX":116.38317,"outY":39.893798,"inX":502774.67522629,"inY":303081.620826401},{"outX":116.383176,"outY":39.893806,"inX":502775.188332015,"inY":303082.508961782},{"outX":116.387193,"outY":39.898273,"inX":503118.70944782,"inY":303578.440062476},{"outX":116.390072,"outY":39.873938,"inX":503365.91685107,"inY":300877.296426168},{"outX":116.390205,"outY":39.875582,"inX":503374.706710827,"inY":301036.28005573},{"outX":116.390307,"outY":39.875436,"inX":503385.971403526,"inY":301036.175012427},{"outX":116.390452,"outY":39.882656,"inX":503398.107256239,"inY":301845.00988745},{"outX":116.39045,"outY":39.882652,"inX":503397.93627784,"inY":301844.565836619},{"outX":116.329821,"outY":39.904577,"inX":498246.901692318,"inY":304279.911174147},{"outX":116.329854,"outY":39.904587,"inX":498237.456863446,"inY":304288.191683767},{"outX":116.329517,"outY":39.908956,"inX":498183.773804262,"inY":304763.652528681},{"outX":116.342116,"outY":39.908377,"inX":499261.878839478,"inY":304699.376906443},{"outX":116.344591,"outY":39.901645,"inX":499479.905864719,"inY":303946.062100724},{"outX":116.344857,"outY":39.905625,"inX":499496.373157915,"inY":304393.915821017},{"outX":116.344115,"outY":39.908616,"inX":499432.934107153,"inY":304725.913228218},{"outX":116.344113,"outY":39.908622,"inX":499431.837181994,"inY":304717.090334978},{"outX":116.35167,"outY":39.903695,"inX":500079.333586748,"inY":304179.728340675},{"outX":116.351686,"outY":39.903719,"inX":500080.702900309,"inY":304182.392469051},{"outX":116.351785,"outY":39.903167,"inX":500089.169272579,"inY":304121.121220733},{"outX":116.352377,"outY":39.905125,"inX":500139.841999858,"inY":304338.464242933},{"outX":116.35215,"outY":39.907539,"inX":500120.438380617,"inY":304606.416829755},{"outX":116.352539,"outY":39.909302,"inX":500153.736020952,"inY":304802.113616743},{"outX":116.353126,"outY":39.908343,"inX":500189.165683648,"inY":304696.027202053},{"outX":116.353101,"outY":39.909341,"inX":500201.821477714,"inY":304806.447537213},{"outX":116.360823,"outY":39.907831,"inX":500862.503445949,"inY":304638.919157482},{"outX":116.362502,"outY":39.903942,"inX":501007.836816335,"inY":304218.553193062},{"outX":116.362825,"outY":39.907911,"inX":501033.786637445,"inY":304647.824969929},{"outX":116.362962,"outY":39.908016,"inX":501045.507164534,"inY":304659.48187567},{"outX":116.364523,"outY":39.906266,"inX":501184.439737998,"inY":304473.2138254},{"outX":116.364677,"outY":39.906866,"inX":501192.241689902,"inY":304531.854550383},{"outX":116.36454,"outY":39.907221,"inX":501180.518046898,"inY":304571.257900772},{"outX":116.365299,"outY":39.903773,"inX":501246.089551942,"inY":304197.150373743},{"outX":116.365381,"outY":39.906915,"inX":501246.073383836,"inY":304527.586448374},{"outX":116.365199,"outY":39.90707,"inX":501236.899825931,"inY":304554.506122536},{"outX":116.36528,"outY":39.907016,"inX":501243.830190362,"inY":304548.513239847},{"outX":116.36528,"outY":39.907016,"inX":501243.830190362,"inY":304548.513239847},{"outX":116.36528,"outY":39.907016,"inX":501243.830190362,"inY":304548.513239847},{"outX":116.366693,"outY":39.902742,"inX":501363.278717834,"inY":304069.672946493},{"outX":116.370611,"outY":39.904278,"inX":501699.951486693,"inY":304244.675085808},{"outX":116.373813,"outY":39.906038,"inX":501973.858564413,"inY":304440.091984219},{"outX":116.374094,"outY":39.900147,"inX":501998.008968578,"inY":303786.189841754},{"outX":116.374726,"outY":39.900034,"inX":502052.659633091,"inY":303784.332936993},{"outX":116.386814,"outY":39.900346,"inX":503089.736329842,"inY":303793.041262752},{"outX":116.379863,"outY":39.961555,"inX":502489.866786869,"inY":310602.730405525},{"outX":116.357349,"outY":39.889359,"inX":500565.232257115,"inY":302588.484565455},{"outX":116.385752,"outY":39.884959,"inX":502995.868360354,"inY":302100.538626223},{"outX":116.386126,"outY":39.884852,"inX":503027.873487604,"inY":302088.669693418},{"outX":116.388398,"outY":39.884958,"inX":503222.273217833,"inY":302100.486540844},{"outX":116.388398,"outY":39.884951,"inX":503222.273466604,"inY":302099.70953414},{"outX":116.346678,"outY":39.911737,"inX":499652.287510435,"inY":305072.357121148},{"outX":116.346988,"outY":39.923344,"inX":499678.974321643,"inY":306360.740404638},{"outX":116.35037,"outY":39.909789,"inX":499968.157579776,"inY":304856.153254715},{"outX":116.360032,"outY":39.930956,"inX":500794.773394147,"inY":307205.80848341},{"outX":116.328486,"outY":39.888631,"inX":498094.769572926,"inY":302507.605927246},{"outX":116.321985,"outY":39.892026,"inX":497538.429497536,"inY":302884.498147485},{"outX":116.329452,"outY":39.895754,"inX":498177.725913043,"inY":303298.243658924},{"outX":116.333131,"outY":39.87603,"inX":498491.958557801,"inY":301108.894407124},{"outX":116.335734,"outY":39.877818,"inX":498714.864821432,"inY":301307.352087761},{"outX":116.330222,"outY":39.882051,"inX":498243.129170919,"inY":301777.22715846},{"outX":116.331379,"outY":39.883384,"inX":498342.224748848,"inY":301925.182394477},{"outX":116.331972,"outY":39.888597,"inX":498393.169417503,"inY":302503.81503079},{"outX":116.332977,"outY":39.888572,"inX":498479.195364208,"inY":302501.036614708},{"outX":116.333739,"outY":39.885672,"inX":498544.327483211,"inY":302179.138447255},{"outX":116.335513,"outY":39.880488,"inX":498696.026669447,"inY":301603.718142911},{"outX":116.336632,"outY":39.882646,"inX":498791.883693516,"inY":301843.251144808},{"outX":116.336655,"outY":39.88268,"inX":498793.853571744,"inY":301847.025069118},{"outX":116.336616,"outY":39.885087,"inX":498790.584751619,"inY":302114.198754712},{"outX":116.336486,"outY":39.886479,"inX":498779.497012196,"inY":302268.70905609},{"outX":116.336494,"outY":39.886682,"inX":498780.187685762,"inY":302291.241785567},{"outX":116.333235,"outY":39.895952,"inX":498501.52091563,"inY":303320.20694558},{"outX":116.320617,"outY":39.876084,"inX":497420.550258998,"inY":301114.984320957},{"outX":116.32134,"outY":39.875743,"inX":497482.436538809,"inY":301077.125657703},{"outX":116.323829,"outY":39.875796,"inX":497695.545104925,"inY":301082.982159928},{"outX":116.329272,"outY":39.875923,"inX":498161.565947148,"inY":301097.036129349},{"outX":116.329522,"outY":39.875929,"inX":498182.970189759,"inY":301097.700628324},{"outX":116.320486,"outY":39.88144,"inX":497409.598481114,"inY":301709.489477663},{"outX":116.320349,"outY":39.884744,"inX":497398.032306615,"inY":302076.22801988},{"outX":116.321894,"outY":39.888593,"inX":497530.478916397,"inY":302503.44220999},{"outX":116.322396,"outY":39.888893,"inX":497573.4657196,"inY":302536.736470938},{"outX":116.324247,"outY":39.883168,"inX":497731.662716,"inY":301901.254503219},{"outX":116.328578,"outY":39.883286,"inX":498102.437157352,"inY":301914.319279805},{"outX":116.33609,"outY":39.899201,"inX":498745.969651899,"inY":303680.838110343},{"outX":116.337947,"outY":39.896208,"inX":498904.818397117,"inY":303348.617062993},{"outX":116.344841,"outY":39.869456,"inX":499494.334525753,"inY":300379.188871396},{"outX":116.345953,"outY":39.868012,"inX":499589.512362479,"inY":300218.910751394},{"outX":116.34593,"outY":39.868004,"inX":499587.543030308,"inY":300218.022686356},{"outX":116.340561,"outY":39.874563,"inX":499128.020526053,"inY":300946.049735554},{"outX":116.341771,"outY":39.876186,"inX":499231.647902301,"inY":301126.201586079},{"outX":116.342868,"outY":39.87531,"inX":499325.541774238,"inY":301028.968848344},{"outX":116.344383,"outY":39.873431,"inX":499455.202223358,"inY":300820.406339919},{"outX":116.344375,"outY":39.873576,"inX":499454.520227155,"inY":300836.50110155},{"outX":116.344116,"outY":39.877715,"inX":499432.430345579,"inY":301295.923557487},{"outX":116.345761,"outY":39.876374,"inX":499573.226937676,"inY":301147.079696483},{"outX":116.347878,"outY":39.870149,"inX":499754.357305747,"inY":300456.122029768},{"outX":116.347474,"outY":39.879247,"inX":499719.915345082,"inY":301465.986408503},{"outX":116.340179,"outY":39.888071,"inX":499095.650283587,"inY":302445.41931035},{"outX":116.340415,"outY":39.888506,"inX":499115.86118182,"inY":302493.704138693},{"outX":116.34388,"outY":39.88145,"inX":499412.302764216,"inY":301710.503215317},{"outX":116.343887,"outY":39.885082,"inX":499412.974458996,"inY":302113.651240713},{"outX":116.346924,"outY":39.889779,"inX":499673.003835656,"inY":302635.026271589},{"outX":116.347268,"outY":39.88339,"inX":499702.347098223,"inY":301925.854178101},{"outX":116.347153,"outY":39.885717,"inX":499692.540263179,"inY":302184.148533198},{"outX":116.349042,"outY":39.881983,"inX":499854.175659584,"inY":301769.687729257},{"outX":116.342157,"outY":39.89826,"inX":499265.175767869,"inY":303576.393784834},{"outX":116.343978,"outY":39.892012,"inX":499420.899063055,"inY":302882.875431566},{"outX":116.345393,"outY":39.896309,"inX":499542.080472304,"inY":303359.84527437},{"outX":116.34508,"outY":39.899861,"inX":499515.355731176,"inY":303754.114350338},{"outX":116.346886,"outY":39.891576,"inX":499669.779797162,"inY":302834.491895377},{"outX":116.346801,"outY":39.894116,"inX":499662.544913999,"inY":303116.430006867},{"outX":116.348961,"outY":39.891123,"inX":499847.365124126,"inY":302784.2205144},{"outX":116.349946,"outY":39.897022,"inX":499931.736423944,"inY":303439.013366014},{"outX":116.351076,"outY":39.868343,"inX":500028.122467574,"inY":300255.675543629},{"outX":116.351031,"outY":39.868343,"inX":500024.269881791,"inY":300255.67527186},{"outX":116.351229,"outY":39.86835,"inX":500041.221331127,"inY":300256.453465312},{"outX":116.355608,"outY":39.86868,"inX":500416.115698179,"inY":300293.114581713},{"outX":116.352971,"outY":39.878647,"inX":500190.453157075,"inY":301399.420460729},{"outX":116.357907,"outY":39.872624,"inX":500612.942912155,"inY":300730.914828517},{"outX":116.350768,"outY":39.888129,"inX":500001.985093509,"inY":302451.899769474},{"outX":116.351601,"outY":39.881983,"inX":500073.217177175,"inY":301769.703788325},{"outX":116.351409,"outY":39.887998,"inX":500056.845887731,"inY":302437.363288111},{"outX":116.352689,"outY":39.884246,"inX":500166.365258701,"inY":302020.902982839},{"outX":116.35259,"outY":39.886577,"inX":500157.912599387,"inY":302279.641780396},{"outX":116.356452,"outY":39.881884,"inX":500488.433274575,"inY":301758.754110469},{"outX":116.357564,"outY":39.880661,"inX":500583.607890804,"inY":301623.012388388},{"outX":116.357525,"outY":39.883171,"inX":500580.277447623,"inY":301901.620626439},{"outX":116.35744,"outY":39.88675,"inX":500573.012968744,"inY":302298.887261733},{"outX":116.350373,"outY":39.890777,"inX":499968.208022175,"inY":302745.82365601},{"outX":116.350525,"outY":39.894336,"inX":499981.256626218,"inY":303140.872166522},{"outX":116.35709,"outY":39.894451,"inX":500543.081621274,"inY":303153.693180678},{"outX":116.366767,"outY":39.869488,"inX":501371.380368205,"inY":300382.922678802},{"outX":116.362188,"outY":39.877016,"inX":500979.392254363,"inY":301218.468914771},{"outX":116.368024,"outY":39.872554,"inX":501478.950661403,"inY":300723.26406885},{"outX":116.365675,"outY":39.887952,"inX":501277.777354998,"inY":302432.406408562},{"outX":116.366194,"outY":39.887951,"inX":501322.19229799,"inY":302432.302558451},{"outX":116.368273,"outY":39.883356,"inX":501500.155148042,"inY":301922.286972328},{"outX":116.369402,"outY":39.881928,"inX":501596.793349249,"inY":301763.795678472},{"outX":116.367335,"outY":39.898314,"inX":501419.734083582,"inY":303582.615290296},{"outX":116.368136,"outY":39.890268,"inX":501488.358257699,"inY":302689.517846346},{"outX":116.368341,"outY":39.893446,"inX":501505.865800226,"inY":303042.279979523},{"outX":116.368157,"outY":39.899686,"inX":501490.051999252,"inY":303734.920485672},{"outX":116.369239,"outY":39.898369,"inX":501582.645750837,"inY":303588.749352295},{"outX":116.328696,"outY":39.910025,"inX":498113.556546823,"inY":304882.314593378},{"outX":116.329807,"outY":39.912701,"inX":498208.724652681,"inY":305179.343911728},{"outX":116.328383,"outY":39.923163,"inX":498087.261276534,"inY":306340.627861908},{"outX":116.327224,"outY":39.93419,"inX":497988.518264791,"inY":307564.629527699},{"outX":116.329904,"outY":39.936622,"inX":498217.859028263,"inY":307834.571667381},{"outX":116.331681,"outY":39.906339,"inX":498368.868547368,"inY":304473.159228391},{"outX":116.337383,"outY":39.901754,"inX":498856.697886368,"inY":303964.218864057},{"outX":116.337147,"outY":39.904136,"inX":498836.565722328,"inY":304228.61940358},{"outX":116.33806,"outY":39.907174,"inX":498914.775825683,"inY":304565.836331374},{"outX":116.339521,"outY":39.90587,"inX":499039.765652523,"inY":304421.094540407},{"outX":116.37498,"outY":39.87746,"inX":502074.244519973,"inY":301267.937113313},{"outX":116.379134,"outY":39.877598,"inX":502429.750097743,"inY":301283.329619576},{"outX":116.372693,"outY":39.887883,"inX":501878.346702684,"inY":302424.85373445},{"outX":116.373675,"outY":39.881853,"inX":501962.482590576,"inY":301755.538486674},{"outX":116.378768,"outY":39.883171,"inX":502398.297877841,"inY":301901.927631201},{"outX":116.373583,"outY":39.898513,"inX":501954.318937221,"inY":303604.805393067},{"outX":116.377928,"outY":39.899989,"inX":502326.03011389,"inY":303768.722688779},{"outX":116.378508,"outY":39.891959,"inX":502375.843064312,"inY":302877.39619725},{"outX":116.378126,"outY":39.897102,"inX":502343.037823893,"inY":303448.266481121},{"outX":116.379482,"outY":39.898798,"inX":502459.009562261,"inY":303636.550790531},{"outX":116.381529,"outY":39.872278,"inX":502634.853327616,"inY":300692.854529355},{"outX":116.382291,"outY":39.87927,"inX":502699.877587445,"inY":301468.983556689},{"outX":116.387613,"outY":39.879397,"inX":503155.296572428,"inY":301483.193288674},{"outX":116.388675,"outY":39.871051,"inX":503246.467429192,"inY":300556.806465532},{"outX":116.38117,"outY":39.880856,"inX":502603.904926255,"inY":301645.00794396},{"outX":116.381406,"outY":39.884844,"inX":502623.994033009,"inY":302087.682826109},{"outX":116.383259,"outY":39.882031,"inX":502782.634902882,"inY":301775.475714605},{"outX":116.38563,"outY":39.88848,"inX":502985.315912312,"inY":302491.370170659},{"outX":116.387789,"outY":39.882148,"inX":503170.26215954,"inY":301788.560283765},{"outX":116.387827,"outY":39.882148,"inX":503173.513737651,"inY":301788.561136132},{"outX":116.38746,"outY":39.888739,"inX":503141.883547531,"inY":302520.160098786},{"outX":116.388543,"outY":39.88217,"inX":503234.779316002,"inY":301791.019322478},{"outX":116.388947,"outY":39.884542,"inX":503269.262727698,"inY":302054.322708261},{"outX":116.389123,"outY":39.88141,"inX":503284.435719228,"inY":301706.671917294},{"outX":116.389352,"outY":39.882196,"inX":503304.001990507,"inY":301793.923859523},{"outX":116.389564,"outY":39.889318,"inX":503321.87829062,"inY":302584.478191329},{"outX":116.38787,"outY":39.898928,"inX":503176.602046633,"inY":303651.161644969},{"outX":116.388618,"outY":39.890383,"inX":503240.902058527,"inY":302702.672430556},{"outX":116.388412,"outY":39.892752,"inX":503223.192108945,"inY":302965.629596072},{"outX":116.390733,"outY":39.879507,"inX":503422.271318991,"inY":301495.474672631},{"outX":116.392076,"outY":39.871969,"inX":503537.487553406,"inY":300658.783037413},{"outX":116.39203,"outY":39.878515,"inX":503533.292732923,"inY":301385.392594379},{"outX":116.390397,"outY":39.882234,"inX":503393.417156016,"inY":301798.166197188},{"outX":116.336399,"outY":39.912647,"inX":498772.790246791,"inY":305173.336831164},{"outX":116.338813,"outY":39.914126,"inX":498979.383031341,"inY":305337.507422066},{"outX":116.338691,"outY":39.918006,"inX":498969.039092903,"inY":305768.187091181},{"outX":116.339065,"outY":39.91117,"inX":499000.873564535,"inY":305009.392265344},{"outX":116.330873,"outY":39.921641,"inX":498300.247034265,"inY":306171.676847784},{"outX":116.332104,"outY":39.926837,"inX":498405.7361357,"inY":306748.429490074},{"outX":116.33477,"outY":39.921766,"inX":498633.668021104,"inY":306185.54501216},{"outX":116.337814,"outY":39.927998,"inX":498894.254694928,"inY":306877.299664553},{"outX":116.33968,"outY":39.921895,"inX":499053.745852367,"inY":306199.868548367},{"outX":116.331487,"outY":39.931149,"inX":498353.0915861,"inY":307227.063294145},{"outX":116.331525,"outY":39.936673,"inX":498356.52071477,"inY":307840.228778504},{"outX":116.333166,"outY":39.936399,"inX":498496.881899773,"inY":307809.812399384},{"outX":116.359903,"outY":39.925071,"inX":500783.756136755,"inY":306552.56385273},{"outX":116.352112,"outY":39.930956,"inX":500117.3632499,"inY":307205.719361184},{"outX":116.352942,"outY":39.932283,"inX":500188.364136202,"inY":307353.02584141},{"outX":116.352728,"outY":39.93567,"inX":500170.080106989,"inY":307728.984944836},{"outX":116.337646,"outY":39.933419,"inX":498880.017552329,"inY":307479.032827498},{"outX":116.338034,"outY":39.935562,"inX":498913.258856142,"inY":307716.907805418},{"outX":116.341159,"outY":39.901756,"inX":499179.843303517,"inY":303964.445468849},{"outX":116.344135,"outY":39.905961,"inX":499434.597157748,"inY":304431.208653763},{"outX":116.34642,"outY":39.90334,"inX":499630.083807846,"inY":304140.288804343},{"outX":116.34642,"outY":39.904218,"inX":499630.097467768,"inY":304237.746661793},{"outX":116.340854,"outY":39.912609,"inX":499153.98393149,"inY":305169.1247645},{"outX":116.340746,"outY":39.917064,"inX":499144.840786902,"inY":305663.629516868},{"outX":116.347279,"outY":39.916263,"inX":499703.77283295,"inY":305574.747870355},{"outX":116.344217,"outY":39.922032,"inX":499441.898106536,"inY":306215.092067212},{"outX":116.34545,"outY":39.926832,"inX":499547.455946946,"inY":306747.901236052},{"outX":116.346951,"outY":39.92004,"inX":499675.763451813,"inY":305993.994389123},{"outX":116.346936,"outY":39.920143,"inX":499674.481615876,"inY":306005.427344814},{"outX":116.348321,"outY":39.922315,"inX":499792.995785878,"inY":306246.529756062},{"outX":116.349965,"outY":39.929133,"inX":499933.702068373,"inY":307003.34564223},{"outX":116.341223,"outY":39.935785,"inX":499186.03902079,"inY":307741.670341801},{"outX":116.342647,"outY":39.931014,"inX":499307.752517634,"inY":307212.09174461},{"outX":116.3435,"outY":39.938302,"inX":499380.844439785,"inY":308021.069892055},{"outX":116.345608,"outY":39.939904,"inX":499561.164972459,"inY":308198.905859771},{"outX":116.348305,"outY":39.931096,"inX":499791.730788232,"inY":307221.227498362},{"outX":116.349889,"outY":39.931697,"inX":499927.225834764,"inY":307287.951545445},{"outX":116.349828,"outY":39.932738,"inX":499922.018181437,"inY":307403.503130126},{"outX":116.34982,"outY":39.932822,"inX":499921.334715259,"inY":307412.82715327},{"outX":116.349446,"outY":39.934447,"inX":499889.361329237,"inY":307593.200838858},{"outX":116.349568,"outY":39.934562,"inX":499899.797323949,"inY":307605.966968638},{"outX":116.349355,"outY":39.936148,"inX":499881.594922041,"inY":307782.013023174},{"outX":116.349095,"outY":39.937591,"inX":499859.371914639,"inY":307942.185602135},{"outX":116.345547,"outY":39.940232,"inX":499555.952534627,"inY":308235.313837675},{"outX":116.347585,"outY":39.941511,"inX":499730.270544502,"inY":308377.298595328},{"outX":116.348836,"outY":39.940876,"inX":499837.254262559,"inY":308306.822600965},{"outX":116.349421,"outY":39.949488,"inX":499887.36590311,"inY":309262.772144859},{"outX":116.349665,"outY":39.949217,"inX":499908.228695989,"inY":309232.692878419},{"outX":116.350539,"outY":39.902564,"inX":499982.543235245,"inY":304054.178711091},{"outX":116.351476,"outY":39.907567,"inX":500062.768691471,"inY":304609.519337547},{"outX":116.352161,"outY":39.905746,"inX":500121.364814619,"inY":304407.393553919},{"outX":116.352481,"outY":39.905758,"inX":500148.745901545,"inY":304408.728220966},{"outX":116.352633,"outY":39.90589,"inX":500161.752862101,"inY":304423.381530094},{"outX":116.357005,"outY":39.903481,"inX":500535.831746096,"inY":304156.023408619},{"outX":116.357088,"outY":39.90871,"inX":500542.944801742,"inY":304736.445391698},{"outX":116.358208,"outY":39.905939,"inX":500638.768138261,"inY":304428.875324865},{"outX":116.358276,"outY":39.908068,"inX":500644.587573044,"inY":304665.196131893},{"outX":116.350142,"outY":39.915412,"inX":499948.707856171,"inY":305480.306474399},{"outX":116.350012,"outY":39.918216,"inX":499937.614555512,"inY":305791.550869081},{"outX":116.353744,"outY":39.914017,"inX":500256.86464707,"inY":305325.49153294},{"outX":116.35369,"outY":39.916218,"inX":500252.257508986,"inY":305569.803339262},{"outX":116.353545,"outY":39.918572,"inX":500239.86630119,"inY":305831.097561458},{"outX":116.356935,"outY":39.911347,"inX":500529.8598216,"inY":305029.152200765},{"outX":116.356104,"outY":39.917024,"inX":500458.779286796,"inY":305659.294197093},{"outX":116.357224,"outY":39.914916,"inX":500554.590780218,"inY":305425.316765157},{"outX":116.358123,"outY":39.912653,"inX":500631.499781873,"inY":305174.132232134},{"outX":116.358259,"outY":39.914671,"inX":500643.13540328,"inY":305398.133293362},{"outX":116.358481,"outY":39.915673,"inX":500662.127401699,"inY":305509.358684822},{"outX":116.359258,"outY":39.91275,"inX":500728.601809386,"inY":305184.912541608},{"outX":116.359258,"outY":39.912754,"inX":500728.601805481,"inY":305185.356544634},{"outX":116.350003,"outY":39.924384,"inX":499936.906457131,"inY":306476.202874129},{"outX":116.351558,"outY":39.922271,"inX":500069.909641507,"inY":306241.671233146},{"outX":116.353612,"outY":39.939155,"inX":500245.702501237,"inY":308115.833732701},{"outX":116.355752,"outY":39.931088,"inX":500428.704001597,"inY":307220.408804564},{"outX":116.362207,"outY":39.903298,"inX":500980.932685205,"inY":304135.770993095},{"outX":116.36607,"outY":39.902595,"inX":501311.457813732,"inY":304057.790364893},{"outX":116.366222,"outY":39.902595,"inX":501324.462860978,"inY":304057.792572457},{"outX":116.37556,"outY":39.911995,"inX":502123.186606636,"inY":305101.358896825},{"outX":116.375609,"outY":39.919864,"inX":502127.208656586,"inY":305974.831522079},{"outX":116.37012,"outY":39.921145,"inX":501657.699817787,"inY":306116.924998295},{"outX":116.370797,"outY":39.929185,"inX":501715.476232945,"inY":307009.390616319},{"outX":116.371126,"outY":39.920297,"inX":501743.759769893,"inY":306022.8130093},{"outX":116.367661,"outY":39.909494,"inX":501447.50604858,"inY":304823.609007871},{"outX":116.362724,"outY":39.91048,"inX":501025.132500113,"inY":304932.984622586},{"outX":116.365649,"outY":39.913116,"inX":501275.346313578,"inY":305225.62430591},{"outX":116.367523,"outY":39.914217,"inX":501435.64721078,"inY":305347.865043794},{"outX":116.367424,"outY":39.916578,"inX":501427.151654467,"inY":305609.937388734},{"outX":116.360841,"outY":39.922468,"inX":500863.99818182,"inY":306263.639811068},{"outX":116.361724,"outY":39.929653,"inX":500939.493678296,"inY":307061.196320485},{"outX":116.367027,"outY":39.926504,"inX":501393.080698084,"inY":306711.731436332},{"outX":116.361448,"outY":39.939213,"inX":500915.839533207,"inY":308122.368279721},{"outX":116.362043,"outY":39.93433,"inX":500966.751148439,"inY":307580.355177075},{"outX":116.362172,"outY":39.936515,"inX":500977.7705287,"inY":307822.895755613},{"outX":116.365196,"outY":39.939246,"inX":501236.353324624,"inY":308126.087350959},{"outX":116.366675,"outY":39.934091,"inX":501362.888779166,"inY":307553.896023388},{"outX":116.366583,"outY":39.937303,"inX":501354.983996894,"inY":307910.43272071},{"outX":116.360968,"outY":39.945729,"inX":500874.759010227,"inY":308845.649965358},{"outX":116.362407,"outY":39.946196,"inX":500997.803423583,"inY":308897.508826129},{"outX":116.363024,"outY":39.941271,"inX":501050.598969677,"inY":308350.833028138},{"outX":116.366217,"outY":39.941347,"inX":501323.639529381,"inY":308359.31901981},{"outX":116.366048,"outY":39.945341,"inX":501309.142973,"inY":308802.658916094},{"outX":116.366216,"outY":39.94956,"inX":501323.458390453,"inY":309270.980428109},{"outX":116.367755,"outY":39.947105,"inX":501455.077207242,"inY":308998.495685528},{"outX":116.369904,"outY":39.947606,"inX":501638.812873421,"inY":309054.145921322},{"outX":116.365477,"outY":39.950583,"inX":501260.26170764,"inY":309384.523640325},{"outX":116.364972,"outY":39.966288,"inX":501216.912991929,"inY":311127.811421939},{"outX":116.366373,"outY":39.966336,"inX":501336.670589215,"inY":311133.163667453},{"outX":116.366511,"outY":39.966343,"inX":501348.466720966,"inY":311133.943108568},{"outX":116.372325,"outY":39.905911,"inX":501846.562483657,"inY":304425.968675242},{"outX":116.376661,"outY":39.902851,"inX":502217.570293151,"inY":304086.383716334},{"outX":116.376661,"outY":39.902851,"inX":502217.570293151,"inY":304086.383716334},{"outX":116.377283,"outY":39.903971,"inX":502270.757279315,"inY":304210.716908443},{"outX":116.370404,"outY":39.913207,"inX":501682.111343427,"inY":305235.800540565},{"outX":116.371394,"outY":39.915449,"inX":501766.762279177,"inY":305484.682439429},{"outX":116.371355,"outY":39.916048,"inX":501763.416521107,"inY":305551.171611879},{"outX":116.373641,"outY":39.921282,"inX":501958.855323531,"inY":306132.194832705},{"outX":116.373183,"outY":39.926398,"inX":501919.585107209,"inY":306700.071600052},{"outX":116.373472,"outY":39.930113,"inX":501944.228718425,"inY":307112.449308907},{"outX":116.373441,"outY":39.935725,"inX":501941.466067439,"inY":307735.39272526},{"outX":116.373128,"outY":39.938383,"inX":501914.64811094,"inY":308030.430804915},{"outX":116.378861,"outY":39.931703,"inX":502405.040138114,"inY":307289.05045649},{"outX":116.372647,"outY":39.948046,"inX":501873.329314034,"inY":309103.038448409},{"outX":116.373623,"outY":39.945153,"inX":501956.835469186,"inY":308781.926921965},{"outX":116.373904,"outY":39.948056,"inX":501980.799328962,"inY":309104.173085942},{"outX":116.375147,"outY":39.94635,"inX":502087.110387342,"inY":308914.827438534},{"outX":116.37533,"outY":39.946247,"inX":502102.758889155,"inY":308903.397877786},{"outX":116.3752,"outY":39.949963,"inX":502091.558671461,"inY":309315.881427502},{"outX":116.373379,"outY":39.951341,"inX":501935.844929212,"inY":309468.806637273},{"outX":116.373378,"outY":39.958017,"inX":501935.618348169,"inY":310209.86181566},{"outX":116.373606,"outY":39.963909,"inX":501954.980416826,"inY":310863.896597579},{"outX":116.373917,"outY":39.965225,"inX":501981.534346212,"inY":311009.983206306},{"outX":116.376959,"outY":39.966905,"inX":502241.502946207,"inY":311196.533569673},{"outX":116.37894,"outY":39.96669,"inX":502410.825609653,"inY":311172.712088324},{"outX":116.390139,"outY":39.930008,"inX":503369.477333436,"inY":307101.164123274},{"outX":116.390001,"outY":39.933533,"inX":503357.534929376,"inY":307492.445659172},{"outX":116.382806,"outY":39.906059,"inX":502743.170633571,"inY":304442.600318504},{"outX":116.383447,"outY":39.905956,"inX":502798.00611918,"inY":304431.181031633},{"outX":116.385497,"outY":39.908792,"inX":502973.27048214,"inY":304746.027415954},{"outX":116.385512,"outY":39.908647,"inX":502974.558375517,"inY":304729.932497671},{"outX":116.384847,"outY":39.919023,"inX":502917.334872987,"inY":305881.673743378},{"outX":116.385207,"outY":39.912508,"inX":502948.341644837,"inY":305158.503710436},{"outX":116.385161,"outY":39.913092,"inX":502944.38775815,"inY":305223.327789523},{"outX":116.382911,"outY":39.920943,"inX":502751.698987974,"inY":306094.75414064},{"outX":116.387424,"outY":39.924565,"inX":503137.525553786,"inY":306496.909271733},{"outX":116.389537,"outY":39.92186,"inX":503318.324094109,"inY":306196.699482034},{"outX":116.389033,"outY":39.926979,"inX":503275.024946413,"inY":306764.908980438},{"outX":116.383771,"outY":39.931909,"inX":502824.894243511,"inY":307312.025447063},{"outX":116.389848,"outY":39.936271,"inX":503344.342391005,"inY":307796.367838478},{"outX":116.381749,"outY":39.942882,"inX":502651.658435859,"inY":308530.011938302},{"outX":116.385493,"outY":39.940171,"inX":502971.849988951,"inY":308229.170899064},{"outX":116.385751,"outY":39.947614,"inX":502993.641221551,"inY":309055.373084741},{"outX":116.387628,"outY":39.946251,"inX":503154.153139883,"inY":308904.12247922},{"outX":116.381855,"outY":39.950026,"inX":502660.498305995,"inY":309323.019722752},{"outX":116.386582,"outY":39.950096,"inX":503064.589077734,"inY":309330.90381848},{"outX":116.380664,"outY":39.961566,"inX":502558.331945127,"inY":310603.969894892},{"outX":116.381967,"outY":39.968191,"inX":502669.489713898,"inY":311339.399279182},{"outX":116.381913,"outY":39.971064,"inX":502664.780664435,"inY":311658.311726411},{"outX":116.33314,"outY":39.936477,"inX":498494.660238269,"inY":307818.470456922},{"outX":116.342262,"outY":39.938438,"inX":499274.959461383,"inY":308036.159969853},{"outX":116.350436,"outY":39.929454,"inX":499973.993307072,"inY":307038.980872804},{"outX":116.387285,"outY":39.955185,"inX":503124.489211621,"inY":309895.818057899},{"outX":116.350953,"outY":39.868838,"inX":500017.598030629,"inY":300310.619105435},{"outX":116.3335,"outY":39.936527,"inX":498525.455658018,"inY":307824.020200835},{"outX":116.347296,"outY":39.936699,"inX":499705.494742123,"inY":307843.1588012},{"outX":116.366472,"outY":39.946533,"inX":501345.383304903,"inY":308934.980621565},{"outX":116.374911,"outY":39.949404,"inX":502066.863728785,"inY":309253.824977796},{"outX":116.323832,"outY":39.875841,"inX":497695.804002611,"inY":301087.977027499},{"outX":116.321677,"outY":39.888882,"inX":497511.916620599,"inY":302535.522973571},{"outX":116.322437,"outY":39.888677,"inX":497576.965430631,"inY":302512.760448687},{"outX":116.324887,"outY":39.887909,"inX":497786.658688937,"inY":302427.491072873},{"outX":116.328412,"outY":39.888688,"inX":498088.43734064,"inY":302513.933283363},{"outX":116.329308,"outY":39.888694,"inX":498165.135533227,"inY":302514.594128009},{"outX":116.333022,"outY":39.876071,"inX":498482.628008813,"inY":301113.445723674},{"outX":116.330373,"outY":39.882075,"inX":498256.056863099,"inY":301779.890346038},{"outX":116.332417,"outY":39.888574,"inX":498431.26015834,"inY":302501.26045706},{"outX":116.332717,"outY":39.888617,"inX":498456.941230392,"inY":302506.032385178},{"outX":116.333908,"outY":39.896183,"inX":498559.12966056,"inY":303345.846076955},{"outX":116.336069,"outY":39.899319,"inX":498744.175783318,"inY":303693.936031932},{"outX":116.338007,"outY":39.896417,"inX":498909.959116676,"inY":303371.815903215},{"outX":116.344979,"outY":39.869474,"inX":499506.149829358,"inY":300381.187244825},{"outX":116.346478,"outY":39.868098,"inX":499634.462588093,"inY":300228.458474125},{"outX":116.342886,"outY":39.87524,"inX":499327.08122825,"inY":301021.198989272},{"outX":116.343523,"outY":39.877446,"inX":499381.660404142,"inY":301266.063322589},{"outX":116.346133,"outY":39.874121,"inX":499605.032736279,"inY":300897.001113613},{"outX":116.346156,"outY":39.876275,"inX":499607.039704311,"inY":301136.092318163},{"outX":116.347988,"outY":39.87002,"inX":499763.772697321,"inY":300441.803719351},{"outX":116.340412,"outY":39.8883,"inX":499115.599459784,"inY":302470.838349553},{"outX":116.343233,"outY":39.881391,"inX":499356.917354017,"inY":301703.952527402},{"outX":116.343176,"outY":39.885076,"inX":499352.114863622,"inY":302112.98320943},{"outX":116.346982,"outY":39.889819,"inX":499677.968627306,"inY":302639.466527921},{"outX":116.347152,"outY":39.885905,"inX":499692.457628051,"inY":302205.016368571},{"outX":116.348923,"outY":39.881939,"inX":499843.98896139,"inY":301764.803103866},{"outX":116.342297,"outY":39.891609,"inX":499277.015967416,"inY":302838.137790941},{"outX":116.342205,"outY":39.897978,"inX":499269.277711248,"inY":303545.092076235},{"outX":116.345403,"outY":39.896333,"inX":499542.93670572,"inY":303362.509306018},{"outX":116.345448,"outY":39.899859,"inX":499546.848230504,"inY":303753.893990503},{"outX":116.346938,"outY":39.89171,"inX":499674.232408535,"inY":302849.366069863},{"outX":116.347149,"outY":39.898118,"inX":499692.388503413,"inY":303560.65205297},{"outX":116.352197,"outY":39.876579,"inX":500124.178816098,"inY":301169.86885188},{"outX":116.353079,"outY":39.878161,"inX":500199.693551083,"inY":301345.475702503},{"outX":116.354243,"outY":39.876825,"inX":500299.320903594,"inY":301197.189906057},{"outX":116.35603,"outY":39.876716,"inX":500452.286926087,"inY":301185.106009273},{"outX":116.357843,"outY":39.87239,"inX":500607.46356465,"inY":300704.940439465},{"outX":116.357701,"outY":39.874983,"inX":500595.316574513,"inY":300992.759787011},{"outX":116.359974,"outY":39.876637,"inX":500789.884467319,"inY":301176.375466469},{"outX":116.350199,"outY":39.889521,"inX":499953.301454614,"inY":302606.407173585},{"outX":116.351599,"outY":39.885421,"inX":500073.08150421,"inY":302151.319230216},{"outX":116.351336,"outY":39.888132,"inX":500050.599331535,"inY":302452.236695501},{"outX":116.351862,"outY":39.888275,"inX":500095.620021676,"inY":302468.11339811},{"outX":116.352802,"outY":39.883331,"inX":500176.02908563,"inY":301919.339464084},{"outX":116.353355,"outY":39.881882,"inX":500223.350109764,"inY":301758.5057473},{"outX":116.356577,"outY":39.888014,"inX":500499.157204992,"inY":302439.18240568},{"outX":116.357436,"outY":39.883141,"inX":500572.659835321,"inY":301898.289770617},{"outX":116.357374,"outY":39.886689,"inX":500567.364131889,"inY":302292.115629489},{"outX":116.358808,"outY":39.887881,"inX":500690.094792885,"inY":302424.441968322},{"outX":116.350521,"outY":39.890856,"inX":499980.87556419,"inY":302754.59361296},{"outX":116.350496,"outY":39.893666,"inX":499978.767354703,"inY":303066.502212388},{"outX":116.355605,"outY":39.897998,"inX":500416.016219416,"inY":303547.395508429},{"outX":116.35806,"outY":39.898138,"inX":500626.095942759,"inY":303562.960428077},{"outX":116.36229,"outY":39.87701,"inX":500988.122887901,"inY":301217.804108674},{"outX":116.365904,"outY":39.877149,"inX":501297.454690842,"inY":301233.278191104},{"outX":116.368182,"outY":39.872605,"inX":501492.474245583,"inY":300728.927259234},{"outX":116.368192,"outY":39.879668,"inX":501493.260582692,"inY":301512.918136069},{"outX":116.364265,"outY":39.887997,"inX":501157.111216741,"inY":302437.382572328},{"outX":116.366566,"outY":39.881928,"inX":501354.077583664,"inY":301763.754889641},{"outX":116.368263,"outY":39.889928,"inX":501499.229738477,"inY":302651.779641424},{"outX":116.366579,"outY":39.898346,"inX":501355.04722917,"inY":303586.156209522},{"outX":116.367896,"outY":39.899891,"inX":501467.718151865,"inY":303757.671650753},{"outX":116.368316,"outY":39.896022,"inX":501503.697843696,"inY":303328.216781381},{"outX":116.369624,"outY":39.898448,"inX":501615.586194017,"inY":303597.524461137},{"outX":116.370022,"outY":39.877275,"inX":501649.911948776,"inY":301247.322474486},{"outX":116.376525,"outY":39.879627,"inX":502206.426612339,"inY":301508.501333159},{"outX":116.379889,"outY":39.877272,"inX":502494.371102873,"inY":301247.157821994},{"outX":116.372592,"outY":39.888001,"inX":501869.701954248,"inY":302437.950102039},{"outX":116.373799,"outY":39.881871,"inX":501973.09413344,"inY":301757.538570054},{"outX":116.377998,"outY":39.888061,"inX":502332.295088405,"inY":302444.70574883},{"outX":116.379442,"outY":39.881969,"inX":502456.003599812,"inY":301768.517896407},{"outX":116.373553,"outY":39.898498,"inX":501951.752440149,"inY":303603.139856766},{"outX":116.374397,"outY":39.896057,"inX":502024.00993433,"inY":303332.201696015},{"outX":116.377871,"outY":39.899878,"inX":502321.156152869,"inY":303756.400468126},{"outX":116.378253,"outY":39.892226,"inX":502354.01821326,"inY":302907.028535896},{"outX":116.378253,"outY":39.892226,"inX":502354.01821326,"inY":302907.028535896},{"outX":116.378335,"outY":39.892685,"inX":502361.023596123,"inY":302957.979475357},{"outX":116.378065,"outY":39.896849,"inX":502337.824771513,"inY":303420.182058664},{"outX":116.379278,"outY":39.898713,"inX":502441.558697899,"inY":303627.11165209},{"outX":116.380286,"outY":39.877203,"inX":502528.348128003,"inY":301239.506401555},{"outX":116.381475,"outY":39.872732,"inX":502630.219851967,"inY":300743.24753084},{"outX":116.387745,"outY":39.8795,"inX":503166.588451608,"inY":301494.629298154},{"outX":116.388675,"outY":39.871056,"inX":503246.467254075,"inY":300557.361467421},{"outX":116.381875,"outY":39.884824,"inX":502664.126649687,"inY":302085.472239287},{"outX":116.382809,"outY":39.882054,"inX":502744.126928702,"inY":301778.019490645},{"outX":116.385565,"outY":39.888471,"inX":502979.754689149,"inY":302490.369742442},{"outX":116.387889,"outY":39.885718,"inX":503178.694555033,"inY":302184.835714305},{"outX":116.387457,"outY":39.888853,"inX":503141.622922746,"inY":302532.814153644},{"outX":116.389994,"outY":39.88499,"inX":503358.830941799,"inY":302104.075457176},{"outX":116.389582,"outY":39.88935,"inX":503323.417132756,"inY":302588.030651754},{"outX":116.383202,"outY":39.893127,"inX":502777.432913316,"inY":303007.139780754},{"outX":116.387159,"outY":39.898877,"inX":503115.779763252,"inY":303645.484165863},{"outX":116.388272,"outY":39.8956,"inX":503211.112126323,"inY":303281.758155831},{"outX":116.389982,"outY":39.893747,"inX":503357.473332263,"inY":303076.112797768},{"outX":116.39203,"outY":39.887842,"inX":503532.920149514,"inY":302420.699362165},{"outX":116.39156,"outY":39.896962,"inX":503492.34390115,"inY":303433.020802146},{"outX":116.328901,"outY":39.908957,"inX":498131.059638094,"inY":304763.766372467},{"outX":116.328778,"outY":39.910025,"inX":498120.573605954,"inY":304882.314193295},{"outX":116.328521,"outY":39.91689,"inX":498098.836942023,"inY":305644.32641527},{"outX":116.328438,"outY":39.922832,"inX":498091.954769353,"inY":306303.88669387},{"outX":116.328438,"outY":39.927122,"inX":498092.112108912,"inY":306780.075963326},{"outX":116.327694,"outY":39.930061,"inX":498028.570629464,"inY":307106.308137284},{"outX":116.331344,"outY":39.906156,"inX":498340.022786791,"inY":304452.847459454},{"outX":116.335621,"outY":39.902892,"inX":498705.9385126,"inY":304090.53676336},{"outX":116.337198,"outY":39.904189,"inX":498840.931579665,"inY":304234.502379579},{"outX":116.339426,"outY":39.905874,"inX":499031.636264944,"inY":304421.538394142},{"outX":116.338636,"outY":39.918381,"inX":498964.34249789,"inY":305809.812017449},{"outX":116.339085,"outY":39.911179,"inX":499002.585125601,"inY":305010.39129411},{"outX":116.330928,"outY":39.921705,"inX":498304.954907725,"inY":306178.780673504},{"outX":116.33202,"outY":39.926859,"inX":498398.550527881,"inY":306750.871658695},{"outX":116.335542,"outY":39.922708,"inX":498699.743689273,"inY":306290.106817984},{"outX":116.338538,"outY":39.9208,"inX":498956.016835797,"inY":306078.321068759},{"outX":116.338119,"outY":39.923843,"inX":498920.244439482,"inY":306416.093933735},{"outX":116.330259,"outY":39.930432,"inX":498248.015986005,"inY":307147.479346249},{"outX":116.33007,"outY":39.936862,"inX":498232.066840072,"inY":307861.211265535},{"outX":116.331519,"outY":39.931126,"inX":498355.828319705,"inY":307224.510220968},{"outX":116.332454,"outY":39.936956,"inX":498435.99533192,"inY":307871.640414283},{"outX":116.337886,"outY":39.93109,"inX":498900.490215767,"inY":307220.513061428},{"outX":116.337926,"outY":39.931213,"inX":498903.914946047,"inY":307234.166189412},{"outX":116.337485,"outY":39.935553,"inX":498866.298551451,"inY":307715.907780311},{"outX":116.343934,"outY":39.905868,"inX":499417.395724179,"inY":304420.884854146},{"outX":116.346401,"outY":39.9035,"inX":499628.460427223,"inY":304158.048676874},{"outX":116.340101,"outY":39.917098,"inX":499089.655983916,"inY":305667.401865969},{"outX":116.343303,"outY":39.927693,"inX":499363.807438634,"inY":306843.461605393},{"outX":116.344244,"outY":39.922109,"inX":499444.209292856,"inY":306223.639232426},{"outX":116.344222,"outY":39.929622,"inX":499442.454565652,"inY":307057.58638734},{"outX":116.344573,"outY":39.92984,"inX":499472.483007116,"inY":307081.786412128},{"outX":116.348262,"outY":39.922231,"inX":499787.947455258,"inY":306237.205288549},{"outX":116.349791,"outY":39.928799,"inX":499918.81515499,"inY":306966.269912367},{"outX":116.341501,"outY":39.935779,"inX":499209.817674502,"inY":307741.005429468},{"outX":116.342671,"outY":39.931063,"inX":499309.806395568,"inY":307217.530884515},{"outX":116.342957,"outY":39.938236,"inX":499334.399987785,"inY":308013.741073505},{"outX":116.343251,"outY":39.932113,"inX":499359.438352143,"inY":307334.084319137},{"outX":116.346643,"outY":39.93115,"inX":499649.568650186,"inY":307227.209887178},{"outX":116.346369,"outY":39.936897,"inX":499626.210518776,"inY":307865.130582972},{"outX":116.348689,"outY":39.939338,"inX":499824.666018178,"inY":308136.101456322},{"outX":116.349086,"outY":39.931248,"inX":499858.536353772,"inY":307238.105617528},{"outX":116.349885,"outY":39.931789,"inX":499926.884573,"inY":307298.163607248},{"outX":116.349859,"outY":39.932853,"inX":499924.670817952,"inY":307416.268510315},{"outX":116.349857,"outY":39.933208,"inX":499924.503123004,"inY":307455.673875608},{"outX":116.349435,"outY":39.934514,"inX":499888.421145438,"inY":307600.637823138},{"outX":116.349021,"outY":39.937831,"inX":499853.045295999,"inY":307968.825289326},{"outX":116.342211,"outY":39.941268,"inX":499270.650037811,"inY":308350.29247794},{"outX":116.349177,"outY":39.941626,"inX":499866.425347775,"inY":308390.07640963},{"outX":116.34947,"outY":39.946057,"inX":499891.524872079,"inY":308881.926220592},{"outX":116.349489,"outY":39.949502,"inX":499893.180913906,"inY":309264.326770181},{"outX":116.350544,"outY":39.902331,"inX":499982.968641764,"inY":304028.31575471},{"outX":116.35101,"outY":39.905889,"inX":500022.879624935,"inY":304423.257404135},{"outX":116.352676,"outY":39.905849,"inX":500165.431852207,"inY":304418.830887368},{"outX":116.353107,"outY":39.905866,"inX":500202.310523914,"inY":304420.721602625},{"outX":116.353638,"outY":39.908956,"inX":500247.765012903,"inY":304763.717228949},{"outX":116.357041,"outY":39.909109,"inX":500538.924352851,"inY":304780.734091063},{"outX":116.350277,"outY":39.918267,"inX":499960.286215084,"inY":305797.213965467},{"outX":116.351791,"outY":39.919659,"inX":500089.821298595,"inY":305951.739368293},{"outX":116.352433,"outY":39.910797,"inX":500144.678042431,"inY":304968.058228928},{"outX":116.35341,"outY":39.911402,"inX":500228.27296487,"inY":305035.222134025},{"outX":116.353776,"outY":39.913974,"inX":500259.602136792,"inY":305320.718809716},{"outX":116.353714,"outY":39.916238,"inX":500254.310862023,"inY":305572.023579321},{"outX":116.357654,"outY":39.913168,"inX":500591.375895383,"inY":305231.292292036},{"outX":116.35734,"outY":39.914958,"inX":500564.5147178,"inY":305429.980085752},{"outX":116.350109,"outY":39.924321,"inX":499945.973499374,"inY":306469.210676904},{"outX":116.351051,"outY":39.92267,"inX":500026.541421389,"inY":306285.956190081},{"outX":116.351796,"outY":39.922352,"inX":500090.27008632,"inY":306250.664378727},{"outX":116.352098,"outY":39.930973,"inX":500116.165885209,"inY":307207.606249022},{"outX":116.353871,"outY":39.939129,"inX":500267.852853622,"inY":308112.950419478},{"outX":116.355978,"outY":39.931013,"inX":500448.033989714,"inY":307212.086233678},{"outX":116.353707,"outY":39.943511,"inX":500253.845469754,"inY":308599.357422838},{"outX":116.362195,"outY":39.903348,"inX":500979.905743026,"inY":304141.320865381},{"outX":116.364387,"outY":39.905909,"inX":501167.437290603,"inY":304425.622774953},{"outX":116.366483,"outY":39.902627,"inX":501346.793555762,"inY":304061.348408312},{"outX":116.369825,"outY":39.90197,"inX":501632.737070306,"inY":303988.472269648},{"outX":116.36287,"outY":39.910463,"inX":501037.623215606,"inY":304931.099567207},{"outX":116.366873,"outY":39.912835,"inX":501380.057969263,"inY":305194.451410632},{"outX":116.366742,"outY":39.916428,"inX":501368.814001021,"inY":305593.276595238},{"outX":116.367502,"outY":39.914343,"inX":501433.849358282,"inY":305361.850864931},{"outX":116.367483,"outY":39.917585,"inX":501432.187015754,"inY":305721.716615272},{"outX":116.367376,"outY":39.919697,"inX":501423.01007431,"inY":305956.149768652},{"outX":116.360383,"outY":39.922505,"inX":500824.821251627,"inY":306267.740910075},{"outX":116.361642,"outY":39.929366,"inX":500932.48171251,"inY":307029.337764728},{"outX":116.363983,"outY":39.925661,"inX":501132.733140012,"inY":306618.110560389},{"outX":116.365094,"outY":39.92257,"inX":501227.786839611,"inY":306275.021615067},{"outX":116.365483,"outY":39.928709,"inX":501261.001644067,"inY":306956.465777549},{"outX":116.366934,"outY":39.928815,"inX":501385.100033575,"inY":306968.25477701},{"outX":116.367201,"outY":39.923988,"inX":501407.992014623,"inY":306432.454248898},{"outX":116.368623,"outY":39.921288,"inX":501529.653613948,"inY":306132.773165135},{"outX":116.369494,"outY":39.921154,"inX":501604.155648058,"inY":306117.913423411},{"outX":116.36918,"outY":39.922702,"inX":501577.276474417,"inY":306289.738569472},{"outX":116.364665,"outY":39.939274,"inX":501190.944706964,"inY":308129.187095071},{"outX":116.364934,"outY":39.939471,"inX":501213.946298365,"inY":308151.058679955},{"outX":116.366017,"outY":39.931251,"inX":501306.646664264,"inY":307238.640383979},{"outX":116.366745,"outY":39.932718,"inX":501368.891048352,"inY":307401.491613945},{"outX":116.366694,"outY":39.933882,"inX":501364.516068238,"inY":307530.696939887},{"outX":116.366597,"outY":39.937629,"inX":501356.177429218,"inY":307946.619596571},{"outX":116.368305,"outY":39.931293,"inX":501502.322865897,"inY":307243.339642657},{"outX":116.369034,"outY":39.935174,"inX":501564.612387536,"inY":307674.150524809},{"outX":116.362082,"outY":39.946155,"inX":500970.013544749,"inY":308892.952935934},{"outX":116.3663,"outY":39.940823,"inX":501330.742972534,"inY":308301.155274619},{"outX":116.366493,"outY":39.94734,"inX":501347.169152157,"inY":309024.559832364},{"outX":116.367761,"outY":39.947103,"inX":501455.590251694,"inY":308998.273784142},{"outX":116.369807,"outY":39.944264,"inX":501630.573278635,"inY":308683.174063188},{"outX":116.369081,"outY":39.947602,"inX":501568.445699302,"inY":309053.687110927},{"outX":116.365541,"outY":39.950481,"inX":501265.734856023,"inY":309373.202448079},{"outX":116.364549,"outY":39.960723,"inX":501180.813816293,"inY":310510.073990965},{"outX":116.365946,"outY":39.96629,"inX":501300.171163509,"inY":311128.050096062},{"outX":116.371892,"outY":39.913007,"inX":501809.401863,"inY":305213.625742203},{"outX":116.371394,"outY":39.9156,"inX":501766.759824119,"inY":305501.443652089},{"outX":116.37089,"outY":39.929254,"inX":501723.428716333,"inY":307017.051394047},{"outX":116.373176,"outY":39.921273,"inX":501919.083749475,"inY":306131.187253558},{"outX":116.373726,"outY":39.921023,"inX":501966.130461398,"inY":306103.446961106},{"outX":116.373073,"outY":39.926404,"inX":501910.177300266,"inY":306700.735572722},{"outX":116.373481,"outY":39.929757,"inX":501945.005422954,"inY":307072.932754486},{"outX":116.374519,"outY":39.920961,"inX":502033.957332292,"inY":306096.57967991},{"outX":116.375751,"outY":39.920017,"inX":502139.35064337,"inY":305991.817531031},{"outX":116.373034,"outY":39.938453,"inX":501906.608830107,"inY":308038.199175348},{"outX":116.375077,"outY":39.93165,"inX":502081.453146708,"inY":307283.090370298},{"outX":116.37704,"outY":39.939862,"inX":502249.118857516,"inY":308194.681297996},{"outX":116.378372,"outY":39.932062,"inX":502363.214705007,"inY":307328.890018885},{"outX":116.379306,"outY":39.93179,"inX":502443.091134377,"inY":307298.717094049},{"outX":116.370628,"outY":39.94794,"inX":501700.70931428,"inY":309091.234019375},{"outX":116.371083,"outY":39.947756,"inX":501739.61483601,"inY":309070.818000575},{"outX":116.372758,"outY":39.947991,"inX":501882.820672429,"inY":309096.935450908},{"outX":116.373678,"outY":39.945156,"inX":501961.53794534,"inY":308782.261007762},{"outX":116.378375,"outY":39.944719,"inX":502363.137631038,"inY":308733.849416436},{"outX":116.370324,"outY":39.957912,"inX":501674.545679976,"inY":310198.147132843},{"outX":116.373169,"outY":39.951382,"inX":501917.890490166,"inY":309473.353607253},{"outX":116.37342,"outY":39.957971,"inX":501939.209696874,"inY":310204.756521965},{"outX":116.378979,"outY":39.952172,"inX":502414.571314677,"inY":309561.167288},{"outX":116.371484,"outY":39.964646,"inX":501773.581403178,"inY":310945.663431986},{"outX":116.373715,"outY":39.964003,"inX":501964.295365938,"inY":310874.333127724},{"outX":116.37745,"outY":39.966908,"inX":502283.469025022,"inY":311196.8774057},{"outX":116.378442,"outY":39.961329,"inX":502368.411812831,"inY":310577.611555128},{"outX":116.378589,"outY":39.963179,"inX":502380.924915826,"inY":310782.971048037},{"outX":116.381411,"outY":39.904072,"inX":502623.894420962,"inY":304222.010787669},{"outX":116.385443,"outY":39.905992,"inX":502968.744601765,"inY":304435.221340715},{"outX":116.387484,"outY":39.906196,"inX":503143.322936827,"inY":304457.912591432},{"outX":116.383363,"outY":39.920798,"inX":502790.360091406,"inY":306078.668920914},{"outX":116.387546,"outY":39.924142,"inX":503147.974036641,"inY":306449.958181983},{"outX":116.389514,"outY":39.921848,"inX":503316.357672527,"inY":306195.366879366},{"outX":116.380264,"outY":39.931841,"inX":502525.010654689,"inY":307304.398795846},{"outX":116.384317,"outY":39.932001,"inX":502871.579050201,"inY":307322.250347464},{"outX":116.38459,"outY":39.932051,"inX":502894.921181942,"inY":307327.806854516},{"outX":116.389959,"outY":39.933085,"inX":503353.961970376,"inY":307442.71528088},{"outX":116.389984,"outY":39.933358,"inX":503356.08848246,"inY":307473.019713796},{"outX":116.389827,"outY":39.93658,"inX":503342.534400571,"inY":307830.667229007},{"outX":116.38985,"outY":39.936744,"inX":503344.49421626,"inY":307848.872315643},{"outX":116.381546,"outY":39.942869,"inX":502634.302905134,"inY":308528.564286223},{"outX":116.381752,"outY":39.943007,"inX":502651.911071537,"inY":308543.88736503},{"outX":116.382322,"outY":39.94262,"inX":502700.656408511,"inY":308500.942297356},{"outX":116.384048,"outY":39.941499,"inX":502848.260707682,"inY":308376.548277466},{"outX":116.386226,"outY":39.943478,"inX":503034.399219992,"inY":308596.275735789},{"outX":116.386067,"outY":39.947579,"inX":503020.656667457,"inY":309051.495761756},{"outX":116.387624,"outY":39.946443,"inX":503153.803820187,"inY":308925.435002571},{"outX":116.386582,"outY":39.950115,"inX":503064.588368966,"inY":309333.012881764},{"outX":116.383288,"outY":39.967188,"inX":502782.423187121,"inY":311228.094609489},{"outX":116.384,"outY":39.966999,"inX":502843.28112178,"inY":311207.132448972},{"outX":116.384296,"outY":39.966825,"inX":502868.584976664,"inY":311187.825146627},{"outX":116.381854,"outY":39.971534,"inX":502659.723035627,"inY":311710.482083406},{"outX":116.390139,"outY":39.930351,"inX":503369.463441157,"inY":307139.238084279},{"outX":116.347585,"outY":39.941511,"inX":499730.270544502,"inY":308377.298595328},{"outX":116.3881063834,"outY":39.9729038709,"inX":502661.120763,"inY":311713.560029},{"outX":116.3809244335,"outY":39.9726495015,"inX":502050.252738,"inY":311680.367123},{"outX":116.3913300633,"outY":39.9684345399,"inX":502935.31788,"inY":311216.496255},{"outX":116.3804081082,"outY":39.9681775844,"inX":502003.782669,"inY":311184.607355},{"outX":116.3699957728,"outY":39.9678949321,"inX":501128.201215,"inY":39.9678949321},{"outX":116.3710780442,"outY":39.9579890309,"inX":501208.812559,"inY":310053.796159},{"outX":116.3719430566,"outY":39.9486029527,"inX":501282.785322,"inY":309016.754924},{"outX":116.393776,"outY":39.948972,"inX":503145.55389582156,"inY":309050.3112563505},{"outX":116.3544836,"outY":39.9502904,"inX":499869.24169,"inY":309050.422015},{"outX":116.333630383,"outY":39.9324133111,"inX":498017.077509,"inY":307222.915421},{"outX":116.3346362114,"outY":39.9230196097,"inX":498100.059775,"inY":306173.545392},{"outX":116.3345812261,"outY":39.9182399898,"inX":498094.843747,"inY":305649.571654},{"outX":116.3345265761,"outY":39.9140401904,"inX":498090.338995,"inY":305182.974225},{"outX":116.3354462385,"outY":39.9073701781,"inX":498168.105233,"inY":304444.194964},{"outX":116.339665,"outY":39.898523,"inX":498513.1092586703,"inY":303436.53351701406},{"outX":116.32634148,"outY":39.8899421693,"inX":497395.658881,"inY":302509.522701},{"outX":116.323600933,"outY":39.884415704,"inX":497156.907046,"inY":301897.113576},{"outX":116.328235,"outY":39.887949,"inX":496992.839252,"inY":301558.071746},{"outX":116.321833,"outY":39.875963,"inX":496997.581095,"inY":300978.144251},{"outX":116.336089,"outY":39.875786,"inX":498219.080054,"inY":300934.993473}];
    for(i=0; i<points.length; i++){
        points[i]['distance'] = (points[i].outX-x6)*(points[i].outX-x6)+(points[i].outY-y6)*(points[i].outY-y6);
    }
    points.sort(function(x,y){return x['distance']-y['distance']});
    var index = 1;
    for(var i=1; i<points.length; i++){
        if(parseFloat(points[i].outX-x6)*parseFloat(x6-points[0].outX)>0 && 
            parseFloat(points[i].outY-y6)*parseFloat(y6-points[0].outY)>0 &&
            (points[i].outX-points[0].outX!=0) && 
            (points[i].outY-points[0].outY!=0)
            ){
            index = i;
            break;
        }
    }
    if(index==1){
        for(var i=index; i<points.length; i++){
            if((points[i].outX-points[0].outX!=0) && 
            (points[i].outY-points[0].outY!=0)){
                index = i;
                break;
            }
        }
    }
    var x1 = points[0].inX;
    var y1 = points[0].inY;
    var x2 = points[index].inX;
    var y2 = points[index].inY;
    var x4 = points[0].outX;
    var y4 = points[0].outY;
    var x5 = points[index].outX;
    var y5 = points[index].outY;
    callback({
        x: (x2*x6-x2*x4-x1*x6+x1*x5)/(x5-x4) + offsetX,
        y: (y2*y6-y2*y4-y1*y6+y1*y5)/(y5-y4) + offsetY
    });
}

// function transformPoint(x6, y6, callback){
//     //取所有的录入的基准点
//     var offsetX = -550;
//     var offsetY = -130;
//     var sql = "select * from base_point";
//     db.query(sql, [], function(err, points){
//         if(points.length<2){
//             callback({
//                 x:-1,
//                 y:-1
//             });
//         } else {
//             for(i=0; i<points.length; i++){
//                 points[i]['distance'] = (points[i].outX-x6)*(points[i].outX-x6)+(points[i].outY-y6)*(points[i].outY-y6);
//             }
//             points.sort(function(x,y){return x['distance']-y['distance']});
//             var index = 1;
//             for(var i=1; i<points.length; i++){
//                 if(parseFloat(points[i].outX-x6)*parseFloat(x6-points[0].outX)>0 && 
//                     parseFloat(points[i].outY-y6)*parseFloat(y6-points[0].outY)>0 &&
//                     (points[i].outX-points[0].outX!=0) && 
//                     (points[i].outY-points[0].outY!=0)
//                     ){
//                     index = i;
//                     break;
//                 }
//             }
//             if(index==1){
//                 for(var i=index; i<points.length; i++){
//                     if((points[i].outX-points[0].outX!=0) && 
//                     (points[i].outY-points[0].outY!=0)){
//                         index = i;
//                         break;
//                     }
//                 }
//             }
//             var x1 = points[0].inX;
//             var y1 = points[0].inY;
//             var x2 = points[index].inX;
//             var y2 = points[index].inY;
//             var x4 = points[0].outX;
//             var y4 = points[0].outY;
//             var x5 = points[index].outX;
//             var y5 = points[index].outY;
//             callback({
//                 x: (x2*x6-x2*x4-x1*x6+x1*x5)/(x5-x4) + offsetX,
//                 y: (y2*y6-y2*y4-y1*y6+y1*y5)/(y5-y4) + offsetY
//             });
//         }
//     });
// }


//函数模板
function funcName(req,res){
    var query = req.body;
    try {
        var mobile = query.mobile;
        var token = query.token;
        User.getUserInfo(mobile, token, function(user) {
            if (user.error == 0) {
                //
            } else {
                errMessage(res,301,"用户未登录");
                return;
            }
        });
    } catch (e) {
        errMessage(res,500,e.message);
    }
}


//添加缓冲区距离
function addDistance(req,res){
    var query = req.body;
    try {
        var mobile = query.mobile;
        var token = query.token;
        var distance = query.distance || -1;
        if(distance==-1) {
            res.json({"code": 300, "data": {"status": "fail", "error": "参数错误"}});
            return;
        }
        User.getUserInfo(mobile, token, function(user) {
            if (user.error == 0) {
                db.query("select count(0) as total from buffer_distance where distance=?",[distance],function (err,result) {
                    if(result[0].total > 0){
                        res.json({"code": 301, "data": {"status": "fail", "error": "该距离已存在"}});
                    }else{
                        db.query("insert into buffer_distance (distance,is_default) values (?,?)",[distance,0],function(err,data){
                            if(err){
                                errMessage(res,500,"数据添加错误");
                            } else {
                                Log.insertLog(mobile,"添加缓冲区距离","addDistance");
                                sucMessage(res);
                            }
                        });
                    }
                })
            } else {
                errMessage(res,301,"用户未登录");
                return;
            }
        });
    } catch (e) {
        errMessage(res,500,e.message);
    }
}

//获取缓冲区距离
function getDistances(req,res){
    var query = req.body;
    try {
        var mobile = query.mobile;
        var token = query.token;
        User.getUserInfo(mobile, token, function(user) {
            if (user.error == 0) {
                db.query("select * from buffer_distance",[],function(err,data){
                    if(err){
                        errMessage(res,500,"数据查询错误");
                    } else {
                        res.json({ "code": 200, "data": { "status": "success", "error": "success","data":data} });
                    }
                });
            } else {
                errMessage(res,301,"用户未登录");
                return;
            }
        });
    } catch (e) {
        errMessage(res,500,e.message);
    }
}

//设置缓冲区默认距离
function setDefaultDistance(req,res){
    var query = req.body;
    try {
        var mobile = query.mobile;
        var token = query.token;
        var id = query.id || -1;
        if(id==-1) {
            res.json({"code": 300, "data": {"status": "fail", "error": "参数错误"}});
            return;
        }
        User.getUserInfo(mobile, token, function(user) {
            if (user.error == 0) {
                db.query("select id from buffer_distance ",[],function (err,result) {
                    if(err){
                        errMessage(res,500,"数据查询错误");
                    }else{
                        if(result.length > 0){
                            //将原有默认距离清空
                            db.query("update buffer_distance set is_default=0 where id=?",[result[0]],function(err,data){
                                if(err){
                                    errMessage(res,500,"数据查询错误");
                                } else {
                                    db.query("update buffer_distance set is_default=1 where id=?",[id],function(err,data){
                                        if(err){
                                            errMessage(res,500,"数据查询错误");
                                        } else {
                                            Log.insertLog(mobile,"设置缓冲区默认距离","setDefaultDistance");
                                            sucMessage(res);
                                        }
                                    });
                                }
                            });
                        }else {
                            db.query("update buffer_distance set is_default=1 where id=?",[id],function(err,data){
                                if(err){
                                    errMessage(res,500,"数据查询错误");
                                } else {
                                    Log.insertLog(mobile,"设置缓冲区默认距离","setDefaultDistance");
                                    sucMessage(res);
                                }
                            });
                        }
                    }
                });
            } else {
                errMessage(res,301,"用户未登录");
                return;
            }
        });
    } catch (e) {
        errMessage(res,500,e.message);
    }
}

exports.addCamera = addCamera;
exports.delCamera = delCamera;
exports.editCamera = editCamera;
exports.getCameraList = getCameraList;
exports.getCameraInfo = getCameraInfo;
// exports.searchCamera = searchCamera;
exports.getCameraListByAttr = getCameraListByAttr;
exports.getCameraAttrs = getCameraAttrs;
exports.addCameraAttr = addCameraAttr;
exports.editCameraAttr = editCameraAttr;
exports.createNewCamera = createNewCamera;
exports.getCameraAttrs_APP = getCameraAttrs_APP;
exports.editCameraAttrShow = editCameraAttrShow;
exports.multiAddCameras = multiAddCameras;
exports.backupCameras = backupCameras;
exports.restoreCameras = restoreCameras;
exports.multiEditCamerasByAttr = multiEditCamerasByAttr;
exports.getCameraTypes = getCameraTypes;
exports.addCameraTypes = addCameraTypes;
exports.editCameraTypes = editCameraTypes;
exports.delCameraTypes = delCameraTypes;
exports.downloadModel = downloadModel;
exports.delCameraColumn = delCameraColumn;
exports.transformPointReq = transformPointReq;
exports.addDistance = addDistance;
exports.getDistances = getDistances;
exports.setDefaultDistance = setDefaultDistance;

