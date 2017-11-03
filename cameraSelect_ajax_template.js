//矩形框选摄像头
var settings = {
  "url": "http://127.0.0.1:8080/camera/cameraSelectRect",
  "method": "POST",
  "data":{
  	mobile:"13810332931",
  	token:"6b71a6f40f6df25fcb1dbd1456eb1d5b",
  	leftTopX:"400000",
  	leftTopY:"300000",
  	rightBottomX:"600000",
  	rightBottomY:"400000",
  }
}
$.ajax(settings).done(function (response) {
  console.log(JSON.stringify(response));
});

//圆形框选摄像头
var settings = {
  "url": "http://127.0.0.1:8080/camera/cameraSelectCircle",
  "method": "POST",
  "data":{
    mobile:"13810332931",
    token:"6b71a6f40f6df25fcb1dbd1456eb1d5b",
    centerX:"400000",
    centerY:"300000",
    radius:100000,
  }
}
$.ajax(settings).done(function (response) {
  console.log(JSON.stringify(response));
});


//多边形框选摄像头
//X，Y为大写
var points = [{"X":300000,"Y":300000},{"X":400000,"Y":400000},{"X":600000,"Y":300000}];
var settings = {
  "url": "http://127.0.0.1:8080/camera/cameraSelectPolygon",
  "method": "POST",
  "data":{
    mobile:"13810332931",
    token:"6b71a6f40f6df25fcb1dbd1456eb1d5b",
    points:JSON.stringify(points)
  }
}
$.ajax(settings).done(function (response) {
  console.log(JSON.stringify(response));
});


//直线附近摄像头
//X，Y为大写
var points = [{"X":300000,"Y":300000},{"X":400000,"Y":400000},{"X":600000,"Y":300000}];
var settings = {
  "url": "http://127.0.0.1:8080/camera/cameraSelectLine",
  "method": "POST",
  "data":{
    mobile:"13810332931",
    token:"6b71a6f40f6df25fcb1dbd1456eb1d5b",
    points:JSON.stringify(points),
    space: 100
  }
}
$.ajax(settings).done(function (response) {
  console.log(JSON.stringify(response));
});


