var server = global.server
var Department = require('../controller/departmentController')

//添加一级部门
server.post("/department/add1",function(req,res,next){
	res.setHeader("Access-Control-Allow-Origin","*");
	Department.add1(req,res);
	return next();
});

//添加二级部门
server.post("/department/add2",function(req,res,next){
	res.setHeader("Access-Control-Allow-Origin","*");
	Department.add2(req,res);
	return next();
});

//获取所有一级部门
server.post("/department/list1",function(req,res,next){
	res.setHeader("Access-Control-Allow-Origin","*");
	Department.list1(req,res);
	return next();
});

//获取所有二级部门
server.post("/department/list2",function(req,res,next){
	res.setHeader("Access-Control-Allow-Origin","*");
	Department.list2(req,res);
	return next();
});

//更新一级部门名字
server.post("/department/edit1",function(req,res,next){
	res.setHeader("Access-Control-Allow-Origin","*");
	Department.edit1(req,res);
	return next();
});

//更新二级部门名字
server.post("/department/edit2",function(req,res,next){
	res.setHeader("Access-Control-Allow-Origin","*");
	Department.edit2(req,res);
	return next();
});

//更改用户部门
server.post("/department/updateDepartment",function(req,res,next){
	res.setHeader("Access-Control-Allow-Origin","*");
	Department.updateDepartment(req,res);
	return next();
});

module.exports = server;