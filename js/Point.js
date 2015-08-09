;//console.log("loading point");
var Point = ArgRouter.decorate(
	{},
	"", function(){
		this.x = 0; 
		this.y = 0;
	},
	"arr", function(arr){
		this.x = arr[0]; 
		this.y = arr[1];
	},
	"obj.x.y", function(point){
		this.x = point.x; 
		this.y = point.y;
	},
	"num, num", function(arr){
		this.x = parseFloat(arguments[0] || 0);
		this.y = parseFloat(arguments[1] || 0);
	},
	function Point(ctx){
		//console.log("ctx");
		//console.log(ctx);
		ctx.__merge__(this);
		
	}
);

//console.log(!!Point);

Point.route = function(key){
	return { 
		"":function(){
			this[key] = new Point(0,0);
		},
		"obj.x.y": function(pseudopoint){
			this[key] = pseudopoint.clone();
		},
		"num, num": function(x,y){
			this[key] = new Point(parseFloat(x),parseFloat(y));
		},
		"arr":function(arr){
			this[key] = new Point(parseFloat(arr[0]), parseFloat(arr[1]));
		}
	}
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

Point.prototype.dot = ArgRouter.decorate(
	{
		from : new Point(0,0)
	},
	ArgRouter.combine(Point.route("from")),
	function dot(ctx){
		return this.x * ctx.from.x + this.y * ctx.from.y
	}
);

Point.prototype.cross = ArgRouter.decorate(
	{
		from : new Point(0,0)
	},
	ArgRouter.combine(Point.route("from")),
	function cross(ctx){
		return this.x * ctx.from.y - this.y * ctx.from.x;

	}
);


Point.prototype.distanceAndAngle =  ArgRouter.decorate(
	{
		from : new Point(0,0)
	},
	ArgRouter.combine(Point.route("from")),
	function distanceAndAngle(ctx){
		var dx = ctx.from.x - this.x,
			dy = ctx.from.y - this.y,
			distance = Math.sqrt(dx*dx+dy*dy),
			angle = Point.clipAngle(Math.atan2(dy,dx));
		return {
			distance : distance,
			angle : angle
		};
	}
);

Point.prototype.angle =  ArgRouter.decorate(
	{
		from : new Point(0,0)
	},
	ArgRouter.combine(Point.route("from")),
	function angle(ctx){
		var dx = ctx.from.x - this.x,
			dy = ctx.from.y - this.y;
		return Point.clipAngle(Math.atan2(dy,dx));

	}
);

Point.prototype.distance = ArgRouter.decorate(
	{
		from : new Point(0,0)
	},
	ArgRouter.combine(Point.route("from")),
	function distance(ctx){		
		var dx = ctx.from.x - this.x,
			dy = ctx.from.y - this.y;
		return Math.sqrt(dx*dx+dy*dy);

	}
);






Point.prototype.translate = ArgRouter.decorate(
	{
		by : new Point(0,0),
		from : this
	},
	ArgRouter.combine(
		Point.route("by"), 
		Point.route("from")
	),
	function translate (ctx){	
		this.x = ctx.from.x + ctx.by.x;
		this.y = ctx.from.y + ctx.by.y;
		return this;
	}
);
	


Point.prototype.scale = ArgRouter.decorate(
	{
		amount : 1,
		from : new Point(0,0)
	},
	ArgRouter.combine(
		{	
			"":function(){},
			"num": function(_amount){
				this.amount = _amount;
			} 
		}, 
		Point.route("from")
	),
	function  scale(ctx){
			
		var metrics = this.distanceAndAngle(ctx.from.x, ctx.from.y);
		
		this.x = ctx.from.x + Math.cos(metrics.angle) * metrics.distance * ctx.amount;
		this.y = ctx.from.y + Math.cos(metrics.angle) * metrics.distance * ctx.amount;
		return this;
	}
);	


Point.prototype.rotate = ArgRouter.decorate(
	{
		angle : null,
		distance : null,
		from : new Point(0,0)
	},
	ArgRouter.combine(
		{
			"": function(){
				this.angle = 0;
				this.distance = this.__this__.distance();
			},
			"num": function(_angle){
				this.angle = _angle;
				this.distance = this.__this__.distance();
			},
			"num, num": function(_angle, _distance){
				this.angle = _angle;
				this.distance = _distance;
			}
		},
		Point.route("from")
	), 
	function rotate(ctx){	
		this.x = ctx.from.x + Math.cos(ctx.angle) * ctx.distance;
		this.y = ctx.from.x + Math.sin(ctx.angle) * ctx.distance;	
		return this;
	}
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
