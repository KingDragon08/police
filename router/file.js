var restify = require('restify');
var server = global.server;
var fs = require('fs');
var Mobile = require('../controller/mobileController');


server.post("/file/upload", function(req, res, next) {
    res.setHeader("Access-Control-Allow-Origin", "*");
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
	                            var url = "http://www.xiaofen809.com:8080/upload/" + timestamp + "." + postfix;
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
    return next();
});

module.exports = server;