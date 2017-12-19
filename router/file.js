var restify = require('restify');
var server = global.server;
var fs = require('fs');
var Mobile = require('../controller/mobileController');
var User = require('../controller/userController');
var async = require('async');

var permission = require("../controller/roleActionController")

var uploadBaseURL = "http://211.103.178.205:8081/upload/";
//var uploadBaseURL = "http://127.0.0.1:8080/police/upload/";

//单文件上传
server.post("/file/upload", function(req, res, next) {
	res.setHeader("Access-Control-Allow-Origin", "*");

	try{
		var mobile = req.body.mobile || -1;
		permission.checkUserPermissionByMobile(req.url, mobile, 'pc', function(hasPermission){
			if(hasPermission){
				/******************************************************/
				var query = req.body;
				try{
					var mobile = query.mobile;
					var token = query.token;
					Mobile.checkMobile2Token(mobile, token, function(result) {
						if (result) {
							var file = req.files.file;
							var size = file.size;
							var path = file.path;
							var name = file.name;
							var type = file.type;
							var postfix = name.split(".")[name.split(".").length - 1];
							var timestamp = new Date().getTime();
							var target_path = "./upload/" + timestamp + "." + postfix;
							console.log(path);
			
							fs.rename(path, target_path, function(err) {
								if (err) {
									console.log('rename');
									console.log(err);
								} else {
									// 删除临时文件
									fs.unlink(path, function() {
										if (err) {
											console.log(unlink);
											console.log(err);
										} else {
											var url = uploadBaseURL + timestamp + "." + postfix;
											res.json({ "code": 200, "data": { "status": "success", "error": "upload success", "url": url } });
										}
									});
								}
							});
						} else {
							res.json({ "code": 300, "data": { "status": "fail", "error": "moblie not match token" } });
						}
					});
				} catch(e) {
					console.log(e);
					res.json({ "code": 300, "data": { "status": "fail", "error": "unknown error"}});
				}
				/******************************************************/
			} else {
				permission.permissionDenied(res);
			}
		});
	} catch(e) {
		permission.permissionDenied(res);
	}
	
	
    return next();
});


//PC单文件上传
server.post("/file/uploadPC", function(req, res, next) {
	res.setHeader("Access-Control-Allow-Origin", "*");
	try{
		var mobile = req.body.mobile || -1;
		permission.checkUserPermissionByMobile(req.url, mobile, 'pc', function(hasPermission){
			if(hasPermission){
				/******************************************************/
				var query = req.body;
				try{
					var mobile = query.mobile;
					var token = query.token;
					User.checkMobile2Token(mobile, token, function(result) {
						if (result) {
							var file = req.files.file;
							var size = file.size;
							var path = file.path;
							var name = file.name;
							var type = file.type;
							var postfix = name.split(".")[name.split(".").length - 1];
							var timestamp = new Date().getTime();
							var target_path = "./upload/" + timestamp + "." + postfix;
							console.log(path);
			
							fs.rename(path, target_path, function(err) {
								if (err) {
									console.log('rename');
									console.log(err);
								} else {
									// 删除临时文件
									fs.unlink(path, function() {
										if (err) {
											console.log(unlink);
											console.log(err);
										} else {
											var url = uploadBaseURL + timestamp + "." + postfix;
											res.json({ "code": 200, "data": { "status": "success", "error": "upload success", "url": url } });
										}
									});
								}
							});
						} else {
							res.json({ "code": 300, "data": { "status": "fail", "error": "moblie not match token" } });
						}
					});
				} catch(e) {
					console.log(e);
					res.json({ "code": 300, "data": { "status": "fail", "error": "unknown error"}});
				}
				/******************************************************/
			} else {
				permission.permissionDenied(res);
			}
		});
	} catch(e) {
		permission.permissionDenied(res);
	}
	

    return next();
});

/**
 * base64图片上传
 * @param req
 * @param res（返回图片路径）
 * @param next
 */
server.post("/file/uploadPcByBase64",function(req,res,next){
    res.setHeader("Access-Control-Allow-Origin", "*");
    var query = req.body;
    try{
        var mobile = query.mobile;
        var token = query.token;
        Mobile.checkMobile2Token(mobile, token, function(result) {
            if (result) {
                var imgs=query.imgs;
                console.log(query);
                var paths=[];
                var timestamp = new Date().getTime();
                for(var i=0;i<imgs.length;i++){
                    //将前台传来的base64数据去掉前缀
                    var img = imgs[i].replace(/^data:image\/\w+;base64,/, '');
                    var imgBuffer = new Buffer(img, 'base64');
                    var path = './upload/'+ timestamp  + "_" + i +".jpg";
                    paths.push(uploadBaseURL + timestamp + "_" + i + ".jpg");
                    //写入文件
                    fs.writeFile(path, imgBuffer,function(err,date){
                        if(err){
                            console.log(err);
                        }
                        // if(paths.length==imgs.length){
                        //     res.json({ "code": 200, "data": { "status": "success", "error": "上传成功", "urls": paths } });
                        // }
                    });
                }
                res.json({ "code": 200, "data": { "status": "success", "error": "上传成功", "urls": paths } });
            } else {
                res.json({ "code": 300, "data": { "status": "fail", "error": "账号和token不匹配" } });
            }
        });
    } catch(e) {
        console.log(e);
        res.json({ "code": 300, "data": { "status": "fail", "error": "未知错误"}});
    }
});

//多文件上传
server.post("/file/mulUpload", function(req, res, next) {
	res.setHeader("Access-Control-Allow-Origin", "*");

//	try{
//		var mobile = req.body.mobile || -1;
//		permission.checkUserPermissionByMobile(req.url, mobile, 'pc', function(hasPermission){
//			if(hasPermission){
				/******************************************************/
				var query = req.body;
				try{
					var mobile = query.mobile;
					var token = query.token;
					Mobile.checkMobile2Token(mobile, token, function(result) {
						if (result) {
							var files = req.files;
							var urls = [];
							var timestamp = new Date().getTime();
							for(var i in files){
								var file = files[i];
								var size = file.size;
								var path = file.path;
								var name = file.name;
								var type = file.type;
								var postfix = name.split(".")[name.split(".").length - 1];
								var target_path = "./upload/" + timestamp + "_" + i + "." + postfix;
								urls.push(uploadBaseURL + timestamp + "_" + i + "." + postfix);
								moveFile(path,target_path);
							}
							res.json({ "code": 200, "data": { "status": "success", "error": "upload success", "urls": urls } });
						} else {
							res.json({ "code": 300, "data": { "status": "fail", "error": "moblie not match token" } });
						}
					});
				} catch(e) {
					console.log(e);
					res.json({ "code": 300, "data": { "status": "fail", "error": "unknown error"}});
				}
				/******************************************************/
				//camera.delCamera(req,res);
//			} else {
//				permission.permissionDenied(res);
//			}
//		});
//	} catch(e) {
//		permission.permissionDenied(res);
//	}
	

    return next();
});

function moveFile(path,target_path){
	fs.rename(path, target_path, function(err) {
        if (err) {
            console.log('rename');
            console.log(err);
        } else {
            // 删除临时文件
            fs.unlink(path, function() {
                if (err) {
                    console.log(unlink);
                    console.log(err);
                }
            });
        }
    });
}


module.exports = server;