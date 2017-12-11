var db = require("../lib/db");
var check = require("../lib/check");

//基于重点目标长度和速度计算
function getCarPosition(req,res){
	var query = req.body;
	try{
		check(query,res,function(){
			var Id = query.Id || -1;
			if (Id == -1) {
                errorHandler(res, "params error");
            } else {
            	//需要对接接口,自己获取不了
            	/*var centerX = 500377.96;
            	var centerY = 305971.1;*/
            	//两个摄像头之间的坐标点（1260和1389）车辆长度默认是10m 起始时间设定为当前时间  途经两个摄像头之间的时间为2min
            	var car_length=10;
            	var time=120;
                var Point_x1=499320.70;
                var Point_y1=302037.95;
                var Point_x2=499334.88; 
                var Point_y2=302421.32;
                Point_x=Point_x2-Point_x1;
                Point_y=Point_y2-Point_y1;
                //两个摄像头之间的距离
                var length=Math.sqrt(Math.pow(Point_x, 2)+Math.pow(Point_y, 2));
                //汽车的行驶速度
                var speed=length/120;
            	var data = {
            			         Pointx1:Point_x1+Math.random(),
            			         Pointy1:Point_y1+Math.random(),   
            			         Pointx2:Point_x2+Math.random(),
            			         Pointy2:Point_y2+Math.random(),
            			         time:120,
            			         car_length:10,
            			         road_length:length,
            			         speed:speed
            				};
            	var ret = {};
                ret["status"] = "success";
                ret["data"] = data;
                res.json({ "code": 200, "data": ret });
            }
		});
	} catch(e) {
		errorHandler(res, "unknown error");
	}
}

//获取重点人员轨迹
function getImportantPeopleTrack(req,res){
	var query = req.body;
	try{
		check(query,res,function(){
			var Id = query.Id || -1;
			if (Id == -1) {
                errorHandler(res, "params error");
            } else {
            	var centerX = 305971.1;
            	var centerY = 305971.1;
            	var track = [];
          		track.push({"longitude":499000.91363,"latitude":305156.92169});
                track.push({"longitude":498978.15278,"latitude":305646.27997});
                track.push({"longitude":499968.24976,"latitude":305638.69302});
                track.push({"longitude":499934.10849,"latitude":306228.68165});
                track.push({"longitude":500689.01002,"latitude":306241.85555});
                track.push({"longitude":501421.15070,"latitude":306249.44250});
                track.push({"longitude":501424.94417,"latitude":305657.66039});

            	var ret = {};
                ret["status"] = "success";
                ret["data"] = track;
                res.json({ "code": 200, "data": ret });
            }
		});
	} catch(e) {
		errorHandler(res, "unknown error");
	}
}

//播放视频
function bfradio(req,res){
    var query = req.body;
    try {
        var mobile = query.mobile;
        var token = query.token;
        User.getUserInfo(mobile, token, function(user) {
            if (user.error == 0) {
            	 res.json({ "code": 200, "data": { "status": "success", "url": "http://127.0.0.1:8081/upload/01.mp4" } });
            } else {
                errMessage(res,301,"user not login");
                return;
            }
        });
    } catch (e) {
        errMessage(res,500,e.message);
    }
}

/**
* 共用部分
*/
function errorHandler(res, desc) {
    res.json({ "code": 300, "data": { "status": "fail", "error": desc } });
}

function check(query, res, callback) {
    var mobile = query.mobile;
    var token = query.token;
    User.checkMobile2Token(mobile, token, function(result) {
        if (result) {
            callback();
        } else {
            errorHandler(res, "mobile not match token");
        }
    });
}

//公用错误输出函数
function errMessage(res,code,msg){
    res.json({
        "code": code,
        "data": {
            "status": "fail",
            "error": msg
        }
    });
}

//公用成功输出函数
function sucMessage(res){
    res.json({
        "code": 200,
        "data": {
            "status": "success",
            "error": "success"
        }
    });
}

exports.getImportantPeopleTrack = getImportantPeopleTrack;
exports.getCarPosition = getCarPosition;
exports.errorHandler = errorHandler;
exports.sucMessage = sucMessage;
exports.errMessage = errMessage;
exports.bfradio = bfradio;
exports.check = check;

