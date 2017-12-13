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

        if (check.isNull(layerName)) {
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

                createNewLayer(layerName, imgPath, userId, curtime, function(ret){
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
            callback(ret);
        } else {
            var layerId = rows.insertId;
            createNewLayerTable(layerId, tableName, userId, function(res){
                ret = res;
                callback(ret);
            });
        }
    });
}


/**
 * 新建图层数据表
 * @param  {[type]}   layerId   [description]
 * @param  {[type]}   tableName [description]
 * @param  {Function} callback  [description]
 * @return {[type]}             [description]
 */
function createNewLayerTable(layerId, tableName, userId, callback) {
    ret = {};
    var sql = "create table `" + tableName + "` (" +
                    "`id` int(32) not null auto_increment comment '图层数据id'," +
                    "`loc_lan` varchar(32) comment '纬度'," +
                    "`loc_lon` varchar(32) comment '经度'," +
                    "`user_id` int(32) comment '创建用户id'," +
                    "`addtime` varchar(32) comment '创建时间'," +
                    "`uptime` varchar(32) comment '更新时间'," +
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
                    "layerId": layerId
                }
            };
       }
       callback(ret);
    });
}


/**
 * 生成图层数据表名称
 * @param  {[type]} curtime [description]
 * @param  {[type]} userId  [description]
 * @return {[type]}         [description]
 */
function getTableName(curtime, userId) {
    var tableName = LayerTablePre + curtime + userId + getRandomNum(1, 10);

    return tableName;
}


/**
 * 生成随机数
 * @param  {[type]} Min [description]
 * @param  {[type]} Max [description]
 * @return {[type]}     [description]
 */
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
            callback(ret);
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
                    callback(ret);
                } else {
                    // 最后删除基础图层
                    sql = "delete from " + LayerBasicTable + " where layer_id = ?";
                    dataArr = [layerId];
                    Log.insertLog(userId, "delete layer", sql);
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

    });

}


/**
 * 添加图层数据表属性
 * @param {[type]} req [description]
 * @param {[type]} res [description]
 */
