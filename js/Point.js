;//console.log("loading point");
/**
 * Model for 2D point and vectors
 * can take 0 parameter (for 0,0)
 * or an array of length 2 for x and y
 * or an object with x and y-properties
 * or two numbers for x and y
 * @constructor
 */
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
/**
 * return an ArgRouter router for a Point
 * defined by either no arg, an x-/y-object, two numbers or an array
 * @param {string} key the key to witch assign the point in the ArgRouter context
 * @return {object} a Point route
 */
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


/**
 * nice formating for debug
 */
Point.prototype.toString = function(){
	return "Point("+this.x.toFixed(2)+", "+this.y.toFixed(2)+")";
}

/**
 * clone the point
 */

Point.prototype.clone = function(){
	return new Point(this);
}

/**
 * return an array representaion of the point
 * @return {array} the [x,y] array
 */
Point.prototype.array = function(){
	return [this.x, this.y];
}

/**
 * pushes point coordinates n an array
 * @param  {Array} arr the array to push on
 * @return {Array}     the augmented array
 */
Point.prototype.pushOn = function(arr){
	arr.push(this.x);
	arr.push(this.y);
	return this;
}

/**
 * compute the dot product of the point with another point
 * @return {number}         the dot product
 */
Point.prototype.dot = ArgRouter.decorate(
	{
		from : new Point(0,0)
	},
	ArgRouter.combine(Point.route("from")),
	function dot(ctx){
		return this.x * ctx.from.x + this.y * ctx.from.y
	}
);

/**
 * compute the cross product of the point with another point
 * @return {number}         the cross product
 */
Point.prototype.cross = ArgRouter.decorate(
	{
		from : new Point(0,0)
	},
	ArgRouter.combine(Point.route("from")),
	function cross(ctx){
		return this.x * ctx.from.y - this.y * ctx.from.x;

	}
);

/**
 * compute distance and angle betwwen the point and another
 * @return {object}         with distanceand angle properties
 */
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
/**
 * compute the angle with another point
 * @return {number}         the angle
 */
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
/**
 * compute the distance with another point
 * @return {number}         the distance
 */

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





/**
 * return the [1,0] point
 */
Point.unit = function(){
	return new Point(1,0);
}

/**
 * return the [0,0] point
 */
Point.zero = function(){
	return new Point(0,0);
}

/**
 * return an angle cliped betwwen -PI and +PI
 */
Point.clipAngle = function(angle){
	var pipi =  2*Math.PI;
	var t = angle / pipi;
	t = (t<0 ? Math.ceil(t) : Math.floor(t));
	angle -= t * pipi;
	if(angle < -Math.PI) angle = pipi + angle;
	if(angle > Math.PI) angle =  angle - pipi;
	return angle;
}
