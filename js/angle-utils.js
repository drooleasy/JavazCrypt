/**
 * a constant to avoid multiple multiplications
 */
var PIPI = 2*Math.PI;

/**
 * convert angle in degree to radians
 * @param {number} deg the angle in degree
 * @return {number} the angle in radian
 */
function deg2rad(deg){
	return deg*Math.PI/180;
}

/**
 * convert angle in radian to degree
 * @param {number} rad the angle in radian
 * @return {number} the angle in degree
 */
function rad2deg(rad){
	return rad*180/Math.PI;
}


function display(msg, dontClear){
	var dbg = document.getElementById("dbg-info");
	if(dbg) dbg.innerHTML = (!!dontClear ?  dbg.innerHTML + "<br/>" : "") + msg;
}


/**
 * give the number of full-turn in an angle
 * @param {number} angle the angle
 * @return {number} the (float) number of turns
 */
function turns(angle){
	return angle / (PIPI);
}

/**
 * clip an angle betwwen -180° and +180°
 * @param {number} angle the angle to clip
 * @return {number} the clipped angle
 */
function clipAngle(angle){
	var t = turns(angle);
	t = (t<0 ? Math.ceil(t) : Math.floor(t));
	angle -= t * PIPI;
	if(angle < -Math.PI) angle = PIPI + angle;
	if(angle > Math.PI) angle =  angle - PIPI;
	return angle;
	// angle > 0 == to the right
	// angle < 0 == to the left
}

/**
 * clip an angle betwwen 0° and +360°
 * @param {number} angle the angle to clip
 * @return {number} the clipped angle
 */

function clipAnglePositive(angle){
	var turns = angle / (2*Math.PI);
	turns = (turns<0 ? Math.ceil(turns) : Math.floor(turns));
	angle -= turns * 2*Math.PI;
	if(angle < 0) angle = PIPI + angle ;
	return angle;
}

/**
 * clip an angle betwwen -360° and 0°
 * @param {number} angle the angle to clip
 * @return {number} the clipped angle
 */

function clipAngleNegative(angle){
	var turns = angle / PIPI;
	turns = (turns<0 ? Math.ceil(turns) : Math.floor(turns));
	angle -= turns * PIPI;
	if(angle < 0) angle = PIPI + angle ;
	return angle - PIPI;
}


/**
 * compute the angle between two points
 * @param  {number} from_x start point x-coordiante
 * @param  {number} from_y start point y-coordiante
 * @param  {number} to_x   other point x-coordiante
 * @param  {number} to_y   other point y-coordiante
 * @return {number}        the angle in radians, cliped to [-180°,180°]
 */
function angleBetween(from_x,from_y, to_x,to_y){
	var dx = to_x - from_x,
		dy = to_y - from_y;
	return clipAngle(Math.atan2(dy,dx));
}

/**
 * compute the distance between two point
 * @param  {number} from_x start point x-coordiante
 * @param  {number} from_y start point y-coordiante
 * @param  {number} to_x   other point x-coordiante
 * @param  {number} to_y   other point y-coordiante
 * @return {number}        the distance
 */
function distanceBetween(from_x,from_y, to_x,to_y){
	var dx = to_x - from_x,
		dy = to_y - from_y;
	return Math.sqrt(dx*dx+dy*dy);
}

/**
 * compute the distance and angle between two points in one swipe, for performance reason
 * @param  {number} from_x start point x-coordiante
 * @param  {number} from_y start point y-coordiante
 * @param  {number} to_x   other point x-coordiante
 * @param  {number} to_y   other point y-coordiante
 * @return {object}        with properties distance and angle
 */

function distanceAndAngle(from_x,from_y, to_x,to_y){
	var dx = to_x - from_x,
		dy = to_y - from_y,
		distance = Math.sqrt(dx*dx+dy*dy),
		angle = clipAngle(Math.atan2(dy,dx));
	return {
		distance : distance,
		angle : angle
	};
}

/**
 * compute the sin, cosine and quadrant of an angle
 * @param {number} angle the angle
 * @return {object} with properties cos, sin, x(1=left, 0=right), y(1=top, 0=bottom), isTop, isLeft, isRight, isBottom
 */
function quadrant(angle){

	var cos = Math.cos(angle),
		sin = Math.sin(angle),
		res = {
		cos: cos,
		sin: sin,
		x: (cos > 0 ? 0 : 1),
		y: (sin > 0 ? 1 : 0)
	};

	res.isTop = (res.y == 0);
	res.isLeft = (res.x == 0);
	res.isDown = (res.y == 1);
	res.isRight = (res.x == 1);

	return res;
}

/**
 * compute sin and cos an angle
 * @param {number} angle the angle
 * @return {object} with propeties x for cos and y for sin
 */
function cossin(angle){
	return {
		x: Math.cos(angle),
		y: Math.sin(angle)
	}
}
