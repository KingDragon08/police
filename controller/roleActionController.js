var db = require("../lib/db");
var check = require("../lib/check");
var User = require("./userController");
var Log = require('./logController')
// --
// -- Table structure for table `role_action`
// --
// DROP TABLE IF EXISTS `role_action`;
// CREATE TABLE `role_action` (
//   `id` int(32) NOT NULL AUTO_INCREMENT comment 'id',
//   `role_id` int(32) comment '角色id',
//   `action_id` int(32) comment '功能id',
//   `addtime` varchar(32) comment '创建时间戳',
//   PRIMARY KEY (`id`)
// ) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8;


/**
 * 添加角色操作
 * @param {[type]} req [description]
 * @param {[type]} res [description]
 */
function addRoleAction(req, res) {
    var query = req.body;
    try {
        var mobile = query.mobile;
        var token = query.token;
        User.getUserInfo(mobile, token, function(user) {
            if (user.error == 0) {
                user_info = user.data;
                var userId = user_info.Id;
                checkUserPermission(req.url, userId, 'pc', function(permission) {
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
                        var sql = "select * from role_action where role_id = ? and action_id = ?";
                        var dataArr = [roleId, actionId];
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
                                            "error": "角色权限已存在"
                                        }
                                    });
                                    return;
                                } else {
                                    var curtime = new Date().getTime();
                                    sql = "insert into role_action (role_id, action_id, addtime) ";
                                    sql += "values(?, ?, ?)";
                                    var dataArr = [roleId, actionId, curtime];
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
                                        Log.insertLog(mobile,"添加角色权限",sql);
                                        res.json({
                                            "code": 200,
                                            "data": {
                                                "status": "success",
                                                "error": "success",
                                                "roleaction_id": rows.insertId
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
 * 删除角色操作
 * @param  {[type]} req [description]
 * @param  {[type]} res [description]
 * @return {[type]}     [description]
 */
function delRoleAction(req, res) {
    var query = req.body;
    try {
        var mobile = query.mobile;
        var token = query.token;
        User.getUserInfo(mobile, token, function(user) {
            if (user.error == 0) {
                user_info = user.data;
                var userId = user_info.Id;
                checkUserPermission(req.url, userId, 'pc', function(permission) {
                    if (permission) {
                        var roleActionId = query.roleActionId;
                        // var actionId = query.actionId;
                        if (check.isNull(roleActionId)) {
                            res.json({
                                "code": 401,
                                "data": {
                                    "status": "fail",
                                    "error": "角色权限ID为空"
                                }
                            });
                            return;
                        }
                        var sql = "select count(*) as total from role_action where id = ?";
                        var dataArr = [roleActionId];
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
                                    sql = "delete from role_action where id = ?";
                                    dataArr = [roleActionId];
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
                                            Log.insertLog(mobile,"删除角色权限",sql);
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
                                            "error": "角色权限不存在"
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
 * 修改角色操作信息
 * @param  {[type]} req [description]
 * @param  {[type]} res [description]
 * @return {[type]}     [description]
 */
function editRoleAction(req, res) {
    var query = req.body;
    try {
        var mobile = query.mobile;
        var token = query.token;
        User.getUserInfo(mobile, token, function(user) {
            if (user.error == 0) {
                user_info = user.data;
                var userId = user_info.Id;
                checkUserPermission(req.url, userId, 'pc', function(permission) {
                    if (permission) {
                        var roleActionId = query.roleActionId || '';
                        if (check.isNull(roleActionId)) {
                            res.json({
                                "code": 401,
                                "data": {
                                    "status": "fail",
                                    "error": "角色权限ID为空"
                                }
                            });
                            return;
                        }
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
                        var sql = "select count(*) as total from role_action where id = ?";
                        var dataArr = [roleActionId];
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
                                    sql = "select * from role_action where id != ? and action_id = ? and role_id = ?";
                                    dataArr = [roleActionId, actionId, roleId];
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
                                                        "error": "角色权限已存在"
                                                    }
                                                });
                                                return;
                                            } else {
                                                sql = "update role_action set role_id = ?, action_id = ? where id = ?";
                                                dataArr = [roleId, actionId, roleActionId];
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
                                                        Log.insertLog(mobile,"修改角色权限",sql);
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
 * 获取角色操作列表
 * @param  {[type]} req [description]
 * @param  {[type]} res [description]
 * @return {[type]}     [description]
 */
function getRoleActionList(req, res) {
    var query = req.body;
    try {
        var mobile = query.mobile;
        var token = query.token;
        User.getUserInfo(mobile, token, function(user) {
            if (user.error == 0) {
                user_info = user.data;
                var userId = user_info.Id;
                checkUserPermission(req.url, userId, 'pc', function(permission) {
                    if (permission) {
                        var role_id = query.role_id || -1;
                        if(role_id==-1){
                            res.json({
                                "code": 403,
                                "data": {
                                    "status": "fail",
                                    "error": "参数错误"
                                }
                            });
                            return;
                        }
                        role_id = parseInt(role_id);
                        var sql = "select count(*) as total from role_action where role_id=?";
                        var dataArr = [role_id];
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
                                    sql = "select a.*,b.type_name as action_name from role_action a left join action_type b on a.action_id=b.id where a.role_id=? order by a.id";
                                    pageSize = total;
                                    dataArr = [role_id];
                                } else {
                                    sql = "select a.*,b.type_name as action_name from role_action a left join action_type b on a.action_id=b.id where a.role_id=? order by a.id limit ?, ?";
                                    dataArr = [role_id, start, pageSize];
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

/**
 * 配置角色权限
 * @param  {[type]} req [description]
 * @param  {[type]} res [description]
 * @return {[type]}     [description]
 */
function configRolePermissions(req, res) {
    var query = req.body;
    try {
        var mobile = query.mobile || -1;
        var token = query.token || -1;
        User.getUserInfo(mobile, token, function(user) {
            if (user.error == 0) {
                user_info = user.data;
                var userId = user_info.Id;
                checkUserPermission(req.url, userId, 'pc', function(permission) {
                    if (permission) {
                        var role_id = query.role_id || -1;
                        if(role_id==-1){
                            res.json({
                                "code": 403,
                                "data": {
                                    "status": "fail",
                                    "error": "参数错误"
                                }
                            });
                            return;
                        }
                        role_id = parseInt(role_id);
                        //权限配置数组
                        var config = query.config || -1;
                        if(config==-1){
                            res.json({
                                "code": 401,
                                "data": {
                                    "status": "fail",
                                    "error": "参数错误"
                                }
                            });
                            return;
                        }
                        config = JSON.parse(config);
                        for(let i=0; i<config.length; i++){
                            let action_type_id = config[i].action_type_id;
                            let action_type_check = config[i].action_type_check;
                            //选中
                            if(action_type_check==1){
                                addRoleActionNew(role_id, action_type_id);
                            }
                            if(action_type_check==0){
                                delRoleActionNew(role_id, action_type_id);
                            }
                        }
                        res.json({
                            "code": 200,
                            "data": {
                                "status": "success",
                                "error": "success"
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
 * 新版逻辑配置权限
 * @param role_id 角色id
 * @param action_type_id 权限id
 */
function addRoleActionNew(role_id, action_type_id){
    var sql = "select count(*) as total from role_action where role_id=? and action_id=?";
    var dataArr = [role_id, parseInt(action_type_id)];
    db.query(sql, dataArr,function(err, rows){
        if(err){
            return
        } else {
            //权限不存在则添加
            if(rows[0].total<1){
                sql = "insert into role_action(role_id, action_id, addtime)values(?, ?, ?)";
                dataArr = [role_id, parseInt(action_type_id), new Date().getTime()];
                db.query(sql, dataArr, function(err, result){});
            }
        }
    });
}

/**
 * 新版逻辑配置权限
 * @param role_id 角色id
 * @param action_type_id 权限id
 */
function delRoleActionNew(role_id, action_type_id){
    var sql = "select count(*) as total from role_action where role_id=? and action_id=?";
    var dataArr = [role_id, action_type_id];
    db.query(sql, dataArr,function(err, rows){
        if(err){
            return
        } else {
            //权限存在则删除
            if(rows[0].total>0){
                sql = "delete from role_action where role_id=? and action_id=?";
                dataArr = [role_id, parseInt(action_type_id)];
                db.query(sql, dataArr, function(err, result){});
            }
        }
    });
}


/**
 * 校验用户操作权限
 * 根据URL判断当前用户有无权限
 * 
 * @param  {[type]}   actionUrl [req.url]
 * @param  {[type]}   userId    [userId]
 * @param  {[type]}   userType  [pc|mobile]
 * @param  {Function} callback  [description]
 * @return {[type]}             [description]
 */
function checkUserPermission(actionUrl, userId, userType, callback) {
    var NOPERMISSION = false;
    var OKPERMISSION = true;
    try {
        var userTable = userType == 'pc' ? 'user' : 'mobileUser';
        var sql = "select ra.* ";
        sql += "from role_action ra, action a, action_type at, " + userTable + " u";
        sql += " where ra.role_id = u.role_id and ra.action_id = at.id and a.action_type=at.id ";
        sql += " and u.Id = ? and a.action_url = ?";
        var dataArr = [userId, actionUrl];
        db.query(sql, dataArr, function(err, rows) {
            if (err) {
                callback(NOPERMISSION);
            } else {
                if (rows.length > 0) {
                    callback(OKPERMISSION);
                } else {
                    callback(NOPERMISSION);
                }
            }
        });
    } catch (e) {
        callback(NOPERMISSION);
    }
}

/**
 * 校验用户操作权限
 * 根据URL判断当前用户有无权限
 * 
 * @param  {[type]}   actionUrl [req.url]
 * @param  {[type]}   userId    [userId]
 * @param  {[type]}   userType  [pc|mobile]
 * @param  {Function} callback  [description]
 * @return {[type]}             [description]
 */
function checkUserPermissionByMobile(actionUrl, mobile, userType, callback) {
    var NOPERMISSION = false;
    var OKPERMISSION = true;
    try {
        var userTable = userType == 'pc' ? 'user' : 'mobileUser';
        var sql = "select ra.* ";
        sql += "from role_action ra, action a, action_type at, " + userTable + " u";
        sql += " where ra.role_id = u.role_id and ra.action_id = at.id and a.action_type=at.id ";
        sql += " and u.mobile = ? and a.action_url = ?";
        var dataArr = [mobile, actionUrl];
        db.query(sql, dataArr, function(err, rows) {
            if (err) {
                callback(NOPERMISSION);
            } else {
                if (rows.length > 0) {
                    //更新用户的lastLoginTime
                    var timestamp = new Date().getTime();
                    db.query("update user set lastLoginTime=? where mobile=? and lastLoginTime>? ",
                                [timestamp,mobile,0],
                                function(err, result){
                                    callback(OKPERMISSION); 
                                });
                } else {
                    callback(NOPERMISSION);
                }
            }
        });
    } catch (e) {
        callback(NOPERMISSION);
    }
}


function permissionDenied(res){
    res.json({
        "code": 301,
        "data": {
            "status": "fail",
            "error": "没有相应权限"
        }
    });
}

exports.addRoleAction = addRoleAction;
exports.delRoleAction = delRoleAction;
exports.editRoleAction = editRoleAction;
exports.getRoleActionList = getRoleActionList;
exports.checkUserPermission = checkUserPermission;
exports.checkUserPermissionByMobile = checkUserPermissionByMobile;
exports.permissionDenied = permissionDenied;
exports.configRolePermissions = configRolePermissions;

