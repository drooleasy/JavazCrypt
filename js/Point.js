;//console.log("loading point");
/**
 * Model for 2D point and vectors
 * @constructor
 * @param {number} x the x coordinate
 * @param {number} y the y coordinate
 */
var Point = function Point(x, y){
	this.x = x;
	this.y = y;
};


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
 * @param {number} x the x coordinate of the other point
 * @param {number} y the y coordinate of the other point
 * @return {number} the dot product
 */
Point.prototype.dot = function dot(x,y){
	return this.x * x + this.y * y
};

/**
 * compute the cross product of the point with another point
 * @param {number} x the x coordinate of the other point
 * @param {number} y the y coordinate of the other point
 * @return {number}         the cross product
 */
Point.prototype.cross = function cross(x, y){
	return this.x * y - this.y * x;
};

/**
 * compute distance and angle betwwen the point and another
 * @param {number} x the x coordinate of the other point
 * @param {number} y the y coordinate of the other point
 * @return {object}         with distanceand angle properties
 */
Point.prototype.distanceAndAngle =  function distanceAndAngle(x, y){
	var dx = x - this.x,
		dy = y - this.y,
		distance = Math.sqrt(dx*dx+dy*dy),
		angle = Point.clipAngle(Math.atan2(dy,dx));
	return {
		distance : distance,
		angle : angle
	};
};
/**
 * compute the angle with another point
 * @param {number} x the x coordinate of the other point
 * @param {number} y the y coordinate of the other point
 * @return {number}         the angle
 */
Point.prototype.angle = function angle(x, y){
	var dx = x - this.x,
		dy = y - this.y;
	return Point.clipAngle(Math.atan2(dy,dx));

};
/**
 * compute the distance with another point
 * @param {number} x the x coordinate of the other point
 * @param {number} y the y coordinate of the other point
 * @return {number}         the distance
 */

Point.prototype.distance = function distance(x, y){
	var dx = ctx.from.x - this.x,
		dy = ctx.from.y - this.y;
	return Math.sqrt(dx*dx+dy*dy);

};





/**
 * translates a point
 * @param {number} x the x distance to translate by
 * @param {number} y the y distance to translate by
 * @return {Point} this point, translated
 */
Point.prototype.translate = function translate (ctx){
	this.x = this.x + x;
	this.y = this.y + y;
	return this;
};



/**
 * scales a point from an origin
 * @param {number} amount amount of scale (1 leaves point unchanged) 
 * @param {number} from_x the x origin of scale
 * @param {number} from_y the y origin of scale
 * @return {Point} the scaled point
 */

Point.prototype.scale = function  scale(amount, from_x, from_y){

	var metrics = this.distanceAndAngle(from_x, from_y);

	this.x = ctx.from.x + Math.cos(metrics.angle) * metrics.distance * amount;
	this.y = ctx.from.y + Math.cos(metrics.angle) * metrics.distance * amount;
	return this;
};

/**
 * rotates a point from an origin
 * @param {number} angle the angle to rotate
 * @param {number} distance the distance to rotate 
 * @param {number} from_x the x origin of rotation
 * @param {number} from_y the y origin of rotation
 * @return {Point} the rotated point
 */
Point.prototype.rotate =  function rotate(angle, distance, from_x, from_y){
	this.x = from_x + Math.cos(angle) * distance;
	this.y = from_x + Math.sin(angle) * distance;
	return this;
};





/**
 * return the [1,0] point
 * @return {Point} the 1,0 point
 */
Point.unit = function(){
	return new Point(1,0);
}

/**
 * return the [0,0] point
 * @return {Point} the 0,0 point
 */
Point.zero = function(){
	return new Point(0,0);
}

/**
 * return an angle cliped betwwen -PI and +PI
 * @param {number} the number to clip in radians
 * @return {number} the cliped number
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
