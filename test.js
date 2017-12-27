function scaleLine2Polygon(points, space){
    var polygonUp = Array();
    var polygonDown = Array();
    if (points[0].X && points[0].Y) {
        //多添加一个点，方便添加最后一个点的边界
        var temp = {};
        if(points[points.length-1].X!=points[points.length-2].X){
            var k = (points[points.length-1].Y-points[points.length-2].Y)/
                (points[points.length-1].X-points[points.length-2].X);
            temp.X = points[points.length-1].X + 1;
            temp.Y = points[points.length-1].Y + k;
        } else {
            temp.X = points[points.length-1].X;
            temp.Y = points[points.length-1].Y + 1;
        }
        points.push(temp);
        //构造多边形区域
        for (var i = 0; i < points.length - 1; i++) {
            //根据相邻两个点的斜率添加多边形的点
            if (points[i].X == points[i + 1].X && points[i].Y == points[i + 1].Y) { //两个点重合
                continue;
            } else {
                var k = 100000000;
                if(points[i].X != points[i + 1].X){
                    k = (points[i].Y - points[i + 1].Y)*1.0 / (points[i].X - points[i + 1].X)*1.0; //斜率
                }
                if(Math.abs(k)==0){
                    k = 0.000000001;
                }
                var k1 = -1 / k; //法向量的斜率
                var com = space / Math.sqrt(k1 * k1 + 1);
                console.log(k,k1,com,k1*com);
                var temp1 = {}
                var x1 = points[i].X - com;
                var y1 = points[i].Y - k1 * com;
                temp1.X = x1;
                temp1.Y = y1;
                polygonUp.push(temp1);
                var x2 = points[i].X + com;
                var y2 = points[i].Y + k1 * com;
                var temp2 = {};
                temp2.X = x2;
                temp2.Y = y2;
                polygonDown.push(temp2);
            }
        }
        points = polygonUp.concat(polygonDown); 
    }
    return points;
}


scaleLine2Polygon([{X:1, Y:1},{X:2, Y:1},{X:2, Y:2},{X:3, Y:2}],1)


