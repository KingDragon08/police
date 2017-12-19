// var DB_CONFIG = require("../config/dbconfig");
// var mysql = require('mysql');

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


// var conn = mysql.createConnection({
//     host: DB_CONFIG.host,
//     user: DB_CONFIG.user,
//     password: DB_CONFIG.password,
//     database: DB_CONFIG.database,
//     port: DB_CONFIG.port
// });
// conn.connect();

var conn = require("../lib/db");
var Log = require('./logController')

/**
 * 矩形框选摄像头
 * @param req request
 * @param res response
 * @author KingDragon
 * @time 2017-11-02 afternoon
 */
function cameraSelectRect(req, res) {
    var query = req.body;
    try {
        var mobile = query.mobile;
        var token = query.token;
        checkMobile2Token_PC(mobile, token, function(result) {
            if (result) {
                var leftTopX = query.leftTopX || -1;
                var leftTopY = query.leftTopY || -1;
                var rightBottomX = query.rightBottomX || -1;
                var rightBottomY = query.rightBottomY || -1;
                if (leftTopX == -1 || leftTopY == -1 ||
                    rightBottomX == -1 || rightBottomY == -1) {
                    res.json({ "code": 301, "data": { "status": "fail", "error": "参数错误" } });
                } else {
                    leftTopX = parseFloat(leftTopX);
                    leftTopY = parseFloat(leftTopY);
                    rightBottomX = parseFloat(rightBottomX);
                    rightBottomY = parseFloat(rightBottomY);
                    var sql = "select * from camera where cast(cam_loc_lon as decimal(20,10))>? " +
                        "and cast(cam_loc_lon as decimal(20,10))<? and " +
                        "cast(cam_loc_lan as decimal(20,10))>? " +
                        "and cast(cam_loc_lan as decimal(20,10))<? and is_del=0";
                    conn.query(sql, [leftTopX, rightBottomX, leftTopY, rightBottomY],
                        function(err, data) {
                            ret = {};
                            ret["status"] = "success";
                            ret["data"] = data;
                            Log.insertLog(mobile,"矩形框选摄像头",sql);
                            res.json({ "code": 200, "data": ret });
                        });
                }
            } else {
                res.json({ "code": 300, "data": { "status": "fail", "error": "账号和token不匹配" } });
            }
        });
    } catch (e) {
        res.json({ "code": 300, "data": { "status": "fail", "error": "未知错误" } });
    }
}

/**
 * 圆形框选摄像头
 * @param req request
 * @param res response
 * @author KingDragon
 * @time 2017-11-02 afternoon
 */
function cameraSelectCircle(req, res) {
    var query = req.body;
    try {
        var mobile = query.mobile;
        var token = query.token;
        checkMobile2Token_PC(mobile, token, function(result) {
            if (result) {
                var centerX = query.centerX || -1;
                var centerY = query.centerY || -1;
                var radius = query.radius || -1;
                if (centerX == -1 || centerY == -1 || radius == -1) {
                    res.json({ "code": 301, "data": { "status": "fail", "error": "参数错误" } });
                } else {
                    centerX = parseFloat(centerX);
                    centerY = parseFloat(centerY);
                    radius = parseFloat(radius);
                    powRadius = radius * radius;
                    var sql = "select * from camera where (POWER(cam_loc_lon-?,2)+" +
                        "POWER(cam_loc_lan-?,2))<? and is_del=0";
                    conn.query(sql, [centerX, centerY, powRadius],
                        function(err, data) {
                            ret = {};
                            ret["status"] = "success";
                            ret["data"] = data;
                            Log.insertLog(mobile,"圆形框选摄像头",sql);
                            res.json({ "code": 200, "data": ret });
                        });
                }
            } else {
                res.json({ "code": 300, "data": { "status": "fail", "error": "账号和token不匹配" } });
            }
        });
    } catch (e) {
        res.json({ "code": 300, "data": { "status": "fail", "error": "未知错误" } });
    }
}

/**
 * 多边形框选摄像头
 * @param req request
 * @param res response
 * @author KingDragon
 * @time 2017-11-02 afternoon
 */
