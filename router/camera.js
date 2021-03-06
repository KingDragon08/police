var server = global.server
var camera = require('../controller/cameraController')
var CameraFB = require('../controller/cameraFeedController')

var transfer = require("../lib/transfer");
var permission = require("../controller/roleActionController")
// 测试参数
// server.get("/camera/getParams",function(req,res,next){
// 	res.setHeader("Access-Control-Allow-Origin","*");
// 	camera.getParams(req,res);
// 	return next();
// });
// server.post("/camera/getParams",function(req,res,next){
// 	res.setHeader("Access-Control-Allow-Origin","*");
// 	camera.getParams(req,res);
// 	return next();
// });

// 添加摄像头
server.post("/camera/add",function(req,res,next){
	res.setHeader("Access-Control-Allow-Origin","*");
	try{
		var mobile = req.body.mobile || -1;
		permission.checkUserPermissionByMobile(req.url, mobile, 'pc', function(hasPermission){
			if(hasPermission){
				camera.addCamera(req,res);
			} else {
				permission.permissionDenied(res);
			}
		});
	} catch(e) {
		permission.permissionDenied(res);
	}
	return next();
});


// 删除摄像头
server.post("/camera/del",function(req,res,next){
	res.setHeader("Access-Control-Allow-Origin","*");
	try{
		var mobile = req.body.mobile || -1;
		permission.checkUserPermissionByMobile(req.url, mobile, 'pc', function(hasPermission){
			if(hasPermission){
				camera.delCamera(req,res);
			} else {
				permission.permissionDenied(res);
			}
		});
	} catch(e) {
		permission.permissionDenied(res);
	}
	return next();
});

// 编辑摄像头信息
server.post("/camera/edit",function(req,res,next){
	res.setHeader("Access-Control-Allow-Origin","*");
	try{
		var mobile = req.body.mobile || -1;
		permission.checkUserPermissionByMobile(req.url, mobile, 'pc', function(hasPermission){
			if(hasPermission){
				camera.editCamera(req,res);
			} else {
				permission.permissionDenied(res);
			}
		});
	} catch(e) {
		permission.permissionDenied(res);
	}
	return next();
});

// 获取摄像头列表
server.post("/camera/list",function(req,res,next){
	res.setHeader("Access-Control-Allow-Origin","*");
	try{
		var mobile = req.body.mobile || -1;
		permission.checkUserPermissionByMobile(req.url, mobile, 'pc', function(hasPermission){
		//	console.log(hasPermission);
			if(hasPermission){
				camera.getCameraList(req,res);			
			} else {
				permission.permissionDenied(res);
			}
		});
	} catch(e) {
		permission.permissionDenied(res);
	}
	// transfer.ajax("/camera/list",0,req.body);
	return next();
});

// 指定字段获取摄像头列表
server.post("/camera/pclistbyattr",function(req,res,next){
	res.setHeader("Access-Control-Allow-Origin","*");
	try{
		var mobile = req.body.mobile || -1;
		permission.checkUserPermissionByMobile(req.url, mobile, 'pc', function(hasPermission){
			if(hasPermission){
				camera.getCameraListByAttr(req,res);
			} else {
				permission.permissionDenied(res);
			}
		});
	} catch(e) {
		permission.permissionDenied(res);
	}
	return next();
});

// 根据类型获取摄像头列表
// server.post("/camera/pclistbyattr",function(req,res,next){
// 	res.setHeader("Access-Control-Allow-Origin","*");
// 	try{
// 		var mobile = req.body.mobile || -1;
// 		permission.checkUserPermissionByMobile(req.url, mobile, 'pc', function(hasPermission){
// 			if(hasPermission){
// 				camera.getCameraListByAttr(req,res);
// 			} else {
// 				permission.permissionDenied(res);
// 			}
// 		});
// 	} catch(e) {
// 		permission.permissionDenied(res);
// 	}
// 	return next();
// });

// 获取单个摄像头信息
server.post("/camera/info",function(req,res,next){
	res.setHeader("Access-Control-Allow-Origin","*");
	try{
		var mobile = req.body.mobile || -1;
		permission.checkUserPermissionByMobile(req.url, mobile, 'pc', function(hasPermission){
			if(hasPermission){
				camera.getCameraInfo(req,res);
			} else {
				permission.permissionDenied(res);
			}
		});
	} catch(e) {
		permission.permissionDenied(res);
	}
	return next();
});

// 根据经纬度查找摄像头
// server.post("/camera/search",function(req,res,next){
// 	res.setHeader("Access-Control-Allow-Origin","*");
// 	camera.searchCamera(req,res);
// 	return next();
// });

