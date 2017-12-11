var server = global.server;
var Car = require('../controller/addressTestController');

/******************************忧伤的分割线******************************/
//模糊查询返回坐标
server.post("/addressTest/addressTestGetByName",function(req,res,next){
	res.setHeader("Access-Control-Allow-Origin","*");
			Car.addressTestGetByName(req,res);
			//camera.delCamera(req,res);
		return next();
});
/******************************忧伤的分割线******************************/

module.exports = server;
