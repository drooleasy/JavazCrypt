function Point(){

	var router = new ArgRouter(this);
	router.add("", function(){
		Point.default(this)
	});
	router.add("arr", function(arr){
		Point.apply(this, arr);
	});
	router.add("obj.x.y", function(point){
		Point.call(this, point.x, point.y);
	});
	router.add("num, num", function(arr){
		this.x = parseFloat(arguments[0] || 0);
		this.y = parseFloat(arguments[1] || 0);
	});
	if(!router.route(arguments)) throw new Error("invalid args");
	return this;

}


Point.default = function(that){
	that.x=0;
	that.y=0;
}


Point.prototype.clone = function(){
	return new Point(this);
}

Point.prototype.array = function(){
	return [this.x, this.y];
}

Point.prototype.pushOn = function(arr){
	arr.push(this.x);
	arr.push(this.y);
	return this;
}



Point.like = function(o){
	return is_numeric(o.x) && is_numeric(o.y)
}


Point.prototype.angle = function(){
	return angleBetween(0,0, this.x, this.y);
}
Point.prototype.distance = function(){
	return distanceBetween(0,0, this.x, this.y);
}





Point.prototype.translate = function (by, _from){
	_from = _from || new Point(0,0);
}


Point.prototype.scale = function (amount, _from){
	_from = _from || new Point(0,0);
}


Point.prototype.rotate = function (/*angle, _distance, _from*/){	
	
	var angle = null,
		distance = null,
		from = null;
	var router = new ArgRouter(this);
	router.add("", function(){
		angle = this.angle();
		distance = this.distance();
		from = new Point(0,0);
	});
	router.add("num", function(_angle){
		angle = _angle;
		distance = this.distance();
		from = new Point(0,0);
	});
	router.add("num,num", function(_angle,_distance){
		angle = _angle;
		distance = _distance;
		from = new Point(0,0);
	});
	
	router.add("num,num,num", function(_angle, from_x, from_y){
		angle = _angle;
		distance = distanceBetween(this.x, this.y, from_x, from_y);
		from = new Point(from_x,from_y);
	});
	
	router.add("num, num, num, num", function(_angle, _distance, from_x, from_y){
		angle = _angle;
		distance = _distance;
		from = new Point(from_x, from_y);
	});
	router.add("num, obj.x.y", function(_angle, point){
		angle = _angle;
		distance = distanceBetween(this.x, this.y, point.x, point.y);
		from = point;
	});
	router.add("num, num, obj.x.y", function(_angle, _distance, point){
		angle = _angle;
		distance = _distance;
		from = point;

	});
	router.add("num, arr", function(_angle, arr){
		if(arr.length<2) throw new Error("Invalid arg");
		angle = _angle;
		distance = distanceBetween(this.x, this.y, arr[0], arr[1]); 
		from =  new Point(arr[0], arr[1]);
	});
	router.add("num, num, arr", function(_angle, _distance, arr){
		if(arr.length<2) throw new Error("Invalid arg");
		angle = _angle;
		distance = _distance;
		from = new Point(arr[0], arr[1]);

	});
	if(!router.route(arguments)) throw new Error("invalid args");
	
	console.log("angle: " + angle);
	console.log("distance: " + distance);
	console.log("from: " + from.x + "," + from.y);
	
}