function cameraSelectPolygon(req, res) {
    var query = req.body;
    try {
        var mobile = query.mobile;
        var token = query.token;
        checkMobile2Token_PC(mobile, token, function(result) {
            if (result) {
                var points = query.points || -1;
                if (points == -1 || points.length < 3) {
                    res.json({ "code": 301, "data": { "status": "fail", "error": "参数错误" } });
                } else {
                    points = JSON.parse(points);
                    var minX = 1000000;
                    var maxX = -1
                    var minY = 1000000;
                    var maxY = -1;
                    //取矩形边界点坐标
                    for (var i = 0; i < points.length; i++) {
                        if (points[i].X && points[i].X < minX) {
                            minX = points[i].X;
                        }
                        if (points[i].X && points[i].X > maxX) {
                            maxX = points[i].X;
                        }
                        if (points[i].Y && points[i].Y < minY) {
                            minY = points[i].Y;
                        }
                        if (points[i].Y && points[i].Y > maxY) {
                            maxY = points[i].Y;
                        }
                    }
                    if (maxX < 0 || maxY < 0 || minX == 1000000 || minY == 1000000) {
                        res.json({ "code": 300, "data": { "status": "fail", "error": "参数错误" } });
                    } else {
                        //取出所有在矩形边界内的点
                        leftTopX = parseFloat(minX);
                        leftTopY = parseFloat(minY);
                        rightBottomX = parseFloat(maxX);
                        rightBottomY = parseFloat(maxY);
                        //获取符合条件的摄像头
                        var sql = "select * from camera where cast(cam_loc_lon as decimal(20,10))>? " +
                            "and cast(cam_loc_lon as decimal(20,10))<? and " +
                            "cast(cam_loc_lan as decimal(20,10))>? " +
                            "and cast(cam_loc_lan as decimal(20,10))<? and is_del=0";
                        conn.query(sql, [leftTopX, rightBottomX, leftTopY, rightBottomY],
                            function(err, result) {
                                var data = Array();
                                for (var i = 0; i < result.length; i++) {
                                    if (pointInPolygon(result[i].cam_loc_lon,
                                            result[i].cam_loc_lan, points)) {
                                        data.push(result[i]);
                                    }
                                }
                                ret = {};
                                ret["status"] = "success";
                                ret["data"] = data;
                                Log.insertLog(mobile,"多边形框选摄像头",sql);
                                res.json({ "code": 200, "data": ret });
                            });
                    }
                }
            } else {
                res.json({ "code": 300, "data": { "status": "fail", "error": "账号和token不匹配" } });
            }
        });
    } catch (e) {
        res.json({ "code": 300, "data": { "status": "fail", "error": "未知错误" } });
    }
}

/**
 * 直线附近摄像头
 * @param req request
 * @param res response
 * @author KingDragon
 * @time 2017-11-03 afternoon
 */
