/**
 * points = [{x:1,y:2},{x:2,y:3},{x:3,y:4},{x:5,y:10}]
 * 顺时针dist为正扩大,为负缩小
 * 逆时针dist为正缩小,为负扩大
 */
function scalePolygon(points, dist){
	if (!points || points.length<3) {
		return points;
	}
	var pList = points;
	var DpList = Array();
	var nDpList = Array();
	var newList = Array();
	var i=0, index=0, count=pList.length;
	for(i=0; i<count; i++){
		index = (i + 1) % count;
		DpList.push({
			x: pList[index].x - pList[i].x,
			y: pList[index].y - pList[i].y
		});
	}
	for(i=0; i<count; i++){
		var r = Math.sqrt(DpList[i].x * DpList[i].x + DpList[i].y * DpList[i].y);
		r = 1.0 / r;
		nDpList.push({
			x: DpList[i].x * r,
			y: DpList[i].y * r,
		});
	}
	var length=0, startIndex=0, endIndex=0;
	for(i=0; i<count; i++){
		startIndex = i==0?count-1:i-1;
		endIndex = i;
		var sina = nDpList[startIndex].x * nDpList[endIndex].y - nDpList[startIndex].y * nDpList[endIndex].x;
		length = dist / sina;
		var temp = {
			x: nDpList[endIndex].x - nDpList[startIndex].x,
			y: nDpList[endIndex].y - nDpList[startIndex].y
		}
		newList.push({
			x: pList[i].x + temp.x * length,
			y: pList[i].y + temp.y * length
		});
	}
	return newList;
}

//scalePolygon([{x:0,y:0},{x:0,y:100},{x:100,y:100},{x:50,y:50},{x:100,y:0},],5);











