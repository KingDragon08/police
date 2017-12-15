var db = require("../lib/db");
var check = require("../lib/check");
var User = require("./userController");
var cameraAsync = require("./cameraAsync");
var dbTableAttr = require("../config/dbTableAttrConf");
var xlsx = require('node-xlsx');
var fs = require('fs');
var async = require('async')
var Log = require('./logController')

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
                                "error": "param error"
                            }
                        });
                        return;    
                } else {
                    cam_extra = JSON.parse(cam_extra);
                    createNewCamera(cam_no,cam_name,cam_sta,curtime,curtime,
                                    user_id,cam_loc_lan,cam_loc_lon,cam_desc,
                                    cam_addr,cam_extra,function(ret){
                                        Log.insertLog(mobile,req.url,"add Camera");
                                        res.json(ret);
                                    });
                    //删除重复记录
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
                                        sql = "delete a from camera a left join(select cam_id from camera group "+
                                                "by "+camera_attrs +" )b on a.cam_id=b.cam_id where b.cam_id is null";
                                        db.query(sql,[],function(err,result){
                                            if(err){
                                                console.log(err);
                                            }
                                        });
                                    }
                                });
                    
                }
                
            } else {
                res.json({
                    "code": 301,
                    "data": {
                        "status": "fail",
                        "error": "user not login"
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
    db.query("select attr_name from camera_attr where Id>43",[],
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
                var sql_after = "values(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?";
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
                                "error": "cam_extra not fully justified"
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
                            "error": "cam_id is null"
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
                                            Log.insertLog(mobile,req.url,sql);
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
                                                    "error": "async error"
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
                                    "error": "camera not exist"
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
                        "error": "user not login"
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
                        "error": "user not login"
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
                            "error": "param error1"
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
                            db.query("select attr_name from camera_attr where Id>43",[],
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
                                                    Log.insertLog(mobile,req.url,sql);
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
                                                            "error": "async error"
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
                                    "error": "camera not exist"
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
                    sql = "select * from camera where is_del = 0 order by cam_id";

                    pageSize = total;
                    dataArr = [];
                } else {
                    //sql = "select *,cast(cam_loc_lan as decimal(20,2)) as cam_loc_lan,cast(cam_loc_lon as decimal(20,2)) as cam_loc_lon,from_unixtime(addtime div 1000,'%Y-%m-%d %H:%I:%S') as addtime from camera where is_del = 0 order by cam_id limit ?, ?";
                    sql = "select * from camera where is_del = 0 order by cam_id limit ?, ?";
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
                        Log.insertLog(query.mobile,req.url,sql);

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
                "error": "attrName is invalid"
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
                "error": "attrValue is null"
            }
        });
        return;
    }
    try {
        var sql = "select count(*) as total from camera where is_del = 0 and " + attrName + " like " +
                    "'%" + attrValue + "%'";
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
                            "'%" + attrValue + "%'";
                    pageSize = total;
                    dataArr = [];
                } else {
                    sql = "select * from camera where is_del = 0 and " + attrName + " like " +
                            "'%" + attrValue + "%'" + " order by cam_id limit ?, ?";
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
                        var mobile = req.body.mobile || -1;
                        Log.insertLog(mobile,req.url,sql);
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
                        "error": "user not login"
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
                        "error": "cam_id is null"
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
                        sql = "select * from camera where cam_id=?";

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
                                Log.insertLog(mobile,req.url,sql);

/**************************************************忧伤的分割线**************************************************/
                                //console.log(rows);
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
                                "error": "camera not exist"
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
        User.getUserInfo(mobile, token, function(user) {
            if (user.error == 0) {
                // user_info = user.data;
                var type = query.type || -1;
                if(type==-1){
                    var sql = "select * from camera_attr";
                    var data = Array();
                } else {
                    var sql = "select * from camera_attr where Id>?";
                    var data = [43];
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
                        Log.insertLog(mobile,req.url,sql);
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
                        "error": "user not login"
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
                    var data = [43];
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
                        Log.insertLog(mobile,req.url,sql);
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
                        "error": "user not login"
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
                var reg= /^[A-Za-z]+$/;
                if(attr_name==-1 || attr_desc==-1 || attr_comment==-1){
                    res.json({
                        "code": 303,
                        "data": {
                            "status": "fail",
                            "error": "param error"
                        }
                    });
                    return;
                }
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
                                    Log.insertLog(mobile,req.url,sql);
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
                            "error": "attr_name must be alphabet"
                        }
                    });
                    return;    
                }
            } else {
                res.json({
                    "code": 301,
                    "data": {
                        "status": "fail",
                        "error": "user not login"
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
                            "error": "param error"
                        }
                    });
                    return;    
                } else {
                    if(attrId<13){
                        res.json({
                            "code": 403,
                            "data": {
                                "status": "fail",
                                "error": "attrId must bigger than 43"
                            }
                        });
                        return;    
                    }
                    //获取对应Id的字段名称
                    db.query("select attr_name from camera_attr where Id=?",
                        [parseInt(attrId)],function(err,rows){
                            if(rows && rows.length && rows[0].attr_name){
                                var attrName = rows[0].attr_name;
                                //更新camera表
                                var sql = "alter table camera change "+attrName+" "+
                                            attrNewName+" varchar(1000)";
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
                                                Log.insertLog(mobile,req.url,sql);
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
                                        "error": "attr not found"
                                    }
                                });         
                            }
                        });
                }
            } else {
                res.json({
                    "code": 301,
                    "data": {
                        "status": "fail",
                        "error": "user not login"
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
                                    Log.insertLog(mobile,req.url,"editCameraAttrShow");
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
                        "error": "user not login"
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
                                "error": "file not exist"
                            }
                        });
                        return;
                    } else {
                        var obj = xlsx.parse(excel);
                        var excelObj = obj[0].data;
                        console.log(excelObj);
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
                                                "error": "模版格式不对"
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
                        "error": "user not login"
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
                        attr_name.splice(9,1);
                        //弹出表头
                        data.shift();
                        //开始导入
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
                            //插入摄像头数据
                            db.query("insert into camera("+attr_name_list.join(',')+")values("+spaceStr+")",item,
                                function(err,data){
                                    if(err){
                                        flag = false;
                                        console.log(err.message);
                                        call(null, item);
                                    } else {
                                        call(null, item);
                                        //插入地图中的摄像头数据
                                        // db.query("insert into xc_baymin.smdtv_2(SmX,SmY,cam_id,cam_no,"+
                                        //             "cam_name,cam_sta,cam_loc_la,cam_loc_lo,is_del)values("+
                                        //             "?,?,?,?,?,?,?,?,?)",
                                        //             [item[6],item[7],data.insertId,item[0],item[1],item[2],item[6],item[7],0],
                                        //             function(err,data){
                                        //                 if(err){
                                        //                     flag = false;
                                        //                     console.log(err.message);
                                        //                     call(null,item);
                                        //                 } else {
                                        //                     call(null, item);
                                        //                 }
                                        //             });
                                    }
                                });
                        },function(err,results){
                            if(flag){
                                Log.insertLog(req.body.mobile,req.url,"multiAddCameras");
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
                        "error": "user not login"
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
                        Log.insertLog(req.body.mobile,req.url,"backupCameras");
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
                                                                            Log.insertLog(mobile,req.url,"restoreCameras");
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
                                        "error": "camera_copy not found"
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
                        "error": "user not login"
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
            errMessage(res,300,"param error");
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
                                                errMessage(res,404,"file not exist");
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
                                                Log.insertLog(mobile,req.url,"multiEditCamerasByAttr");
                                                sucMessage(res);
                                            }
                                        });
                                    } else {
                                        errMessage(res,404,"attrName not fount in table camera");
                                    }
                                }
                            });
            } else {
                errMessage(res,301,"user not login");
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
                        errMessage(res,500,"database error");
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
                errMessage(res,301,"user not login");
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
                    errMessage(res,300,"param error");
                    return;
                }
                db.query("update camera_type set name=?,url=? where id=?",
                            [name, url, Id],
                            function(err, result){
                                if(err){
                                    errMessage(res, 500, "database error");
                                } else {
                                    sucMessage(res);
                                }
                            });
            } else {
                errMessage(res,301,"user not login");
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
                if(name==-1 || url==-1){
                    errMessage(res,300,"param error");
                    return;
                }
                //判断类别是否已经存在
                db.query("select count(0) as total from camera_type where name=?",
                            [name],
                            function(err, result){
                                if(err){
                                    errMessage(res, 500, "database error");
                                } else {
                                    if(result[0].total>0){
                                        errMessage(res, 300, "name already exist");
                                    } else {
                                        db.query("insert into camera_type(name,url)values(?,?)",
                                                    [name, url],
                                                    function(err, result){
                                                        if(err){
                                                            errMessage(res, 501, "database error");
                                                        } else {
                                                            sucMessage(res);
                                                        }
                                                    });
                                    }
                                }
                            });
            } else {
                errMessage(res,301,"user not login");
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
                    errMessage(res, 500, 'param error');
                } else {
                    //判断类别是否存在
                    db.query("select name from camera_type where id=?",
                                [Id],
                                function(err, result){
                                    if(err){
                                        errMessage(res, 500, "database error");
                                    } else {
                                        if(result[0].name){
                                            var name = result[0].name;
                                            //删除摄像头类别表记录
                                            db.query("delete from camera_type where id=?",[Id],function(err,result){
                                                if(err){
                                                    errMessage(res, 500, "database error");
                                                } else {
                                                    //删除这一个类别的摄像头数据
                                                    db.query("delete from camera where cam_category=?",
                                                                [name],
                                                                function(err, result){
                                                                    if(err){
                                                                        errMessage(res, 500, "database error");
                                                                    } else {
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
                errMessage(res,301,"user not login");
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
                errMessage(res,301,"user not login");
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

