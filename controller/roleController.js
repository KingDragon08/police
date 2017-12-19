 var db = require("../lib/db");
var check = require("../lib/check");
var User = require("./userController");
var roleActionController = require("./roleActionController.js");
var Log = require('./logController')
// --
// -- Table structure for table `role`
// --
// DROP TABLE IF EXISTS `role`;
// CREATE TABLE `role` (
//   `role_id` int(32) NOT NULL AUTO_INCREMENT comment '角色id',
//   `role_name` varchar(32) NOT NULL comment '角色名称',
//   `addtime` varchar(32) comment '创建时间戳',
//   PRIMARY KEY (`role_id`)
// ) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8;
/**
 * 添加角色
 * @param {[type]} req [description]
 * @param {[type]} res [description]
 */
function addRole(req, res) {
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
                        var roleName = query.roleName || '';
                        if (check.isNull(roleName)) {
                            res.json({
                                "code": 401,
                                "data": {
                                    "status": "fail",
                                    "error": "角色名称为空"
                                }
                            });
                            return;
                        }
                        var sql = "select * from role where role_name = ?";
                        var dataArr = [roleName]
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
                                            "error": "角色已存在"
                                        }
                                    });
                                    return;
                                } else {
                                    var curtime = new Date().getTime();
                                    sql = "insert into role (role_name, addtime) ";
                                    sql += "values(?, ?)";
                                    var dataArr = [roleName, curtime];
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
                                        Log.insertLog(mobile,"添加角色",sql);
                                        res.json({
                                            "code": 200,
                                            "data": {
                                                "status": "success",
                                                "error": "success",
                                                "role_id": rows.insertId
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
                                "error": "没有相关权限"
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
 * 删除角色
 * @param  {[type]} req [description]
 * @param  {[type]} res [description]
 * @return {[type]}     [description]
 */
function delRole(req, res) {
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
                        var roleId = query.roleId;
                        if (check.isNull(roleId)) {
                            res.json({
                                "code": 401,
                                "data": {
                                    "status": "fail",
                                    "error": "角色ID为空"
                                }
                            });
                            return;
                        }
                        var sql = "select count(*) as total from role where role_id = ?";
                        var dataArr = [roleId];
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
                                    sql = "delete from role where role_id = ?";
                                    dataArr = [roleId];
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
                                            Log.insertLog(mobile,"删除角色",sql);
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
                                            "error": "角色不存在"
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
                                "error": "没有相关权限"
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
 * 修改角色信息
 * @param  {[type]} req [description]
 * @param  {[type]} res [description]
 * @return {[type]}     [description]
 */
function editRole(req, res) {
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
                        var roleId = query.roleId || '';
                        if (check.isNull(roleId)) {
                            res.json({
                                "code": 401,
                                "data": {
                                    "status": "fail",
                                    "error": "角色ID为空"
                                }
                            });
                            return;
                        }
                        var roleName = query.roleName || '';
                        if (check.isNull(roleName)) {
                            res.json({
                                "code": 401,
                                "data": {
                                    "status": "fail",
                                    "error": "角色名称为空"
                                }
                            });
                            return;
                        }
                        var sql = "select count(*) as total from role where role_id = ?";
                        var dataArr = [roleId];
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
                                    sql = "select * from role where role_name = ?";
                                    dataArr = [roleName]
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
                                                        "error": "role exist"
                                                    }
                                                });
                                                return;
                                            } else {
                                                sql = "update role set role_name = ? where role_id = ?";
                                                dataArr = [roleName, roleId];
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
                                                        Log.insertLog(mobile,"修改角色信息",sql);
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
                                            "error": "角色不存在"
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
 * 获取角色列表
 * @param  {[type]} req [description]
 * @param  {[type]} res [description]
 * @return {[type]}     [description]
 */
function getRoleList(req, res) {
    var query = req.body;
    try {
        var mobile = query.mobile;
        var token = query.token;
        User.getUserInfo(mobile, token, function(user) {
            if (user.error == 0) {
                user_info = user.data;
                user_roleId = user.data.role_id;
                var userId = user_info.Id;
                roleActionController.checkUserPermission(req.url, userId, 'pc', function(permission) {
                    if (permission) {
                        var sql = "select count(*) as total from role";
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
                                    sql = "select * from role order by role_id";
                                    pageSize = total;
                                    dataArr = [];
                                } else {
                                    sql = "select * from role order by role_id limit ?, ?";
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
                                                "pageSize": pageSize,
                                                "user_role":user_roleId
                                            }
                                        });
                                    }
                                });
                            }
                        });
                    } else {
                        res.json({
                            "code": 501,
                            "data": {
                                "status": "fail",
                                "error": "没有相应权限"
                            }
                        });
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
exports.addRole = addRole;
exports.delRole = delRole;
exports.editRole = editRole;
exports.getRoleList = getRoleList;