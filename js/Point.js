window.onError = function(){debugger;}

function Point(){
	var that = this instanceof Point ? this : new Point(0,0);	
	
	var router = Point.router;
	if(!router.route(that, arguments)) throw "invalid args";
	
	return that;

}

Point.route = function(key){
	return { 
		"":function(){},
		"obj.x.y": function(_from){
			this[key] = _from.clone();
		},
		"num, num": function(x,y){
			this[key] = new Point(parseFloat(x),parseFloat(y));
		},
		"arr":function(arr){
			this[key] = new Point(parseFloat(arr[0]), parseFloat(arr[1]));
		}
	}
}

// POINT ROUTES
Point.router = new ArgRouter();
Point.router.add("", function(){
	Point.call(this, 0, 0);
});
Point.router.add("arr", function(arr){
	Point.call(this, arr[0], arr[1]);
});
Point.router.add("obj.x.y", function(point){
	Point.call(this, point.x, point.y);
});
Point.router.add("num, num", function(arr){
	this.x = parseFloat(arguments[0] || 0);
	this.y = parseFloat(arguments[1] || 0);
});


Point.prototype.toString = function(){
	return "Point("+this.x.toFixed(2)+", "+this.y.toFixed(2)+")";
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

Point.prototype.dot= function(){
	var ctx = {
		from : null
	};	
	
	if(!Point.prototype.dot.router.route(ctx, arguments)) throw "invalid args";
	
	return this.x * ctx.from.x + this.y * ctx.from.y
}
// POINT ROUTES
Point.prototype.dot.router = new ArgRouter();
Point.prototype.dot.router.combine(Point.route("from"));


Point.prototype.cross= function(){
	var ctx = {
		from : null
	};	
	
	if(!Point.prototype.cross.router.route(ctx, arguments)) throw "invalid args"
	
	return this.x * ctx.from.y - this.y * ctx.from.x;

}
Point.prototype.cross.router = new ArgRouter();
Point.prototype.cross.router.combine(Point.route("from"));



Point.prototype.distanceAndAngle = function(){
	var ctx = {
		from : new Point(0,0)
	};
	if(!Point.prototype.distanceAndAngle.router.route(ctx, arguments)) throw "invalid args";

	var dx = ctx.from.x - this.x,
		dy = ctx.from.y - this.y,
		distance = Math.sqrt(dx*dx+dy*dy),
		angle = Point.clipAngle(Math.atan2(dy,dx));
	return {
		distance : distance,
		angle : angle
	};

}
	
Point.prototype.distanceAndAngle.router = new ArgRouter();
Point.prototype.distanceAndAngle.router.combine(Point.route("from"));
	

Point.prototype.angle = function(){
		var ctx = {
		from : new Point(0,0)
	};	
	
	if(!Point.prototype.angle.router.route(ctx, arguments)) throw "invalid args";


	var dx = ctx.from.x - this.x,
		dy = ctx.from.y - this.y;
	return Point.clipAngle(Math.atan2(dy,dx));

}

Point.prototype.angle.router = new ArgRouter();
Point.prototype.angle.router.combine(Point.route("from"));


Point.prototype.distance = function(){
	var ctx = {
		from : new Point(0,0)
	};	
	
	if(!Point.prototype.distance.router.route(ctx, arguments)) throw "invalid args";

	var dx = ctx.from.x - this.x,
		dy = ctx.from.y - this.y;
	return Math.sqrt(dx*dx+dy*dy);

}
Point.prototype.distance.router = new ArgRouter();
Point.prototype.distance.router.combine(Point.route("from"));







Point.prototype.translate = function (/*by, from*/){
	var ctx = {
		by : new Point(0,0),
		from : this
	};	
	
	
	if(!Point.prototype.translate.router.route(ctx, arguments)) throw "invalid args";
	//console.log("by " + ctx.by)
	//console.log("from " + ctx.from);
	
	this.x = ctx.from.x + ctx.by.x;
	this.y = ctx.from.y + ctx.by.y;
	
	return this;
}
Point.prototype.translate.router = new ArgRouter();
Point.prototype.translate.router.combine(Point.route("by"), Point.route("from"));
	


Point.prototype.scale = function (/*amount, _from*/){
	var ctx = {
		amount : 1,
		from : new Point(0,0)
	};
	
	if(!Point.prototype.scale.router.route(ctx, arguments)) throw "invalid args";
	
	//console.log("amount: " + ctx.amount);
	//console.log("from: " + ctx.from);
	
	var metrics = this.distanceAndAngle(ctx.from.x, ctx.from.y);
	
	this.x = ctx.from.x + Math.cos(metrics.angle) * metrics.distance * ctx.amount;
	this.y = ctx.from.y + Math.cos(metrics.angle) * metrics.distance * ctx.amount;
	return this;
}
Point.prototype.scale.router = new ArgRouter();
Point.prototype.scale.router.combine(
	{	
		"":function(){},
		"num": function(_amount){
			this.amount = _amount;
		} 
	}, 
	Point.route("from")
);
	


Point.prototype.rotate = function (/*angle, _distance, _from*/){	
	
	var ctx = {
		angle : 0,
		distance : this.distance(),
		from : new Point(0,0)
	};	

	if(!Point.prototype.rotate.router.route(ctx, arguments)) throw "invalid args";	
		
	//console.log("angle: " + ctx.angle);
	//console.log("distance: " + ctx.distance);
	//console.log("from: " + ctx.from);
	
	this.x = ctx.from.x + Math.cos(ctx.angle) * ctx.distance;
	this.y = ctx.from.x + Math.sin(ctx.angle) * ctx.distance;
	
	return this;
}

Point.prototype.rotate.router = new ArgRouter();
Point.prototype.rotate.router.combine(
	{
		"num": function(_angle){
			this.angle = _angle;
		},
		"num, num": function(_angle, _distance){
			this.angle = _angle;
			this.distance = _distance;
		}
	}, 
	Point.route("from")
);
	




Point.unit = function(){
	return new Point(1,0);
}
Point.zero = function(){
	return new Point(0,0);
}

Point.clipAngle = function(angle){
	var pipi =  2*Math.PI;
	var t = angle / pipi;
	t = (t<0 ? Math.ceil(t) : Math.floor(t)); 
	angle -= t * pipi;
	if(angle < -Math.PI) angle = pipi + angle;
	if(angle > Math.PI) angle =  angle - pipi;
	return angle;
}
