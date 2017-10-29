//发布任务
var settings = {
  "url": "http://127.0.0.1:8080/task/publishTask",
  "method": "POST",
  "data":{
  	mobile:"13810332931",
  	token:"6b71a6f40f6df25fcb1dbd1456eb1d5b",
  	cameraName:"cameraName",
  	cameraLocation:"cameraLocation",
  	taskDescription:"taskDescription",
  	userId:"1",
  	cameraId:"1",
  }
}
$.ajax(settings).done(function (response) {
  console.log(JSON.stringify(response));
});

//PC分页获取所有任务
var settings = {
  "url": "http://127.0.0.1:8080/task/getAllTask",
  "method": "POST",
  "data":{
  	mobile:"13810332931",
  	token:"6b71a6f40f6df25fcb1dbd1456eb1d5b",
  	page:1,
  	pageSize:10
  }
}
$.ajax(settings).done(function (response) {
  console.log(JSON.stringify(response));
});

//PC按任务用户分页获取任务
var settings = {
  "url": "http://127.0.0.1:8080/task/getUserTask",
  "method": "POST",
  "data":{
  	mobile:"13810332931",
  	token:"6b71a6f40f6df25fcb1dbd1456eb1d5b",
  	page:1,
  	pageSize:10,
  	userId:1
  }
}
$.ajax(settings).done(function (response) {
  console.log(JSON.stringify(response));
});

//PC模糊搜索分页获取任务
var settings = {
  "url": "http://127.0.0.1:8080/task/searchTask",
  "method": "POST",
  "data":{
  	mobile:"13810332931",
  	token:"6b71a6f40f6df25fcb1dbd1456eb1d5b",
  	page:1,
  	pageSize:10,
  	keyword:'camera'
  }
}
$.ajax(settings).done(function (response) {
  console.log(JSON.stringify(response));
});

//App分页按状态获取自己的任务
var settings = {
  "url": "http://127.0.0.1:8080/task/getTaskMobile",
  "method": "POST",
  "data":{
  	mobile:"13810332931",
  	token:"3d9db3d7a0c3c4ef547422817d396a44",
  	page:1,
  	pageSize:10,
  	userId:1,
  	taskStatus:0
  }
}
$.ajax(settings).done(function (response) {
  console.log(JSON.stringify(response));
});

//审核任务
var settings = {
  "url": "http://127.0.0.1:8080/task/checkTask",
  "method": "POST",
  "data":{
  	mobile:"13810332931",
  	token:"6b71a6f40f6df25fcb1dbd1456eb1d5b",
  	taskId:1,
  	taskStatus:3,
  	info:'checkInfo'
  }
}
$.ajax(settings).done(function (response) {
  console.log(JSON.stringify(response));
});

//获取任务状态PC
var settings = {
  "url": "http://127.0.0.1:8080/task/getTaskStatus_PC",
  "method": "POST",
  "data":{
  	mobile:"13810332931",
  	token:"6b71a6f40f6df25fcb1dbd1456eb1d5b",
  	cameraId:1
  }
}
$.ajax(settings).done(function (response) {
  console.log(JSON.stringify(response));
});


//获取任务状态App
var settings = {
  "url": "http://127.0.0.1:8080/task/getTaskStatus_App",
  "method": "POST",
  "data":{
  	mobile:"13810332931",
  	token:"3d9db3d7a0c3c4ef547422817d396a44",
  	cameraId:1
  }
}
$.ajax(settings).done(function (response) {
  console.log(JSON.stringify(response));
});

//删除任务
var settings = {
  "url": "http://127.0.0.1:8080/task/deleteTask",
  "method": "POST",
  "data":{
  	mobile:"13810332931",
  	token:"6b71a6f40f6df25fcb1dbd1456eb1d5b",
  	taskId:1
  }
}
$.ajax(settings).done(function (response) {
  console.log(JSON.stringify(response));
});

//接受任务App
var settings = {
  "url": "http://127.0.0.1:8080/task/acceptTaskStatus_App",
  "method": "POST",
  "data":{
  	mobile:"13810332931",
  	token:"3d9db3d7a0c3c4ef547422817d396a44",
  	taskId:1
  }
}
$.ajax(settings).done(function (response) {
  console.log(JSON.stringify(response));
});










