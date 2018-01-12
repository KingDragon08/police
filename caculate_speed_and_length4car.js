/**
 * caculate speed and length for car
 * @param timeInterval the time of how long it takes, needed for caculate speed
 * @param cars like [{x:1, y:1},{x:2, y:2}, {x:3, y:3}]
 * @return {"speed":1, "length": 2}
 * @tips set isFirst to true then this function would
 * @tips init the localStorage for caculate speed and length for car
 * @tips and return {"speed": -1, "length": -1}
 * @tips set isFirst to false then this funcion would caculate speed and length for car
 * @error when localStorage cars number no equal to the number of cars param
 * @error this function would set the localStorage for caculate speed and length for car
 * @error by cars param and return {"speed": -1, "length": -1}
 */
function caculate_speed_and_length4car(cars, timeInterval, isFirst){
	var ret = {"speed": -1, "length": -1}
	if(isFirst){
		localStorage.setItem("caculate_speed_and_length4car", JSON.stringify(cars));
		return ret;
	}
	if(timeInterval<=0){
		localStorage.setItem("caculate_speed_and_length4car", JSON.stringify(cars));
		return ret;	
	}
	if(localStorage.getItem("caculate_speed_and_length4car")){
		var lastCars = JSON.parse(localStorage.getItem("caculate_speed_and_length4car"));
		if(lastCars.length == cars.length){
			var length = 0;
			var speed = 0;
			for(var i=0; i<cars.length; i++){
				if(i<cars.length-1){
					length += Math.sqrt(Math.pow(cars[i+1]["x"]-cars[i]["x"], 2) + 
										Math.pow(cars[i+1]["y"]-cars[i]["y"], 2))
				}
				speed += Math.sqrt(Math.pow(cars[i]["x"]-lastCars[i]["x"], 2)+
									Math.pow(cars[i]["y"]-lastCars[i]["y"], 2)) / timeInterval;
			}
			speed = speed / cars.length;
			localStorage.setItem("caculate_speed_and_length4car", JSON.stringify(cars));
			ret["speed"] = speed;
			ret["length"] = length;
			return ret;
		} else {
			localStorage.setItem("caculate_speed_and_length4car", JSON.stringify(cars));
			return ret;
		}
	} else {
		localStorage.setItem("caculate_speed_and_length4car", JSON.stringify(cars));
		return ret
	}
}