function addLayerAttr(req, res) {
    var query = req.body;
    try {

        var layerId = query.layerId || "";
        var extName = query.extName || "";

        if (check.isNull(layerId) || check.isNull(extName)) {
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
                var extDesc = query.extDesc || "";

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
                                        
                            addLayerTableAttr(layerId, tableName, extName, extDesc, userId, curtime, function(ret){
                                Log.insertLog(userId, req.url, "add Layer Attr");
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
 * 添加属性操作
 * @param {[type]}   layerId   [description]
 * @param {[type]}   tableName [description]
 * @param {[type]}   extName   [description]
 * @param {[type]}   extDesc   [description]
 * @param {[type]}   userId    [description]
 * @param {[type]}   curtime   [description]
 * @param {Function} callback  [description]
 */
function addLayerTableAttr(layerId, tableName, extName, extDesc, userId, curtime, callback){
    var ret = {};

    var sql = "alter table " + tableName + " add column " + extName + " varchar(255)";
    var dataArr = [];
    Log.insertLog(userId, "modify layer data table", sql);
    // 先修改图层数据表结构
    db.query(sql, dataArr, function(mErr, mRows) {
        if (err) {
            ret = {
                "code": 501,
                "data": {
                    "status": "fail",
                    "error": mErr.message
                }
            };
            callback(ret);
        } else {
            // 再写入图层属性表
            sql = "insert into " +  LayerExtTable + " (layer_id, ext_name, ext_desc, user_id, addtime) ";
            sql += "values(?, ?, ?, ?, ?)";
            dataArr = [layerId, extName, extDesc, userId, curtime];

            Log.insertLog(userId, "add new attr", sql);

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


/**
 * 分页获取图层列表
 * @param  {[type]} req [description]
 * @param  {[type]} res [description]
 * @return {[type]}     [description]
 */
function getLayerList(req, res) {
    var query = req.body;
  
    try {

        var mobile = query.mobile;
        var token = query.token;
        User.getUserInfo(mobile, token, function(user) {
            if (user.error == 0) {
                userInfo = user.data;
                var userId = userInfo.Id;
                
                var sql = "select count(*) as total from " + LayerBasicTable;
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
                        var page = query.page || 1;
                        var pageSize = query.pageSize || 20;
                      
                        if (page < 1 && page != -1) {
                            page = 1;
                        }
                        var start = (page - 1) * pageSize;
                      
                        if (-1 == page) {
                            sql = "select * from " + LayerBasicTable;
                            pageSize = total;
                            dataArr = [];
                        } else {
                            sql = "select * from " + LayerBasicTable + " order by layer_id limit ?, ?";
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
                                Log.insertLog(userId,"get layer list", sql);
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
 * 根据layerid获取图层所有属性
 * 
 * @param  {[type]} req [description]
 * @param  {[type]} res [description]
 * @return {[type]}     [description]
 */
function getLayerAttrByLayerId(req, res) {
    var query = req.body;
    try {

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

        var mobile = query.mobile;
        var token = query.token;
        User.getUserInfo(mobile, token, function(user) {
            if (user.error == 0) {
                userInfo = user.data;

                var sql = "select * from " + LayerExtTable + " where layer_id = ? order by ext_id";
                var dataArr = [layerId];
                
                Log.insertLog(userId,"get layer attr", sql);

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
                                "layerId": layerId,
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


/**
 * 编辑图层信息
 * @param  {[type]} req [description]
 * @param  {[type]} res [description]
 * @return {[type]}     [description]
 */
function editLayer(req, res) {
    var query = req.body;
    try {

        var layerId = query.layerId || "";
        var layerName = query.layerName || "";

        if (check.isNull(layerId) || check.isNull(layerName)) {
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
                
                var imgPath = query.imgPath || "";

                updateLayer(layerId, layerName, imgPath, userId, function(ret){
                    Log.insertLog(userId, req.url, "update Basic Layer");
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
 * 更新图层基本信息
 * @param  {[type]}   layerId   [description]
 * @param  {[type]}   layerName [description]
 * @param  {[type]}   imgPath   [description]
 * @param  {[type]}   userId    [description]
 * @param  {Function} callback  [description]
 * @return {[type]}             [description]
 */
function updateLayer(layerId, layerName, imgPath, userId, callback) {
    ret = {};
    var sql = "update " + LayerBasicTable + " set layer_name = ?, img_path = ? ";
    sql += " where layer_id = ?";
    var dataArr = [layerName, imgPath, layerId];

    Log.insertLog(userId, "update layer table", sql);

    db.query(sql, dataArr, function(mErr, mRows) {
       if (mErr) {
            ret = {"code": 501, "data": {"status": "fail", "error": mErr.message}};
        } else {
            ret = {
                "code": 200,
                "data": {
                    "status": "success",
                    "error": "success",
                    "layerId": layerId
                }
            };
        }
        callback(ret);
    });
}


/**
 * 编辑图层数据字段
 * @param  {[type]} req [description]
 * @param  {[type]} res [description]
 * @return {[type]}     [description]
 */
function editLayerAttr(req, res) {
    var query = req.body;
    try {

        var extId = query.extId || "";
        var extName = query.extName || "";

        if (check.isNull(extId) || check.isNull(extName)) {
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

                var sql = "select a.table_name, a.layer_id, b.ext_name from " + LayerBasicTable + " a ";
                sql += "inner join " + LayerExtTable + " b on a.layer_id = b.layer_id ";
                sql += "where b.ext_id = ?";
                var dataArr = [extId];
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
                            var oldExtName = rows[0].ext_name;
                            var layerId = rows[0].layer_id;

                            var extDesc = query.extDesc || "";

                            updateLayerAttr(layerId, extId, tableName, oldExtName, extName, extDesc, userId, curtime, function(ret){
                                Log.insertLog(userId, req.url, "update Layer attr");
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
 * 更新图层数据表结构和图层属性表
 * @param  {[type]}   layerId    [description]
 * @param  {[type]}   extId      [description]
 * @param  {[type]}   tableName  [description]
 * @param  {[type]}   oldExtName [description]
 * @param  {[type]}   extName    [description]
 * @param  {[type]}   extDesc    [description]
 * @param  {[type]}   userId     [description]
 * @param  {[type]}   curtime    [description]
 * @param  {Function} callback   [description]
 * @return {[type]}              [description]
 */
function updateLayerAttr(layerId, extId, tableName, oldExtName, extName, extDesc, userId, curtime, callback) {
    var ret = {};

    var sql = "alter table " + tableName + " change column " + oldExtName + " " + extName + " varchar(255)";
    var dataArr = [];
    Log.insertLog(userId, "modify layer data table", sql);
    // 先修改图层数据表结构
    db.query(sql, dataArr, function(mErr, mRows) {
        if (err) {
            ret = {
                "code": 501,
                "data": {
                    "status": "fail",
                    "error": mErr.message
                }
            };
            callback(ret);
        } else {
            // 再修改图层属性表
            sql = "update  " +  LayerExtTable + " set ext_name = ?, ext_desc = ? where ext_id = ?";
            dataArr = [extName, extDesc, extId];

            Log.insertLog(userId, "update layer attr", sql);

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


/**
 * 删除图层属性
 * @param  {[type]} req [description]
 * @param  {[type]} res [description]
 * @return {[type]}     [description]
 */
function delLayerAttr(req, res) {
    var query = req.body;
    try {

        var extId = query.extId || "";

        if (check.isNull(extId)) {
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
                
                var sql = "select a.table_name, a.layer_id, b.ext_name from " + LayerBasicTable + " a ";
                sql += "inner join " + LayerExtTable + " b on a.layer_id = b.layer_id ";
                sql += "where b.ext_id = ?";
                var dataArr = [extId];
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
                            var extName = rows[0].ext_name;
                            var layerId = rows[0].layer_id;

                            doDelLayerAttr(layerId, extId, tableName, extName, userId, function(ret){
                                Log.insertLog(userId, req.url, "del Layer attr");
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
 * 删除图层数据表字段，以及删除图层属性字段记录
 * @param  {[type]}   layerId   [description]
 * @param  {[type]}   extId     [description]
 * @param  {[type]}   tableName [description]
 * @param  {[type]}   extName   [description]
 * @param  {[type]}   userId    [description]
 * @param  {Function} callback  [description]
 * @return {[type]}             [description]
 */
function doDelLayerAttr(layerId, extId, tableName, extName, userId, callback) {
    var ret = {};

    var sql = "alter table " + tableName + " drop column " + extName;
    var dataArr = [];
    Log.insertLog(userId, "del layer data table", sql);
    // 先修改图层数据表结构
    db.query(sql, dataArr, function(mErr, mRows) {
        if (err) {
            ret = {
                "code": 501,
                "data": {
                    "status": "fail",
                    "error": mErr.message
                }
            };
            callback(ret);
        } else {
            // 再删除图层属性表记录
            sql = "delte from " +  LayerExtTable + " where ext_id = ?";
            dataArr = [extId];

            Log.insertLog(userId, "delte layer attr", sql);

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


exports.addLayer = addLayer;
exports.delLayer = delLayer;
exports.addLayerAttr = addLayerAttr;
exports.getLayerList = getLayerList;
exports.getLayerAttrByLayerId = getLayerAttrByLayerId;
exports.editLayer = editLayer;
exports.editLayerAttr = editLayerAttr;
exports.delLayerAttr = delLayerAttr;