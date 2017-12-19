var db = require("../lib/db");
var check = require("../lib/check");
var User = require("./userController");
var roleActionController = require("./roleActionController");
var Log = require('./logController')
// --
// -- Table structure for table `action`
// --
// DROP TABLE IF EXISTS `action`;
// CREATE TABLE `action` (
//   `action_id` int(32) NOT NULL AUTO_INCREMENT comment '功能id',
//   `action_name` varchar(32) NOT NULL comment '功能名称',
//   `action_url` varchar(255) NOT NULL comment '功能url（唯一标识）',
//   `addtime` varchar(32) comment '创建时间戳',
//   PRIMARY KEY (`action_id`)
//   UNIQUE(`action_short_name`)
// ) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8;
/**
 * 添加操作
 * @param {[type]} req [description]
 * @param {[type]} res [description]
 */
function addAction(req, res) {
    var query = req.body;
    try {
        var mobile = query.mobile;
        var token = query.token;
        User.getUserInfo(mobile, token, function(user) {
            if (user.error == 0) {
                user_info = user.data;
                var userId = user_info.Id;
                roleActionController.checkUserPermission(req.url, userId, 'pc', function(permission) {
                    if (permission) {
                        var actionName = query.actionName || '';
                        if (check.isNull(actionName)) {
                            //Log.insertLog(mobile,"添加权限","actionName is null");
                            res.json({
                                "code": 401,
                                "data": {
                                    "status": "fail",
                                    "error": "权限名称为空"
                                }
                            });
                            return;
                        }
                        var actionUrl = query.actionUrl || '';
                        if (check.isNull(actionUrl)) {
                            //Log.insertLog(mobile,req.url,"actionUrl is null");
                            res.json({
                                "code": 401,
                                "data": {
                                    "status": "fail",
                                    "error": "权限url为空"
                                }
                            });
                            return;
                        }
                        var sql = "select * from action where action_name = ? or action_url = ?";
                        var dataArr = [actionName, actionUrl]
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
                                if (rows.length > 0) {
                                    res.json({
                                        "code": 402,
                                        "data": {
                                            "status": "fail",
                                            "error": "权限已存在"
                                        }
                                    });
                                    return;
                                } else {
                                    var curtime = new Date().getTime();
                                    sql = "insert into action (action_name, action_url, addtime) ";
                                    sql += "values(?, ?, ?)";
                                    var dataArr = [actionName, actionUrl, curtime];
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
                                        Log.insertLog(mobile,"添加权限",sql);
                                        res.json({
                                            "code": 200,
                                            "data": {
                                                "status": "success",
                                                "error": "success",
                                                "action_id": rows.insertId
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
                                "error": "没有相应权限"
                            }
                        });
                        return;
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
 * 删除操作
 * @param  {[type]} req [description]
 * @param  {[type]} res [description]
 * @return {[type]}     [description]
 */
function delAction(req, res) {
    var query = req.body;
    try {
        var mobile = query.mobile;
        var token = query.token;
        User.getUserInfo(mobile, token, function(user) {
            if (user.error == 0) {
                user_info = user.data;
                var actionId = query.actionId;
                if (check.isNull(actionId)) {
                    res.json({
                        "code": 401,
                        "data": {
                            "status": "fail",
                            "error": "权限ID为空"
                        }
                    });
                    return;
                }
                var userId = user_info.Id;
                roleActionController.checkUserPermission(req.url, userId, 'pc', function(permission) {
                    if (permission) {
                        var sql = "select count(*) as total from action where action_id = ?";
                        var dataArr = [actionId];
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
                                    sql = "delete from action where action_id = ?";
                                    dataArr = [actionId];
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
                                            Log.insertLog(mobile,"删除权限",sql);
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
                                            "error": "权限不存在"
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
                                "error": "没有相应权限"
                            }
                        });
                        return;
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
 * 修改操作信息
 * @param  {[type]} req [description]
 * @param  {[type]} res [description]
 * @return {[type]}     [description]
 */
function editAction(req, res) {
    var query = req.body;
    try {
        var mobile = query.mobile;
        var token = query.token;
        User.getUserInfo(mobile, token, function(user) {
            if (user.error == 0) {
                user_info = user.data;
                var actionId = query.actionId || '';
                if (check.isNull(actionId)) {
                    res.json({
                        "code": 401,
                        "data": {
                            "status": "fail",
                            "error": "权限ID为空"
                        }
                    });
                    return;
                }
                var actionName = query.actionName || '';
                if (check.isNull(actionName)) {
                    res.json({
                        "code": 401,
                        "data": {
                            "status": "fail",
                            "error": "权限名称不能为空"
                        }
                    });
                    return;
                }
                var actionUrl = query.actionUrl || '';
                if (check.isNull(actionUrl)) {
                    res.json({
                        "code": 401,
                        "data": {
                            "status": "fail",
                            "error": "权限url为空"
                        }
                    });
                    return;
                }
                var userId = user_info.Id;
                roleActionController.checkUserPermission(req.url, userId, 'pc', function(permission) {
                    if (permission) {
                        var sql = "select count(*) as total from action where action_id = ?";
                        var dataArr = [actionId];
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
                                    sql = "select * from action where action_id != ? and (action_name = ? or action_url = ?)";
                                    dataArr = [actionId, actionName, actionUrl];
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
                                            if (rows.length > 0) {
                                                res.json({
                                                    "code": 402,
                                                    "data": {
                                                        "status": "fail",
                                                        "error": "权限已存在"
                                                    }
                                                });
                                                return;
                                            } else {
                                                sql = "update action set action_name = ?, action_url = ? where action_id = ?";
                                                dataArr = [actionName, actionUrl, actionId];
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
                                                        Log.insertLog(mobile,"修改权限",sql);
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
                                        }
                                    });
                                } else {
                                    res.json({
                                        "code": 404,
                                        "data": {
                                            "status": "fail",
                                            "error": "权限不存在"
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
                                "error": "没有相应权限"
                            }
                        });
                        return;
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
 * 获取操作列表
 * @param  {[type]} req [description]
 * @param  {[type]} res [description]
 * @return {[type]}     [description]
 */
function getActionList(req, res) {
    var query = req.body;
    try {
        var mobile = query.mobile;
        var token = query.token;
        User.getUserInfo(mobile, token, function(user) {
            if (user.error == 0) {
                user_info = user.data;
                var userId = user_info.Id;
                roleActionController.checkUserPermission(req.url, userId, 'pc', function(permission) {
                    if (permission) {
                        var sql = "select count(*) as total from action";
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
                                    sql = "select * from action order by action_id";
                                    pageSize = total;
                                    dataArr = [];
                                } else {
                                    sql = "select * from action order by action_id limit ?, ?";
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
                    } else {
                        res.json({
                            "code": 301,
                            "data": {
                                "status": "fail",
                                "error": "没有相应权限"
                            }
                        });
                        return;
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
exports.addAction = addAction;
exports.delAction = delAction;
exports.editAction = editAction;
exports.getActionList = getActionList;