function AABB(x, y, w, h){
	this.x = x;
	this.y = y;
	this.w = w;
	this.h = h;
};

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
