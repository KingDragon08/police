var db = require("../lib/db");
var check = require("../lib/check");
var User = require("./userController");
var dbTableAttr = require("../config/dbTableAttrConf");
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
                                        res.json(ret);
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
    db.query("select attr_name from camera_attr where Id>12",[],
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
                            ret = {
                                "code": 200,
                                "data": {
                                    "status": "success",
                                    "error": "success",
                                    "cam_id": rows.insertId
                                }
                            };
                            callback(ret);
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
                            sql = "update camera set is_del = 1, uptime = ? where cam_id = ?";
                            dataArr = [curtime, cam_id];
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
                            db.query("select attr_name from camera_attr where Id>12",[],
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
                                            res.json({
                                                "code": 200,
                                                "data": {
                                                    "status": "success",
                                                    "error": "success"
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
    console.log(query);
    try {
        var sql = "select count(*) as total from camera where is_del = 0";
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
                    sql = "select * from camera where is_del = 0";
                    pageSize = total;
                    dataArr = [];
                } else {
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
        var sql = "select count(*) as total from camera where is_del = 0 and " + attrName + " like '%3%'";
        // var dataArr = [attrName, attrValue];
        var dataArr = [attrValue];
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
                    sql = "select * from camera where is_del = 0 and " + attrName + " like '%?%'";
                    pageSize = total;
                    dataArr = [attrValue];
                } else {
                    sql = "select * from camera where is_del = 0 and " + attrName + " like '%?%' order by cam_id limit ?, ?";
                    dataArr = [attrValue, start, pageSize];
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
                        sql = "select * from camera where cam_id = ?";
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
function searchCamera(req, res) {
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
            var loc_lon = query.loc_lon || '';
            if (check.isNull(loc_lon)) {
                res.json({
                    "code": 401,
                    "data": {
                        "status": "fail",
                        "error": "loc_lon is null"
                    }
                });
                return;
            }
            var loc_lan = query.loc_lan || '';
            if (check.isNull(loc_lan)) {
                res.json({
                    "code": 401,
                    "data": {
                        "status": "fail",
                        "error": "loc_lan is null"
                    }
                });
                return;
            }
            var radius = query.radius || 20;
            var size = query.size || 20;
            var sql = "select count(*) as total from camera where is_del = 0 ";
            sql += "and (cam_name like ? or cam_addr like ?)";
            var dataArr = [info, info];
            console.log(dataArr);
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
                    console.log(rows);
                    var total = rows[0].total;
                    if (rows[0].total > 0) {
                        sql = "select * from camera where is_del = 0 and (cam_name like ? or cam_addr like ?)";
                        dataArr = [info, info];
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
                                res.json({
                                    "code": 200,
                                    "data": {
                                        "status": "success",
                                        "error": "success",
                                        "rows": rows,
                                        "total": total
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
                    var data = [12];
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
                var reg= /^[A-Za-z]+$/;
                if(reg.test(attr_name)){
                    //给camera表添加字段
                    var sql = "alter table camera add column "+attr_name+" varchar(1000)";
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
                            //给camera_attr添加纪录
                            sql = "insert into camera_attr(attr_name,attr_desc)"+
                                    "values(?,?)";
                            dataArr = [attr_name,attr_desc];
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
 *@param attrId=>属性Id >12 is needed
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
                                        sql = "update camera_attr set attr_name=?,attr_desc=? where Id=?";
                                        db.query(sql,[attrNewName,attrNewDesc,attrId],function(err,rows){
                                            if(err){
                                                res.json({
                                                    "code": 502,
                                                    "data": {
                                                        "status": "fail",
                                                        "error": err.message
                                                    }
                                                }); 
                                            } else {
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



function funcName(req,res){
    var query = req.body;
    try {
        var mobile = query.mobile;
        var token = query.token;
        User.getUserInfo(mobile, token, function(user) {
            if (user.error == 0) {
                // user_info = user.data;
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





exports.addCamera = addCamera;
exports.delCamera = delCamera;
exports.editCamera = editCamera;
exports.getCameraList = getCameraList;
exports.getCameraInfo = getCameraInfo;
exports.searchCamera = searchCamera;
exports.getCameraListByAttr = getCameraListByAttr;
exports.getCameraAttrs = getCameraAttrs;
exports.addCameraAttr = addCameraAttr;
exports.editCameraAttr = editCameraAttr;
exports.createNewCamera = createNewCamera;


