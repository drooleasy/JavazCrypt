/**
 * Axialy Aligned Bounding Box model
 * @constructor
 * @param {number} x top-left x-coordiante
 * @param {number} y top-left y-coordiante
 * @param {number} w width
 * @param {number} h height
 */
function AABB(x, y, w, h){
	this.x = x;
	this.y = y;
	this.w = w;
	this.h = h;
};

/**
 * Returns wheter an AABB intersects with another
 * @param {AABB} other the other AABB
 * @return {boolean} true is the two AABBs intersects, else false
 */
AABB.prototype.intersects = function(other){
	if(!other instanceof AABB) throw "argument is not an AABB";
	var dontIntersects = (
		this.x > other.x + other.w
		|| this.x + this.w < other.x
		|| this.y > other.y + other.h
		|| this.y + this.h < other.y
	);
	return !dontIntersects;

};

//console.log("loaded AABB");
