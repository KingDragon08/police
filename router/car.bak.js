var server = global.server;
var Car = require('../controller/carController');

/*
//添加兴趣点
server.post("/camera/getParams",function(req,res,next){
	res.setHeader("Access-Control-Allow-Origin","*");
	camera.getParams(req,res);
	return next();
});
*/

//添加车辆（环卫车＋巡逻车）
server.post("/car/addCar",function(req,res,next){
	res.setHeader("Access-Control-Allow-Origin","*");
	Car.addCar(req,res);
	return next();
});

//删除车辆
server.post("/car/delCar",function(req,res,next){
	res.setHeader("Access-Control-Allow-Origin","*");
	Car.delCar(req,res);
	return next();
});

//分类分页获取车辆或获取全部车辆
server.post("/car/getCar",function(req,res,next){
	res.setHeader("Access-Control-Allow-Origin","*");
	Car.getCar(req,res);
	return next();
});

//获取单个车辆信息
server.post("/car/getSingleCarInfo",function(req,res,next){
	res.setHeader("Access-Control-Allow-Origin","*");
	Car.getSingleCarInfo(req,res);
	return next();
});

//按车牌号搜索车辆
server.post("/car/searchCar",function(req,res,next){
	res.setHeader("Access-Control-Allow-Origin","*");
	Car.searchCar(req,res);
	return next();
});

//获取车辆当前位置
server.post("/car/getCarPosition",function(req,res,next){
	res.setHeader("Access-Control-Allow-Origin","*");
	Car.getCarPosition(req,res);
	return next();
});

//获取车辆轨迹
server.post("/car/getCarTrack",function(req,res,next){
	res.setHeader("Access-Control-Allow-Origin","*");
	Car.getCarTrack(req,res);
	return next();
});

//获取车辆属性
server.post("/car/getCarAttrs",function(req,res,next){
	res.setHeader("Access-Control-Allow-Origin","*");
	Car.getCarAttrs(req,res);
	return next();
});



module.exports = server;
