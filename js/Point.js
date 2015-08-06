function Point(){

	var router = new ArgRouter(this);
	router.add("", function(){
		Point.apply(this, 0, 0)
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
	var router = new ArgRouter(ctx);
	var from_route = {
		"obj.x.y": function(_from){
			this.from = _from;
		},
		"num, num": function(x,y){
			this.from = new Point(x,y);
		},
		"arr":function(arr){
			this.from = new Point(arr[0],arr[1]);
		}
	}
	
	router.combine(from_route);
	
	if(!router.route(arguments)) console.log("no route found");
	
	return this.x * ctx.from.x + this.y * ctx.from.y
}

Point.prototype.cross= function(){
	var ctx = {
		from : null
	};	
	var router = new ArgRouter(ctx);
	var from_route = {
		"obj.x.y": function(_from){
			this.from = _from;
		},
		"num, num": function(x,y){
			this.from = new Point(x,y);
		},
		"arr":function(arr){
			this.from = new Point(arr[0],arr[1]);
		}
	}
	
	router.combine(from_route);
	
	if(!router.route(arguments)) console.log("no route found");
	
	return this.x * ctx.from.y - this.y * ctx.from.x;

}



Point.prototype.distanceAndAngle = function(){
	var ctx = {
		from : new Point(0,0)
	};	
	var router = new ArgRouter(ctx);
	var from_route = {
		"":function(){},
		"obj.x.y": function(_from){
			this.from = _from;
		},
		"num, num": function(x,y){
			this.from = new Point(x,y);
		},
		"arr":function(arr){
			this.from = new Point(arr[0],arr[1]);
		}
	}
	
	router.combine(from_route);
	
	if(!router.route(arguments)) console.log("no route found");

	var dx = ctx.from.x - this.x,
		dy = ctx.from.y - this.y,
		distance = Math.sqrt(dx*dx+dy*dy),
		angle = Point.clipAngle(Math.atan2(dy,dx));
	return {
		distance : distance,
		angle : angle
	};

}

Point.prototype.angle = function(){
		var ctx = {
		from : new Point(0,0)
	};	
	var router = new ArgRouter(ctx);
	var from_route = {
		"":function(){},
		"obj.x.y": function(_from){
			this.from = _from;
		},
		"num, num": function(x,y){
			this.from = new Point(x,y);
		},
		"arr":function(arr){
			this.from = new Point(arr[0],arr[1]);
		}
	}
	
	router.combine(from_route);
	
	if(!router.route(arguments)) console.log("no route found");


	var dx = ctx.from.x - this.x,
		dy = ctx.from.y - this.y;
	return Point.clipAngle(Math.atan2(dy,dx));

}
Point.prototype.distance = function(){
	var ctx = {
		from : new Point(0,0)
	};	
	var router = new ArgRouter(ctx);
	var from_route = {
		"":function(){},
		"obj.x.y": function(_from){
			this.from = _from;
		},
		"num, num": function(x,y){
			this.from = new Point(x,y);
		},
		"arr":function(arr){
			this.from = new Point(arr[0],arr[1]);
		}
	}
	
	router.combine(from_route);
	
	if(!router.route(arguments)) console.log("no route found");

	var dx = ctx.from.x - this.x,
		dy = ctx.from.y - this.y;
	return Math.sqrt(dx*dx+dy*dy);

}





Point.prototype.translate = function (/*by, from*/){
	var ctx = {
		by : new Point(0,0),
		from : this
	};	
	var router = new ArgRouter(ctx);
	var by_route = {
		"":function(){},
		"obj.x.y": function(_by){
			this.by = _by;
		},
		"num, num": function(x,y){
			this.by = new Point(x,y);
		},
		"arr":function(arr){
			this.by = new Point(arr[0],arr[1]);
		}
	}
	var from_route = {
		"":function(){},
		"obj.x.y": function(_from){
			this.from = _from;
		},
		"num, num": function(x,y){
			this.from = new Point(x,y);
		},
		"arr":function(arr){
			this.from = new Point(arr[0],arr[1]);
		}
	}
	
	router.combine(by_route, from_route);
	
	if(!router.route(arguments)) console.log("no route found");
	//console.log("by " + ctx.by)
	//console.log("from " + ctx.from);
	
	this.x = ctx.from.x + ctx.by.x;
	this.y = ctx.from.y + ctx.by.y;
	
	return this;
}


Point.prototype.scale = function (/*amount, _from*/){
	var ctx = {
		amount : 1,
		from : new Point(0,0)
	};
	
	var router = new ArgRouter(ctx);
	var amount_route = {
		"":function(){},
		"num": function(_amount){
			this.amount = _amount;
		}
	}
	var from_route = {
		"":function(){},
		"obj.x.y": function(_from){
			this.from = _from;
		},
		"num, num": function(x,y){
			this.from = new Point(x,y);
		},
		"arr":function(arr){
			this.from = new Point(arr[0],arr[1]);
		}
	}
	router.combine(amount_route, from_route);
	if(!router.route(arguments)) console.log("no route found");
	
	//console.log("amount: " + ctx.amount);
	//console.log("from: " + ctx.from);
	
	var metrics = this.distanceAndAngle(ctx.from.x, ctx.from.y);
	
	this.x = ctx.from.x + Math.cos(metrics.angle) * metrics.distance * ctx.amount;
	this.y = ctx.from.y + Math.cos(metrics.angle) * metrics.distance * ctx.amount;
	return this;
}


Point.prototype.rotate = function (/*angle, _distance, _from*/){	
	
	var ctx = {
		angle : 0,
		distance : this.distance(),
		from : new Point(0,0)
	};	
	var router = new ArgRouter(ctx);
	var by_route = {
		"num": function(_angle){
			this.angle = _angle;
		},
		"num, num": function(_angle, _distance){
			this.angle = _angle;
			this.distance = _distance;
		}
	}
	var from_route = {
		"":function(){},
		"obj.x.y": function(_from){
			this.from = _from;
		},
		"num, num": function(x,y){
			this.from = new Point(x,y);
		},
		"arr":function(arr){
			this.from = new Point(arr[0],arr[1]);
		}
	}
	router.combine(by_route, from_route);
	
	if(!router.route(arguments)) console.log("no route found");	
		
	//console.log("angle: " + ctx.angle);
	//console.log("distance: " + ctx.distance);
	//console.log("from: " + ctx.from);
	
	this.x = ctx.from.x + Math.cos(ctx.angle) * ctx.distance;
	this.y = ctx.from.x + Math.sin(ctx.angle) * ctx.distance;
	
	return this;
}


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
