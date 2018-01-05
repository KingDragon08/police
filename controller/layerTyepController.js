var db = require("../lib/db");
var check = require("../lib/check");
var User = require("./userController");
var Log = require('./logController')

var LayerBasicTable = "layer_basic";
var LayerExtTable = "layer_ext";
var LayerTablePre = "layer_table_";
var LayerTypeTable = "layer_type";

// create table `layer_type`(
//     `type_id` int(32) not null auto_increment comment '图层类型id',
//     `type_name` varchar(32) comment '类型名称',
//     `user_id` int(32) comment '创建用户id',
//     `addtime` varchar(32) comment '创建时间',
//     primary key (`type_id`)
// ) default charset=utf8 comment '图层类型表';



/**
 * 添加图层类型
 * @param {[type]} req [description]
 * @param {[type]} res [description]
 */
function addLayerType(req, res) {
    var query = req.body;
    try {

        var typeName = query.typeName || "";
        if (check.isNull(typeName)) {
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

                var curtime = new Date().getTime();

                doAddLayerType(typeName, userId, curtime, function(ret){
                    Log.insertLog(userId, "添加图层类型", "add Layer Type");
                    res.json(ret);
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
 * 执行添加图层类型
 * @param  {[type]}   typeName [description]
 * @param  {[type]}   userId   [description]
 * @param  {[type]}   curtime  [description]
 * @param  {Function} callback [description]
 * @return {[type]}            [description]
 */
function doAddLayerType(typeName, userId, curtime, callback){
    ret = {};

    var sql = "select count(*) as total from " + LayerTypeTable + " where type_name = ?";
    var dataArr = [typeName];
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
                if (rows[0].total > 0) {
                    ret = {"code": 404, data: {"status":"fail", "error": "layer type exist"}};
                    callback(ret);
                } else {
                    sql = "insert into " + LayerTypeTable + " (type_name, user_id, addtime) values (?, ?, ?)";
                    dataArr = [typeName, userId, curtime];

                    //Log.insertLog(userId, "add Layer Type", sql);

                    db.query(sql,dataArr,function(err,rows){
                        if(err){
                            ret = {
                                "code": 501,
                                "data": {
                                    "status": "fail",
                                    "error": err.message
                                }
                            };
                        } else {
                                ret = {
                                    "code": 200,
                                    "data": {
                                        "status": "success",
                                        "error": "success",
                                        "layerTypeId": rows.insertId
                                    }
                                };
                        }
                        callback(ret);
                    });
                }
            }
        });
}


/**
 * 删除图层类型
 * 
 * @param  {[type]} req [description]
 * @param  {[type]} res [description]
 * @return {[type]}     [description]
 */
function delLayerType(req, res) {
    var query = req.body;
    try {

        var layerTypeId = query.layerTypeId || "";
        if (check.isNull(layerTypeId)) {
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

                getLayerTableListByTypeId(layerTypeId, function(resJson){
                    if (resJson.code == 200) {
                        var tableNameList = resJson.data.rows;

                        doDelLayerType(userId, tableNameList, layerTypeId, function(ret){
                                Log.insertLog(userId, "删除图层类型", "del Layer Type");
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
 * 根据图层类型ID获取所有图层数据表列表
 * 
 * @param  {[type]}   typeId   [description]
 * @param  {Function} callback [description]
 * @return {[type]}            [description]
 */
function getLayerTableListByTypeId(typeId, callback) {
    var ret = {};

    var sql = "select table_name from " + LayerBasicTable + " where type_id = ?";
    var dataArr = [typeId];
    db.query(sql, dataArr, function(err,rows){
        if(err){
            ret = {
                "code": 501,
                "data": {
                    "status": "fail",
                    "error": err.message
                }
            };
        } else {
            ret = {
                "code": 200,
                "data": {
                    "status": "success",
                    "error": "success",
                    "rows": rows
                }
            };
        }
        callback(ret);
    });

}

/**
 * 执行删除图层数据操作
 * @param  {[type]}   userId      [description]
 * @param  {[type]}   tableName   [description]
 * @param  {[type]}   layerDataId [description]
 * @param  {Function} callback    [description]
 * @return {[type]}               [description]
 */
function doDelLayerType(userId, tableNameList, layerTypeId, callback) {
    var ret = {};

    // 先删除图层数据表
    var sql = "";
    if (tableNameList.length > 0) {
        var tableName = tableNameList[0]["table_name"] || "";
        if (!check.isNull(tableName)) {
            sql = "drop table `" + tableName + "`";
        }
        for (var i = 1; i < tableNameList.length; i++) {
            var tableName = tableNameList[i]["table_name"] || "";
            if (!check.isNull(tableName)) {
                sql += ", `" + tableName + "`";
            }
        }
        var dataArr = [];
        //Log.insertLog(userId, "del layer data table", sql);
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
                console.log(rows);
                delLayerandExt(userId, layerTypeId, function(resJson){
                    callback(resJson);
                });
            }
        });
    } else {
        delLayerandExt(userId, layerTypeId, function(resJson){
            callback(resJson);
        });
    }
}

/**
 * 先删除图层额外属性记录
 * 再删除图层记录
 * 最后删除图层类型记录
 * @param  {[type]}   userId      [description]
 * @param  {[type]}   layerTypeId [description]
 * @param  {Function} callback    [description]
 * @return {[type]}               [description]
 */
function delLayerandExt(userId, layerTypeId, callback) {
    var ret = {};
    // 删除图层额外属性
    sql = "delete from " + LayerExtTable + " where layer_id in ";
    sql += "(select layer_id from " + LayerBasicTable + " where type_id = ?)";
    dataArr = [layerTypeId];

    Log.insertLog(userId, "del layer ext attr", sql);

    db.query(sql, dataArr, function(mErr, mRows){
        if (mErr) {
            ret = {"code": 501, "data": {"status": "fail", "error": mErr.message}};
            callback(ret);
        } else {
            // 删除图层
            sql = "delete from " + LayerBasicTable + " where type_id = ? ";
            dataArr = [layerTypeId];
            
            Log.insertLog(userId, "del layer", sql);

            db.query(sql, dataArr, function(mmErr, mmRows){
                if (mmErr) {
                    ret = {"code": 501, "data": {"status": "fail", "error": mErr.message}};
                    callback(ret);
                } else {
                    sql = "delete from " + LayerTypeTable + " where type_id = ?";
                    dataArr = [layerTypeId]; 

                    Log.insertLog(userId, "del layer type", sql);

                    db.query(sql, dataArr, function(mmmErr, mmmRows){
                        if (mmmErr) {
                            ret = {"code": 501, "data": {"status": "fail", "error": mErr.message}};
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
 * 分页获取图层类型
 * @param  {[type]} req [description]
 * @param  {[type]} res [description]
 * @return {[type]}     [description]
 */
function getLayerTypeList(req, res) {
    var query = req.body;
  
    try {
        var mobile = query.mobile;
        var token = query.token;
        User.getUserInfo(mobile, token, function(user) {
            if (user.error == 0) {
                userInfo = user.data;
                var userId = userInfo.Id;

                doGetLayerTypeList(query, userId, function(ret){
                    //Log.insertLog(userId, req.url, "get Layer Type List");
                    res.json(ret);
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
 * 图层类型获取操作
 * @param  {[type]}   query     [description]
 * @param  {[type]}   userId    [description]
 * @param  {Function} callback  [description]
 * @return {[type]}             [description]
 */
function doGetLayerTypeList(query, userId, callback) {
    var ret = {};

    var sql = "select count(*) as total from " + LayerTypeTable;
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
                sql = "select LT.*,LB.img_path from " + LayerTypeTable + " LT left join " + 
                        LayerBasicTable + " LB on LB.type_id=LT.type_id group by LT.type_id";
                pageSize = total;
                dataArr = [];
            } else {
                sql = "select LT.*,LB.img_path from " + LayerTypeTable + " LT left join " +
                        LayerBasicTable + " LB on LB.type_id=LT.type_id group by LT.type_id " + 
                        "order by LB.type_id limit ?, ?";
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
                    //Log.insertLog(userId,"get layer type list", sql);
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
 * 编辑图层类型信息
 * @param  {[type]} req [description]
 * @param  {[type]} res [description]
 * @return {[type]}     [description]
 */
function editLayerType(req, res) {
    var query = req.body;
    try {

        var layerTypeId = query.layerTypeId || "";
        var layerTypeName = query.layerTypeName || "";

        if (check.isNull(layerTypeId) || check.isNull(layerTypeName)) {
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

                updateLayerType(layerTypeId, layerTypeName, userId, function(ret){
                    Log.insertLog(userId, "编辑图层信息", "update Layer Type");
                    res.json(ret);
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
 * 更新图层类型操作
 * @param  {[type]}   layerTypeId   [description]
 * @param  {[type]}   layerTypeName [description]
 * @param  {[type]}   userId        [description]
 * @param  {Function} callback      [description]
 * @return {[type]}                 [description]
 */
function updateLayerType(layerTypeId, layerTypeName, userId, callback) {
    ret = {};

    var sql = "select count(*) as total from " + LayerTypeTable + " where type_name = ?";
    var dataArr = [layerTypeName];
    db.query(sql, dataArr, function(err,rows){
        if (err) {
            ret = {"code": 501, "data": {"status": "fail","error": err.message}};
            callback(ret);
        } else {
            if (rows[0].total > 0) {
                ret = {"code": 404, data: {"status":"fail", "error": "layer type exist"}};
                callback(ret);
            } else {
                sql = "update " + LayerTypeTable + " set type_name = ? where type_id = ?";
                dataArr = [layerTypeId];

                //Log.insertLog(userId, "update layer type", sql);

                db.query(sql, dataArr, function(mErr, mRows){
                    if (mErr) {
                        ret = {"code": 501, "data": {"status": "fail","error": mErr.message}};
                    } else {
                        ret = {"code": 200, "data": {"status": "success", "error": "success"}};
                    }
                    callback(ret);
                });
            }
        }
    });
}

//根据图层类型获取图层列表
function getLayersByTypeId(req,res){
    var query = req.body;
    try {
        var mobile = query.mobile;
        var token = query.token;
        User.getUserInfo(mobile, token, function(user) {
            if (user.error == 0) {
                userInfo = user.data;
                var userId = userInfo.Id;
                var layerTypeId = query.layerTypeId || "";
                if (check.isNull(layerTypeId)) {
                    res.json({
                        "code": 401,
                        "data": {
                            "status": "fail",
                            "error": "请求参数无效"
                        }
                    });
                    return;
                }
                layerTypeId = parseInt(layerTypeId);
                var sql = "select count(*) as total from " + LayerBasicTable + " where type_id=?";
                var dataArr = [layerTypeId];
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
                            sql = "select * from " + LayerBasicTable + " where type_id=?";
                            pageSize = total;
                            dataArr = [layerTypeId];
                        } else {
                            sql = "select * from " + LayerBasicTable + " where type_id=? order by layer_id limit ?, ?";
                            dataArr = [layerTypeId, start, parseInt(pageSize)];
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
            }
        });
    } catch(e) {
        res.json({
            "code": 500,
            "data": {
                "status": "fail",
                "error": e.message
            }
        });
    }
}


exports.addLayerType = addLayerType;
exports.delLayerType = delLayerType;
exports.editLayerType = editLayerType;
exports.getLayerTypeList = getLayerTypeList;
exports.getLayersByTypeId = getLayersByTypeId;


