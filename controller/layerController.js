var db = require("../lib/db");
var check = require("../lib/check");
var User = require("./userController");
var Log = require('./logController')

var LayerBasicTable = "layer_basic";
var LayerExtTable = "layer_ext";
var LayerTablePre = "layer_table_";

// create table `layer_basic`(
//     `layer_id` int(32) not null auto_increment comment '图层id',
//     `layer_name` varchar(16) comment '图层名称',
//     `img_path` varchar(255) comment '图层图片路径',
//     `table_name` varchar(255) comment '图层数据表名称',
//     `user_id` int(32) comment '创建用户id',
//     `addtime` varchar(32) comment '创建时间',
//     primary key (`layer_id`)
// ) default charset=utf8 comment '图层基础表';

// create table `layer_ext`(
//     `ext_id` int(32) not null auto_increment comment '图层扩展属性id',
//     `layer_id` int(32) comment '图层id',
//     `ext_name` varchar(32) comment '扩展属性名称',
//     `ext_value` varchar(255) comment '扩展属性值',
//     `user_id` int(32) comment '创建用户id',
//     `addtime` varchar(32) comment '创建时间',
//     primary key (`ext_id`)
// ) default charset=utf8 comment '图层扩展属性表';

// create table `layer_table_timestamp`(
//     `id` int(32) not null auto_increment comment '图层数据id',
//     `loc_lan` varchar(32) comment '纬度',
//     `loc_lon` varchar(32) comment '经度',
//     `user_id` int(32) comment '创建用户id',
//     `addtime` varchar(32) comment '创建时间',
//     `updatetime` varchar(32) comment '更新时间',
//     primary key (`id`)
// ) default charset=utf8 comment '图层表';



/**
 * 添加图层
 * @param {[type]} req [description]
 * @param {[type]} res [description]
 */
