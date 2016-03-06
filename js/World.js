/**
 * an aggregate for the elements of the game (bobs, paths, segments, boulder, lights, player)
 * @constructor
 */ 

var World = function World(){
	this.bobs = [];
	this.paths = [];
	this.segments = [];
	this.boulders = [];
	this.lights = [];
	this.player = null;
}

/**
 * returns all the world's segments (segments, plus boulders and paths)
 * @return {array} array of all segments
 */
World.prototype.allSegments = function allSegments(){
		var res = this.segments;
		for(var i=0;i<this.paths.length;i++) res = res.concat(this.paths[i].segments);
		for(var i=0;i<this.boulders.length;i++) res = res.concat(this.boulders[i].segments);
		return res;
}
 
