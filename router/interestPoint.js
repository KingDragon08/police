var server = global.server
var InterestPoint = require('../controller/interestPointController')

//添加兴趣点
server.post("/map/interestPoint/addPoint",function(req,res,next){
	res.setHeader("Access-Control-Allow-Origin","*");
	InterestPoint.addPoint(req,res);
	return next();
});

//删除兴趣点
server.post("/map/interestPoint/delPoint",function(req,res,next){
	res.setHeader("Access-Control-Allow-Origin","*");
	InterestPoint.delPoint(req,res);
	return next();
});

//获取兴趣点
server.post("/map/interestPoint/getPoint",function(req,res,next){
	res.setHeader("Access-Control-Allow-Origin","*");
	InterestPoint.getPoint(req,res);
	return next();
});

//更新兴趣点
server.post("/map/interestPoint/updatePoint",function(req,res,next){
	res.setHeader("Access-Control-Allow-Origin","*");
	InterestPoint.updatePoint(req,res);
	return next();
});

//关键字搜索兴趣点
server.post("/map/interestPoint/searchPoint",function(req,res,next){
	res.setHeader("Access-Control-Allow-Origin","*");
	InterestPoint.searchPoint(req,res);
	return next();
});

module.exports = server;