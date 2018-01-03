function transformPoint(x6,y6){
	x1=501494.0802;
	y1=304417.3615;
	x2=500686.8998;
	y2=306263.3613;
	y4=39.907194;
	x4=116.376302;
	y5=39.923865;
	x5=116.364967;
	return {
		x: (x2*x6-x2*x4-x1*x6+x1*x5)/(x5-x4),
		y: (y2*y6-y2*y4-y1*y6+y1*y5)/(y5-y4)
	}
}