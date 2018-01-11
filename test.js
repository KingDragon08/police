// function scaleLine2Polygon(points, space){
//     var polygonUp = Array();
//     var polygonDown = Array();
//     if (points[0].X && points[0].Y) {
//         //多添加一个点，方便添加最后一个点的边界
//         var temp = {};
//         if(points[points.length-1].X!=points[points.length-2].X){
//             var k = (points[points.length-1].Y-points[points.length-2].Y)/
//                 (points[points.length-1].X-points[points.length-2].X);
//             temp.X = points[points.length-1].X + 1;
//             temp.Y = points[points.length-1].Y + k;
//         } else {
//             temp.X = points[points.length-1].X;
//             temp.Y = points[points.length-1].Y + 1;
//         }
//         points.push(temp);
//         //构造多边形区域
//         for (var i = 0; i < points.length - 1; i++) {
//             //根据相邻两个点的斜率添加多边形的点
//             if (points[i].X == points[i + 1].X && points[i].Y == points[i + 1].Y) { //两个点重合
//                 continue;
//             } else {
//                 var k = 100000000;
//                 if(points[i].X != points[i + 1].X){
//                     k = (points[i].Y - points[i + 1].Y)*1.0 / (points[i].X - points[i + 1].X)*1.0; //斜率
//                 }
//                 if(Math.abs(k)==0){
//                     k = 0.000000001;
//                 }
//                 var k1 = -1 / k; //法向量的斜率
//                 var com = space / Math.sqrt(k1 * k1 + 1);
//                 console.log(k,k1,com,k1*com);
//                 var temp1 = {}
//                 var x1 = points[i].X - com;
//                 var y1 = points[i].Y - k1 * com;
//                 temp1.X = x1;
//                 temp1.Y = y1;
//                 polygonUp.push(temp1);
//                 var x2 = points[i].X + com;
//                 var y2 = points[i].Y + k1 * com;
//                 var temp2 = {};
//                 temp2.X = x2;
//                 temp2.Y = y2;
//                 polygonDown.push(temp2);
//             }
//         }
//         points = polygonUp.concat(polygonDown); 
//     }
//     return points;
// }


// // scaleLine2Polygon([{X:1, Y:1},{X:2, Y:1},{X:2, Y:2},{X:3, Y:2}],1)




// function test(){
//     var sum = 0;
//     for(var i=0; i<1000000; i++){
//         sum += 1;
//     }
// }

// start = new Date().getTime();
// test();
// console.log(new Date().getTime() - start);



var db = require("./lib/db");
// db.query("select cam_id, cam_loc_lan, cam_loc_lon from camera where cam_id=79",[],function(err,result){
//     for(var i=0; i<result.length; i++){
//         transformPoint(result[i].cam_id, result[i].cam_loc_lon, result[i].cam_loc_lan,
//             function(temp){
//                 db.query("update camera set cam_BJ_X=?,cam_BJ_Y=? where cam_id=?",
//                             [temp.x, temp.y, temp.cam_id],function(err,result){
//                                 console.log(err);
//                                 console.log(temp.cam_id, temp);
//                             })
//             });
//     }
// });

// transformPoint(1,116.38,39.92,function(temp){
//     console.log(temp);
// });

/**
 * 坐标转换
 * lon->x, lan->y
 * 备注：数据库中配置的基准点>=2
 */
// function transformPoint(cam_id, x6, y6, callback){
//     //取所有的录入的基准点
//     var sql = "select * from base_point";
//     db.query(sql, [], function(err, points){
//         if(points.length<2){
//             callback({
//                 x:-1,
//                 y:-1
//             });
//         } else {
//             for(var i=0; i<points.length; i++){
//                 points[i]['distance'] = (points[i].outX-x6)*(points[i].outX-x6)+(points[i].outY-y6)*(points[i].outY-y6);
//             }
//             points.sort(function(x,y){return x['distance']-y['distance']});
//             var index = 1;
//             for(var i=index; i<points.length; i++){
//                 if(parseFloat(points[i].outX-x6)*parseFloat(x6-points[0].outX)>0 && 
//                     parseFloat(points[i].outY-y6)*parseFloat(y6-points[0].outY)>0 &&
//                     (points[i].outX-points[0].outX!=0) && 
//                     (points[i].outY-points[0].outY!=0)
//                     ){
//                     index = i;
//                     break;
//                 }
//             }
//             if(index==1){
//                 for(var i=index; i<points.length; i++){
//                     if((points[i].outX-points[0].outX!=0) && 
//                     (points[i].outY-points[0].outY!=0)){
//                         index = i;
//                         break;
//                     }
//                 }
//             }
//             var x1 = points[0].inX;
//             var y1 = points[0].inY;
//             var x2 = points[index].inX;
//             var y2 = points[index].inY;
//             var x4 = points[0].outX;
//             var y4 = points[0].outY;
//             var x5 = points[index].outX;
//             var y5 = points[index].outY;
//             console.log(points[index], x5-x4, y5-y4);
//             callback({
//                 x: parseFloat((x2*x6-x2*x4-x1*x6+x1*x5)/(x5-x4)),
//                 y: parseFloat((y2*y6-y2*y4-y1*y6+y1*y5)/(y5-y4)),
//                 cam_id: cam_id
//             });
//         }
//     });
// }

// transformPoint(1,  116.356222, 39.923647, function(temp){console.log(temp)});
db.query("select outX, outY, inX, inY from base_point",[],function(err, result){
    console.log(JSON.stringify(result));
});