function addLayer(req, res) {
    var query = req.body;
    try {

        var layerName = query.layerName || "";
        var locLon = query.locLon || "";
        var locLan = query.locLan || "";

        if (check.isNull(layerName) || check.isNull(locLon) || check.isNull(locLan)) {
            res.json({
                "code": 401,
                "data": {
                    "status": "fail",
                    "error": "request param is invalid"
                }
            });
            return;
        }

        var mobile = query.mobile;
        var token = query.token;
        User.getUserInfo(mobile, token, function(user) {
            if (user.error == 0) {
                userInfo = user.data;
                var userId = userInfo.Id;
                
                var curtime = new Date().getTime();
                var imgPath = query.imgPath || "";
                var layerExt = query.layerExt || "";

                createNewLayer(layerName, locLon, locLan, imgPath, userId, curtime, function(ret){
                    Log.insertLog(userId, req.url, "add Basic Layer");
                    res.json(ret);
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
 * 添加图层
 * 
 * 先添加基础图层，再创建图层数据表
 * @param  {[type]}   layerName [description]
 * @param  {[type]}   locLon    [description]
 * @param  {[type]}   locLan    [description]
 * @param  {[type]}   imgPath   [description]
 * @param  {[type]}   userId    [description]
 * @param  {[type]}   curtime   [description]
 * @param  {Function} callback  [description]
 * @return {[type]}             [description]
 */
function createNewLayer(layerName, imgPath, userId, curtime, callback){
    ret = {};

    var tableName = getTableName(curtime, userId);
    var sql = "insert into " + LayerBasicTable + " (layer_name, img_path, table_name, user_id, addtime) ";
    sql += "values(?, ?, ?, ?, ?)";
    var dataArr = [layerName, imgPath, tableName, userId, curtime];

    db.query(sql, dataArr, function(err, rows) {
        if (err) {
            ret = {
                    "code": 501,
                    "data": {
                        "status": "fail",
                        "error": err.message
                    }
                };
        } else {

            var layerId = rows.insertId;
            createNewLayerTable(layerId, tableName, function(res){
                ret = res;
            });
        }
    });

    callback(ret);
}


function createNewLayerTable(layerId, tableName, callback) {
    ret = {};
    var sql = "create table `" + tableName + "` (" +
                    "`id` int(32) not null auto_increment comment '图层数据id'," +
                    "`loc_lan` varchar(32) comment '纬度'," +
                    "`loc_lon` varchar(32) comment '经度'," +
                    "`user_id` int(32) comment '创建用户id'," +
                    "`addtime` varchar(32) comment '创建时间'," +
                    "`updatetime` varchar(32) comment '更新时间'," +
                    "primary key (`id`)"+
                ") default charset=utf8 comment '图层表';";

    Log.insertLog(userId, "create new table", sql);

    db.query(sql, [], function(mErr, mRows) {
       if (mErr) {
        ret = {"code": 501, "data": {"status": "fail", "error": mErr.message}};
       } else {
        ret = {
                "code": 200,
                "data": {
                    "status": "success",
                    "error": "success",
                    "layer_id": layerId
                }
            };
       }
    });

    callback(ret);
}

function addLayerBasicAttr(layerId, userId, curtime, callback){
    ret = {};

    var sql = "insert into " + LayerExtTable + " (layer_id, ext_name, ext_value, user_id, addtime) ";
    sql += "values(?)";

    callback(ret);
}

function getTableName(curtime, userId) {
    var tableName = LayerTablePre + curtime + userId + getRandomNum(1, 10);

    return tableName;
}


function getRandomNum(Min, Max){   
    var Range = Max - Min;   
    var Rand = Math.random();

    return (Min + Math.round(Rand * Range));   
} 

/**
 * 删除基础图层，并删除图层扩展属性，以及图层数据
 * 
 * @param  {[type]} req [description]
 * @param  {[type]} res [description]
 * @return {[type]}     [description]
 */
function delLayer(req, res) {
    var query = req.body;
    try {
        var mobile = query.mobile;
        var token = query.token;
        User.getUserInfo(mobile, token, function(user) {
            if (user.error == 0) {
                userInfo = user.data;

                var layerId = query.layerId || "";
                if (check.isNull(layerId)) {
                    res.json({
                        "code": 401,
                        "data": {
                            "status": "fail",
                            "error": "request param is invalid"
                        }
                    });
                    return;
                }

                var sql = "select table_name from " + LayerBasicTable + " where layer_id = ?";
                var dataArr = [layerId];
                db.query(sql, dataArr, function(err, rows) {
                    if (err) {
                        res.json({
                            "code": 501,
                            "data": {
                                "status": "fail",
                                "error": err.message
                            }
                        });
                        return;
                    } else {
                        if (!check.isNull(rows[0].table_name)) {
                            var userId = userInfo.Id;
                            var tableName = rows[0].table_name;
                            doDelLayer(userId, tableName, layerId, function(ret){
                                Log.insertLog(userId, req.url, "del all Layer");
                                res.json(ret);
                            });
                        } else {
                            res.json({
                                "code": 404,
                                "data": {
                                    "status": "fail",
                                    "error": "layer not exist"
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
 * 执行删除图层操作
 *
 * 删除图层，图层属性和图层数据
 * @param  {[type]}   userId   [description]
 * @param  {[type]}   layerId  [description]
 * @param  {Function} callback [description]
 * @return {[type]}            [description]
 */
function doDelLayer(userId, tableName, layerId, callback) {
    var ret = {};

    // 先删除图层数据
    var sql = "drop table " + tableName;
    var dataArr = [];
    Log.insertLog(userId, "drop layer table", sql);
    db.query(sql, dataArr, function(err, rows){
        if (err) {
            ret = {
                "code": 501,
                "data": {
                    "status": "fail",
                    "error": err.message
                }
            };
        } else {
            // 再删除扩展属性
            sql = "delete from " + LayerExtTable + " where layer_id = ?";
            dataArr = [layerId];

            Log.insertLog(userId, "delete layer attr", sql);

            db.query(sql, dataArr, function(mErr, mRows) {
                if (err) {
                    ret = {
                        "code": 501,
                        "data": {
                            "status": "fail",
                            "error": mErr.message
                        }
                    };
                } else {
                    // 最后删除基础图层
                    sql = "delete from " + LayerBasicTable + " where layer_id = ?";
                    dataArr = [layerId];

                    Log.insertLog(userId, req.url, sql);

                    db.query(sql, dataArr, function(mmErr, mmRows){
                        if (mmErr) {
                            ret = {"code": 501, "data": {"status": "fail","error": mmErr.message}};
                        } else {
                            ret = {"code": 200, "data": {"status": "success", "error": "success"}};
                        }
                    });                                    
                }
            });
        }

    });

    callback(ret);
}


exports.addLayer = addLayer;
exports.delLayer = delLayer;