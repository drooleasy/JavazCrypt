/**
 * a rectangle
 * @constcuctor
 * @param {number} x x coordinate of the rectangle
 * @param {number} y y coordinate of the rectangle
 * @param {number} w width of the rectangle
 * @param {number} h height of the rectangle
 */
function Rect(x,y,w,h){
		this.x = x;
		this.y = y;
		this.w = w;
		this.h = h;
}

/**
 * get a point from interpolating factor of this rectangle
 * @param {number} i the horizontal interpolation factor (can also be "left" "center" or "right"
 * @param {number} j the vertical interpolation factor (can also be "top" "center" or "bottom"
 * @return {object} the interpolated point (x-y)
 */
Rect.prototype.getPoint = function (i,j){
	
	var ii, jj;
	
	if(i=="left") 	ii=0;
	else if(i=="center") ii=0.5;
	else if(i=="right") 	ii=1;
	else ii = i

	if(j=="top") 	jj=0;
	else if(j=="center") jj=0.5;
	else if(j=="bottom") jj=1;
	else jj = j;
	
	return {
		x: this.x + ii * this.w, 
		y: this.y + jj * this.h 
	};
}

/**
 * get a point from interpolating factor of this rectangle, from its center
 * @param {number} i the horizontal interpolation factor (can also be "left" "center" or "right"
 * @param {number} j the vertical interpolation factor (can also be "top" "center" or "bottom"
 * @return {object} the interpolated point (x-y)
 */

Rect.prototype.getPointFromCenter = function(i,j){
	
	if(i=="left") i = -1;
	if(i=="center") i = 0;
	if(i=="right") i = 1;

	if(j=="top") j = -1;
	if(j=="center") j = 0;
	if(j=="bottom") j = 1;

	var center = this.getPoint("center", "center");
	
	return {
		x: center.x + i * this.w, 
		y: center.y + j * this.h 
	};
}

/**
 * return the vertical points
 * @return {array} array of arrays. the first contains bottom and top left, the second bottom and top right
 */
Rect.prototype.verticals = function() { 
	return [
		[ [this.x, this.y], [this.x,this.y+this.h] ],
		[ [this.x+this.w, this.y], [this.x+this.w,this.y+this.h] ]
	];
}

/**
 * return the vertical points
 * @return {array} array of arrays. the first contains bottom left and right, the second top left and right
 */
Rect.prototype.horizontals = function() { 
	return [
		[ [this.x, this.y], [this.x+this.w, this.y] ],
		[ [this.x, this.y+this.h], [this.x+this.w, this.y+this.h] ]
	];
}

/**
 * return the vertical points
 * @return {array} array of arrays. the first contains bottom left and top right, the second top left and bottom right
 */
Rect.prototype.diagonals = function() { 
	return [
		[ [this.x, this.y], [this.x+this.w, this.y+this.h] ],
		[ [this.x, this.y+this.h], [this.x+this.w, this.y] ]
	];
}

/**
 * checks if this rectangle is higher than wide
 * @return {boolean} true if the rectangle if higher than wide
 */
Rect.prototype.isVertical = function(){
	return this.h > this.w;
}

/**
 * checks if this rectangle is wider than high
 * @return {boolean} true if the rectangle if wider than high
 */
Rect.prototype.isHorizontal = function(){
	return this.w > this.h;
}

/**
 * checks if the rectangle is a square
 * @return {boolean} true if he's as high as wide
 */
Rect.prototype.isSquare = function(){
	return this.w == this.h;
}
