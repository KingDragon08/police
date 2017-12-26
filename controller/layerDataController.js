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
//     `ext_desc` varchar(255) comment '扩展属性描述',
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
//     `uptime` varchar(32) comment '更新时间',
//     primary key (`id`)
// ) default charset=utf8 comment '图层表';



/**
 * 添加图层数据
 * @param {[type]} req [description]
 * @param {[type]} res [description]
 */
function addLayerData(req, res) {
    var query = req.body;
    try {

        var layerId = query.layerId || "";
        var locLan = query.locLan || "";
        var locLon = query.locLon || "";

        if (check.isNull(layerId) || check.isNull(locLan) || check.isNull(locLan)) {
            res.json({
                "code": 401,
                "data": {
                    "status": "fail",
                    "error": "请求参数无效"
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

                getTableNameByLayerId(layerId, function(resJson){
                    if (resJson.code == 200) {
                        var tableName = resJson.data.tableName;

                        var curtime = new Date().getTime();
                        var extData = query.extData || "";

                        extData = JSON.parse(extData);

                        doAddLayerData(layerId, tableName, locLan, locLon, userId, curtime, extData, function(ret){
                            Log.insertLog(userId, "添加图层数据", "add Layer Data");
                            res.json(ret);
                        });

                    } else {
                        res.json(resJson);
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
 * 根据layerid获取图层数据表名称
 * @param  {[type]}   layerId  [description]
 * @param  {Function} callback [description]
 * @return {[type]}            [description]
 */
function getTableNameByLayerId(layerId, callback) {
    var ret = {};

    var sql = "select table_name from " + LayerBasicTable + " where layer_id = ?";
    var dataArr = [layerId];
    
    db.query(sql, dataArr, function(err, rows) {
        if (err) {
            ret = {
                "code": 501,
                "data": {
                    "status": "fail",
                    "error": err.message
                }
            };
            callback(ret);
        } else {
            if (!check.isNull(rows[0].table_name)) {
                var tableName = rows[0].table_name;
                ret = {"code" : 200, "data": {"status": "success", "error": "success", "tableName": tableName}};

            } else {
                ret = {
                    "code": 404,
                    "data": {
                        "status": "fail",
                        "error": "图层不存在"
                    }
                };
            }
            callback(ret);
        }
    });
}


/**
 * 添加图层数据操作
 * @param  {[type]}   layerId   [description]
 * @param  {[type]}   tableName [description]
 * @param  {[type]}   locLan    [description]
 * @param  {[type]}   locLon    [description]
 * @param  {[type]}   userId    [description]
 * @param  {[type]}   curtime   [description]
 * @param  {[type]}   extData   [description]
 * @param  {Function} callback  [description]
 * @return {[type]}             [description]
 */
function doAddLayerData(layerId, tableName, locLan, locLon, userId, curtime, extData, callback){
    ret = {};

    var sql = "select ext_name from " + LayerExtTable + " where layer_id = ?";
    var dataArr = [layerId];
    // 获取所有额外属性
    db.query(sql, dataArr, function(err,rows){
            if(err){
                ret = {
                        "code": 501,
                        "data": {
                            "status": "fail",
                            "error": err.message
                        }
                };
                callback(ret);
            } else {
                var sql_before = "insert into " + tableName + " (loc_lon, loc_lan, user_id, addtime, uptime) ";
                var sql_after = " values(?, ?, ?, ?, ?";

                dataArr = [locLon, locLan, userId, curtime, curtime];

                for(var i=0; i<rows.length; i++){
                    if(!check.isNull(extData[rows[i].ext_name])){
                        sql_before += ", " + rows[i].ext_name;
                        sql_after += ",?";
                        dataArr.push(extData[rows[i].ext_name]||"");
                    }
                }
                sql_before += ") ";
                sql_after += ") ";
                sql = sql_before + sql_after;
                db.query(sql,dataArr,function(err,rows){
                    if(err){
                        ret = {
                            "code": 503,
                            "data": {
                                "status": "fail",
                                "error": err.message
                            }
                        };
                    } else {
                            //Log.insertLog(userId, "添加图层数据操作", sql);
                            ret = {
                                "code": 200,
                                "data": {
                                    "status": "success",
                                    "error": "success",
                                    "layerDataId": rows.insertId
                                }
                            };
                    }
                    callback(ret);
                });
                
            }
        });
}


/**
 * 删除图层数据
 * 
 * @param  {[type]} req [description]
 * @param  {[type]} res [description]
 * @return {[type]}     [description]
 */
function delLayerData(req, res) {
    var query = req.body;
    try {

        var layerId = query.layerId || "";
        var layerDataId = query.layerDataId || "";
        if (check.isNull(layerId) || check.isNull(layerDataId)) {
            res.json({
                "code": 401,
                "data": {
                    "status": "fail",
                    "error": "请求参数无效"
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

                getTableNameByLayerId(layerId, function(resJson){
                    if (resJson.code == 200) {
                        var tableName = resJson.data.tableName;

                        doDelLayerData(userId, tableName, layerDataId, function(ret){
                                Log.insertLog(userId, req.url, "删除图层数据");
                                res.json(ret);
                            });

                    } else {
                        res.json(resJson);
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
 * 执行删除图层数据操作
 * @param  {[type]}   userId      [description]
 * @param  {[type]}   tableName   [description]
 * @param  {[type]}   layerDataId [description]
 * @param  {Function} callback    [description]
 * @return {[type]}               [description]
 */
function doDelLayerData(userId, tableName, layerDataId, callback) {
    var ret = {};

    var sql = "delete from " + tableName + " where id = ?";
    var dataArr = [layerDataId];
   
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
            //Log.insertLog(userId, "删除图层数据", "del Layer Data");
            ret = {"code": 200, "data": {"status": "success", "error": "success"}};
        }
        callback(ret);
    });
}

/**
 * 分页获取图层数据
 * @param  {[type]} req [description]
 * @param  {[type]} res [description]
 * @return {[type]}     [description]
 */
function getLayerDataListByLayerId(req, res) {
    var query = req.body;
  
    try {
        var layerId = query.layerId || "";

        if (check.isNull(layerId)) {
            res.json({
                "code": 401,
                "data": {
                    "status": "fail",
                    "error": "请求参数无效"
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

                getTableNameByLayerId(layerId, function(resJson){
                    if (resJson.code == 200) {
                        var tableName = resJson.data.tableName;

                        getLayerDataList(tableName, query, userId, function(ret){
                            //Log.insertLog(userId, req.url, "get Layer Data List");
                            res.json(ret);
                        });

                    } else {
                        res.json(resJson);
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
 * 图层数据获取操作
 * @param  {[type]}   tableName [description]
 * @param  {[type]}   query     [description]
 * @param  {[type]}   userId    [description]
 * @param  {Function} callback  [description]
 * @return {[type]}             [description]
 */
function getLayerDataList(tableName, query, userId, callback) {
    var ret = {};

    var sql = "select count(*) as total from " + tableName;
    var dataArr = [];
    db.query(sql, dataArr, function(err, rows) {
        if (err) {
            ret = {
                "code": 501,
                "data": {
                    "status": "fail",
                    "error": err.message
                }
            };
            callback(ret);
        } else {
          
            var total = rows[0].total;
            var page = query.page || 1;
            var pageSize = query.pageSize || 20;
          
            if (page < 1 && page != -1) {
                page = 1;
            }
            var start = (page - 1) * pageSize;
          
            if (-1 == page) {
                sql = "select * from " + tableName;
                pageSize = total;
                dataArr = [];
            } else {
                sql = "select * from " + tableName + " order by id limit ?, ?";
                dataArr = [start, parseInt(pageSize)];
            }
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
                    //Log.insertLog(userId,"get layer data list", sql);
                    ret = {
                        "code": 200,
                        "data": {
                            "status": "success",
                            "error": "success",
                            "rows": rows,
                            "total": total,
                            "page": page,
                            "pageSize": pageSize
                        }
                    };
                }
                callback(ret);
            });
        }
    });
} 

/**
 * 编辑图层数据信息
 * @param  {[type]} req [description]
 * @param  {[type]} res [description]
 * @return {[type]}     [description]
 */
function editLayerData(req, res) {
    var query = req.body;
    try {

        var layerId = query.layerId || "";
        var layerDataId = query.layerDataId || "";
        var locLan = query.locLan || "";
        var locLon = query.locLon || "";

        if (check.isNull(layerId) || check.isNull(locLan) || check.isNull(locLan) || check.isNull(layerDataId)) {
            res.json({
                "code": 401,
                "data": {
                    "status": "fail",
                    "error": "请求参数无效"
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

                getTableNameByLayerId(layerId, function(resJson){
                    if (resJson.code == 200) {
                        var tableName = resJson.data.tableName;

                        var curtime = new Date().getTime();
                        var extData = query.extData || "";

                        extData = JSON.parse(extData);

                        updateLayerData(layerId, layerDataId, tableName, locLan, locLon, userId, curtime, extData, function(ret){
                            Log.insertLog(userId, "编辑图层数据", "update Layer Data");
                            res.json(ret);
                        });

                    } else {
                        res.json(resJson);
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
 * 更新图层数据操作
 * @param  {[type]}   layerId     [description]
 * @param  {[type]}   layerDataId [description]
 * @param  {[type]}   tableName   [description]
 * @param  {[type]}   locLan      [description]
 * @param  {[type]}   locLon      [description]
 * @param  {[type]}   userId      [description]
 * @param  {[type]}   curtime     [description]
 * @param  {[type]}   extData     [description]
 * @param  {Function} callback    [description]
 * @return {[type]}               [description]
 */
function updateLayerData(layerId, layerDataId, tableName, locLan, locLon, userId, curtime, extData, callback) {
    ret = {};

    var sql = "select ext_name from " + LayerExtTable + " where layer_id = ?";
    var dataArr = [layerId];
    db.query(sql, dataArr, function(err,rows){
        if (err) {
            ret = {"code": 501, "data": {"status": "fail","error": err.message}};
            callback(ret);
        } else {
            sql = "update " + tableName + " set loc_lon=?, loc_lan=?,uptime=?";
            dataArr = [locLon, locLan, curtime];

            for(var i=0; i<rows.length; i++){
                if(!check.isNull(extData[rows[i].ext_name])){
                    sql += ", " + rows[i].ext_name + " = ? ";
                    dataArr.push(extData[rows[i].ext_name])
                }
            }
            sql += " where id = ?";
            dataArr.push(layerDataId);

            //Log.insertLog(userId, "update layer data", sql);

            db.query(sql, dataArr, function(mmErr, mmRows){
                if (mmErr) {
                    ret = {"code": 501, "data": {"status": "fail","error": mmErr.message}};
                } else {
                    ret = {"code": 200, "data": {"status": "success", "error": "success"}};
                }
                callback(ret);
            });      
        }
    });
}


exports.addLayerData = addLayerData;
exports.delLayerData = delLayerData;
exports.editLayerData = editLayerData;
exports.getLayerDataListByLayerId = getLayerDataListByLayerId;