function cameraSelectLine(req, res) {
    var query = req.body;
    try {
        var mobile = query.mobile;
        var token = query.token;
        checkMobile2Token_PC(mobile, token, function(result) {
            if (result) {
                var points = query.points || -1;
                var space = query.space || -1;
                if (points == -1 || points.length < 2 || space == -1) {
                    res.json({ "code": 300, "data": { "status": "fail", "error": "参数错误" } });
                } else {
                    points = JSON.parse(points);
                    space = parseFloat(space);
                    var polygon = Array();
                    if (points[0].X && points[0].Y) {
                    	//多添加一个点，方便添加最后一个点的边界
                    	var temp = {};
                    	if(points[points.length-1].X!=points[points.length-2].X){
                    		var k = (points[points.length-1].Y-points[points.length-2].Y)/
                    			(points[points.length-1].X-points[points.length-2].X);
	                    	temp.X = points[points.length-1].X + 1;
	                    	temp.Y = points[points.length-1].Y + k;
                    	} else {
                    		temp.X = points[points.length-1].X;
                    		temp.Y = points[points.length-1].Y + 1;
                    	}
                    	points.push(temp);
                        //构造多边形区域
                        for (var i = 0; i < points.length - 1; i++) {
                            //根据相邻两个点的斜率添加多边形的点
                            if (points[i].X == points[i + 1].X && points[i].Y == points[i + 1].Y) { //两个点重合
                                continue;
                            } else {
                                if (points[i].X == points[i + 1].X) { //平行于X轴
                                    var temp = {};
                                    temp.X = points[i].X;
                                    temp.Y = points[i].Y - space;
                                    //添加上方的点
                                    polygon.push(temp);
                                    var temp1 = {};
                                    temp1.X = points[i].X;
                                    temp1.Y = points[i].Y + space;
                                    //添加下方的点
                                    polygon.push(temp1);
                                } else {
                                    if (points[i].Y == points[i + 1].Y) { //平行于Y轴
                                        var temp = {};
                                        temp.Y = points[i].Y;
                                        temp.X = points[i].X - space;
                                        //添加左侧的点
                                        polygon.push(temp);
                                        var temp1 = {};
                                        temp1.Y = points[i].Y;
                                        temp1.X = points[i].X + space;
                                        //添加右侧的点
                                        polygon.push(temp1);
                                    } else { //一般情况
                                        var k = (points[i].Y - points[i + 1].Y)*1.0 / (points[i].X - points[i + 1].X)*1.0; //斜率
                                        var k1 = -1 / k; //法向量的斜率
                                        var com = space / Math.sqrt(k1 * k1 + 1);
                                        var temp1 = {}
                                        var x1 = points[i].X - com;
                                        var y1 = points[i].Y - k1 * com;
                                        temp1.X = x1;
                                        temp1.Y = y1;
                                        polygon.push(temp1);
                                        var x2 = points[i].X + com;
                                        var y2 = points[i].Y + k1 * com;
                                        var temp2 = {};
                                        temp2.X = x2;
                                        temp2.Y = y2;
                                        polygon.push(temp2);
                                    }
                                }
                            }
                        }
                        points = polygon;
                        var minX = 1000000;
                        var maxX = -1
                        var minY = 1000000;
                        var maxY = -1;
                        //取矩形边界点坐标
                        for (var i = 0; i < points.length; i++) {
                            if (points[i].X && points[i].X < minX) {
                                minX = points[i].X;
                            }
                            if (points[i].X && points[i].X > maxX) {
                                maxX = points[i].X;
                            }
                            if (points[i].Y && points[i].Y < minY) {
                                minY = points[i].Y;
                            }
                            if (points[i].Y && points[i].Y > maxY) {
                                maxY = points[i].Y;
                            }
                        }
                        //取出所有在矩形边界内的点
                        var leftTopX = parseFloat(minX);
                        var leftTopY = parseFloat(minY);
                        var rightBottomX = parseFloat(maxX);
                        var rightBottomY = parseFloat(maxY);
                        //获取符合条件的摄像头
                        var sql = "select * from camera where cast(cam_loc_lon as decimal(20,10))>? " +
                            "and cast(cam_loc_lon as decimal(20,10))<? and " +
                            "cast(cam_loc_lan as decimal(20,10))>? " +
                            "and cast(cam_loc_lan as decimal(20,10))<? and is_del=0";
                        conn.query(sql, [leftTopX, rightBottomX, leftTopY, rightBottomY],
                            function(err, result) {
                                var data = Array();
                                for (var i = 0; i < result.length; i++) {
                                    if (pointInPolygon(result[i].cam_loc_lon,
                                            result[i].cam_loc_lan, points)) {
                                        data.push(result[i]);
                                    }
                                }
                                ret = {};
                                ret["status"] = "success";
                                ret["data"] = data;
                                Log.insertLog(mobile,"获取直线附近摄像头",sql);
                                res.json({ "code": 200, "data": ret });
                            });
                    } else {
                        res.json({ "code": 301, "data": { "status": "fail", "error": "参数错误" } });
                    }
                }
            } else {
                res.json({ "code": 300, "data": { "status": "fail", "error": "账号和token不匹配" } });
            }
        });
    } catch (e) {
        res.json({ "code": 300, "data": { "status": "fail", "error": "未知错误" } });
    }
}

/**
 * 验证账号和token是否匹配_PC端
 * @param mobile phone number
 * @param token token returned by login
 * @param callback callback function
 * @author KingDragon
 * @time 2017-11-02 afternoon
 */
function checkMobile2Token_PC(mobile, token, callback) {
    conn.query("select count(Id) as total from user where mobile=? and token=? and status=?", [mobile, token, 1],
        function(err, result) {
            if (result[0].total > 0) {
                callback(true);
            } else {
                callback(false);
            }
        });
}

//判断点是否在多边形内
function pointInPolygon(x, y, points) {
    var ret = false;
    var i = points.length - 1,
        j = points.length - 1;
    for (var i = 0; i < points.length; i++) {
        if ((points[i].Y < y && points[j].Y >= y ||
                points[j].Y < y && points[i].Y >= y) &&
            (points[i].X <= x || points[j].X <= x)) {
            if (points[i].X + (y - points[i].Y) / (points[j].Y - points[i].Y) * (points[j].X - points[i].X) < x) {
                ret = !ret;
            }
        }
        j = i;
    }
    return ret;
}

//模板
function funcName(req, res) {
    var query = req.body;
    try {
        var mobile = query.mobile;
        var token = query.token;
        checkMobile2Token_PC(mobile, token, function(result) {
            if (result) {

            } else {
                res.json({ "code": 300, "data": { "status": "fail", "error": "账号和token不匹配" } });
            }
        });
    } catch (e) {
        res.json({ "code": 300, "data": { "status": "fail", "error": "未知错误" } });
    }
}

exports.cameraSelectRect = cameraSelectRect;
exports.cameraSelectCircle = cameraSelectCircle;
exports.cameraSelectPolygon = cameraSelectPolygon;
exports.cameraSelectLine = cameraSelectLine;