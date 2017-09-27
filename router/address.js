var server = global.server
var address = require('../controller/addrController')

// 模糊查找地点
server.post("/address/fuzzysearch",function(req,res,next){
	res.setHeader("Access-Control-Allow-Origin","*");
	address.getFuzzyAddr(req,res);
	return next();
});

module.exports = server;
