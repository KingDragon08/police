var db = require("./lib/db");
db.query("select cam_id, cam_loc_lan, cam_loc_lon from camera",[],function(err,result){
	for(var i=0; i<result.length; i++){
		transformPoint(result[i].cam_id, result[i].cam_loc_lon, result[i].cam_loc_lan,
			function(temp){
				db.query("update camera set cam_BJ_X=?,cam_BJ_Y=? where cam_id=?",
							[temp.x, temp.y, temp.cam_id],function(err,result){
								console.log(temp.cam_id);
							})
			});
	}
});

// transformPoint(1,116.38,39.92,function(temp){
//     console.log(temp);
// });

/**
 * 坐标转换
 * lon->x, lan->y
 * 备注：数据库中配置的基准点>=2
 */
function transformPoint(cam_id, x6, y6, callback){
    //取所有的录入的基准点
    var sql = "select * from base_point";
    db.query(sql, [], function(err, points){
        if(points.length<2){
            callback({
                x:-1,
                y:-1
            });
        } else {
            for(i=0; i<points.length; i++){
                points[i]['distance'] = (points[i].outX-x6)*(points[i].outX-x6)+(points[i].outY-y6)*(points[i].outY-y6);
            }
            points.sort(function(x,y){return x['distance']-y['distance']});
            // console.log(points);
            var x1 = points[0].inX;
            var y1 = points[0].inY;
            var x2 = points[1].inX;
            var y2 = points[1].inY;
            var x4 = points[0].outX;
            var y4 = points[0].outY;
            var x5 = points[1].outX;
            var y5 = points[1].outY;
            callback({
                x: (x2*x6-x2*x4-x1*x6+x1*x5)/(x5-x4),
                y: (y2*y6-y2*y4-y1*y6+y1*y5)/(y5-y4),
                cam_id: cam_id
            });
        }
    });
}