// 添加摄像头周边信息反馈
server.post("/camera/feedback",function(req,res,next){
	res.setHeader("Access-Control-Allow-Origin","*");
	try{
		var mobile = req.body.mobile || -1;
		permission.checkUserPermissionByMobile(req.url, mobile, 'pc', function(hasPermission){
			if(hasPermission){
				CameraFB.addFeedBack(req,res);
			} else {
				permission.permissionDenied(res);
			}
		});
	} catch(e) {
		permission.permissionDenied(res);
	}
	return next();
});

// 获取摄像头自己反馈信息列表
server.post("/camera/fbselflist",function(req,res,next){
	res.setHeader("Access-Control-Allow-Origin","*");
	CameraFB.getSelfFeedBackList(req,res);
	return next();
});

// pc端获取摄像头反馈信息列表
server.post("/camera/pccamfblist",function(req,res,next){
	res.setHeader("Access-Control-Allow-Origin","*");
	try{
		var mobile = req.body.mobile || -1;
		permission.checkUserPermissionByMobile(req.url, mobile, 'pc', function(hasPermission){
			if(hasPermission){
				CameraFB.getFeedBackListByCamIdFromPc(req,res);
			} else {
				permission.permissionDenied(res);
			}
		});
	} catch(e) {
		permission.permissionDenied(res);
	}
	return next();
});


/********************************KingDragon*************************************/


//获取摄像头属性及其描述
server.post("/camera/getCameraAttrs",function(req,res,next){
	res.setHeader("Access-Control-Allow-Origin","*");
	try{
		var mobile = req.body.mobile || -1;
		permission.checkUserPermissionByMobile(req.url, mobile, 'pc', function(hasPermission){
			if(hasPermission){
				camera.getCameraAttrs(req,res);
			} else {
				permission.permissionDenied(res);
			}
		});
	} catch(e) {
		permission.permissionDenied(res);
	}
	return next();
});


//获取摄像头属性及其描述-APP
server.post("/camera/getCameraAttrs_APP",function(req,res,next){
	res.setHeader("Access-Control-Allow-Origin","*");
	try{
		var mobile = req.body.mobile || -1;
		// permission.checkUserPermissionByMobile(req.url, mobile, 'pc', function(hasPermission){
		// 	if(hasPermission){
				camera.getCameraAttrs_APP(req,res);
		// 	} else {
		// 		permission.permissionDenied(res);
		// 	}
		// });
	} catch(e) {
		permission.permissionDenied(res);
	}
	return next();
});

//添加摄像头属性
server.post("/camera/addCameraAttr",function(req,res,next){
	res.setHeader("Access-Control-Allow-Origin","*");
	try{
		var mobile = req.body.mobile || -1;
		permission.checkUserPermissionByMobile(req.url, mobile, 'pc', function(hasPermission){
			if(hasPermission){
				camera.addCameraAttr(req,res);
			} else {
				permission.permissionDenied(res);
			}
		});
	} catch(e) {
		permission.permissionDenied(res);
	}
	return next();
});

//编辑摄像头属性
server.post("/camera/editCameraAttr",function(req,res,next){
	res.setHeader("Access-Control-Allow-Origin","*");
	try{
		var mobile = req.body.mobile || -1;
		permission.checkUserPermissionByMobile(req.url, mobile, 'pc', function(hasPermission){
			if(hasPermission){
				camera.editCameraAttr(req,res);
			} else {
				permission.permissionDenied(res);
			}
		});
	} catch(e) {
		permission.permissionDenied(res);
	}
	return next();
});

//编辑摄像头属性的展示方式
server.post("/camera/editCameraAttrShow",function(req,res,next){
	res.setHeader("Access-Control-Allow-Origin","*");
	try{
		var mobile = req.body.mobile || -1;
		permission.checkUserPermissionByMobile(req.url, mobile, 'pc', function(hasPermission){
			if(hasPermission){
				camera.editCameraAttrShow(req,res);
			} else {
				permission.permissionDenied(res);
			}
		});
	} catch(e) {
		permission.permissionDenied(res);
	}
	return next();
});

//批量添加摄像头数据
server.post("/camera/multiAddCameras",function(req,res,next){
	res.setHeader("Access-Control-Allow-Origin","*");
	try{
		var mobile = req.body.mobile || -1;
		permission.checkUserPermissionByMobile(req.url, mobile, 'pc', function(hasPermission){
			if(hasPermission){
				camera.multiAddCameras(req,res);
			} else {
				permission.permissionDenied(res);
			}
		});
	} catch(e) {
		permission.permissionDenied(res);
	}
	return next();
});

//下载模板
server.get("/camera/downloadModel",function(req,res,next){
    res.setHeader("Access-Control-Allow-Origin","*");
    try{
        var mobile = req.query.mobile || -1;
        var url = req.url.split('?')[0];
        permission.checkUserPermissionByMobile(url, mobile, 'pc', function(hasPermission){
            if(hasPermission){
                camera.downloadModel(req,res);
            } else {
                permission.permissionDenied(res);
            }
        });
    } catch(e) {
        permission.permissionDenied(res);
    }
    return next();
});

//手动备份摄像头数据
server.post("/camera/backupCameras",function(req,res,next){
	res.setHeader("Access-Control-Allow-Origin","*");
	try{
		var mobile = req.body.mobile || -1;
		permission.checkUserPermissionByMobile(req.url, mobile, 'pc', function(hasPermission){
			if(hasPermission){
				camera.backupCameras(req,res);
			} else {
				permission.permissionDenied(res);
			}
		});
	} catch(e) {
		permission.permissionDenied(res);
	}
	return next();
});

//手动还原摄像头数据
server.post("/camera/restoreCameras",function(req,res,next){
	res.setHeader("Access-Control-Allow-Origin","*");
	try{
		var mobile = req.body.mobile || -1;
		permission.checkUserPermissionByMobile(req.url, mobile, 'pc', function(hasPermission){
			if(hasPermission){
				camera.restoreCameras(req,res);
			} else {
				permission.permissionDenied(res);
			}
		});
	} catch(e) {
		permission.permissionDenied(res);
	}
	return next();
});

//批量更改摄像头的列属性
server.post("/camera/multiEditCamerasByAttr",function(req,res,next){
	res.setHeader("Access-Control-Allow-Origin","*");
	try{
		var mobile = req.body.mobile || -1;
		permission.checkUserPermissionByMobile(req.url, mobile, 'pc', function(hasPermission){
			if(hasPermission){
				camera.multiEditCamerasByAttr(req,res);
			} else {
				permission.permissionDenied(res);
			}
		});
	} catch(e) {
		permission.permissionDenied(res);
	}
	return next();
});


//获取摄像头类型
server.post("/camera/getCameraTypes",function(req,res,next){
	res.setHeader("Access-Control-Allow-Origin","*");
	try{
		var mobile = req.body.mobile || -1;
		permission.checkUserPermissionByMobile(req.url, mobile, 'pc', function(hasPermission){
			if(hasPermission){
				camera.getCameraTypes(req,res);
			} else {
				permission.permissionDenied(res);
			}
		});
	} catch(e) {
		permission.permissionDenied(res);
	}
	return next();
});

//编辑摄像头类型
server.post("/camera/editCameraTypes",function(req,res,next){
	res.setHeader("Access-Control-Allow-Origin","*");
	try{
		var mobile = req.body.mobile || -1;
		permission.checkUserPermissionByMobile(req.url, mobile, 'pc', function(hasPermission){
			if(hasPermission){
				camera.editCameraTypes(req,res);
			} else {
				permission.permissionDenied(res);
			}
		});
	} catch(e) {
		permission.permissionDenied(res);
	}
	return next();
});

//增加摄像头类型
server.post("/camera/addCameraTypes",function(req,res,next){
	res.setHeader("Access-Control-Allow-Origin","*");
	try{
		var mobile = req.body.mobile || -1;
		permission.checkUserPermissionByMobile(req.url, mobile, 'pc', function(hasPermission){
			if(hasPermission){
				camera.addCameraTypes(req,res);
			} else {
				permission.permissionDenied(res);
			}
		});
	} catch(e) {
		permission.permissionDenied(res);
	}
	return next();
});

//删除摄像头类型
server.post("/camera/delCameraTypes",function(req,res,next){
	res.setHeader("Access-Control-Allow-Origin","*");
	try{
		var mobile = req.body.mobile || -1;
		permission.checkUserPermissionByMobile(req.url, mobile, 'pc', function(hasPermission){
			if(hasPermission){
				camera.delCameraTypes(req,res);
			} else {
				permission.permissionDenied(res);
			}
		});
	} catch(e) {
		permission.permissionDenied(res);
	}
	return next();
});

//删除摄像字段
server.post("/camera/delCameraColumn",function(req,res,next){
    res.setHeader("Access-Control-Allow-Origin","*");
    try{
        var mobile = req.body.mobile || -1;
        permission.checkUserPermissionByMobile(req.url, mobile, 'pc', function(hasPermission){
            if(hasPermission){
                camera.delCameraColumn(req,res);
            } else {
                permission.permissionDenied(res);
            }
        });
    } catch(e) {
        permission.permissionDenied(res);
    }
    return next();
});

//坐标转换
server.post("/camera/transformPoint",function(req,res,next){
    res.setHeader("Access-Control-Allow-Origin","*");
    try{
        var mobile = req.body.mobile || -1;
        permission.checkUserPermissionByMobile(req.url, mobile, 'pc', function(hasPermission){
            if(hasPermission){
                camera.transformPointReq(req,res);
            } else {
                permission.permissionDenied(res);
            }
        });
    } catch(e) {
        permission.permissionDenied(res);
    }
    return next();
});




module.exports = server;
