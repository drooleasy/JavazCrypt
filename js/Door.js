/**
 * A door is comprised of two segments. It can be opened or closed
 * @constructor
 * @param {number} ax first extremity x cordinate
 * @param {number} ay first extremity y cordinate
 * @param {number} bx second extremity x cordinate
 * @param {number} by second extremity y cordinate
 */
var Door = function Door(ax, ay, bx, by){
	
	this.a = {
		x:ax,
		y:ay
	};
	
	this.b = {
		x:bx,
		y:by
	};
	this.shadow = null;
	this.style = {
		"fill":"#000",
		"stroke":"#000000",
		"stroke-width":2,
		"stroke-linecap":"round"
	};
	this.openess = 0;
	
	this.center = 0; // -1...1
	this.yawness = .5;
	this.detectionDistance = 15;
};

// OO plumbing
Door.prototype = new Segment();
Door.prototype.constructor = Door;


/**
 * computes door intersection with a segment
 * @param {Segment} other the other segment
 * @return {Segment} the first segments intersection with a door's segment - or null
 */
Door.prototype.intersect = function (other){
	var segs = this.subSegments();
	for(var i=0; i<segs.length;i++){
		var inter = segs[i].intersect(other);
		if(inter) return inter;
	}
	return null;

}

/**
 * door quickness top open/close
 */
Door.speed = 1/66;

/**
 * launches animation for opening the door
 */
Door.prototype.open = function(){
	if(this.openess<1){ 
		this.openess += Door.speed;
		this.openess = Math.min(this.openess, 1);
		var that = this;
		setTimeout(function(){
			that.open.call(that);
		}, 1000/25);
	}
}


/**
 * launches animation for closing the door
 */ 
Door.prototype.close = function(){
	if(this.openess>0){ 
		this.openess -= Door.speed;
		this.openess = Math.max(this.openess, 0);
		var that = this;
		setTimeout(function(){
			that.close.call(that);
		}, 1000/25);
	}
}

/**
 * calculate the closest point on a door segments from a given point
 * @param {number} x the point x coordinate
 * @param {number} y the point y coordinate
 * @return {object} the x and y position on the door
 */  
Door.prototype.closestPointFrom = function(x,y){
	
	function closest_point_on_seg(seg, circ_pos){
		var seg_v = {x:(seg.b.x - seg.a.x), y:(seg.b.y - seg.a.y)},
			pt_v = {x:(circ_pos.x - seg.a.x), y:(circ_pos.y - seg.a.y)},
			seg_v_len = Math.sqrt(seg_v.x*seg_v.x + seg_v.y*seg_v.y);
		if(seg_v_len < 0){
			throw new Error("Invalid segment length");
		}
		var seg_v_unit = {x:(seg_v.x / seg_v_len), y:(seg_v.y / seg_v_len)},
			proj = pt_v.x * seg_v_unit.x + pt_v.y * seg_v_unit.y; // dot product
		if(proj <= 0){
			return {x: seg.a.x, y:seg.a.y};
		}
		if(proj >= seg_v_len){
			return {x: seg.b.x, y:seg.b.y};
		}
		var proj_v = {x:seg_v_unit.x * proj, y:seg_v_unit.y * proj},
			closest = {x:proj_v.x + seg.a.x, y:proj_v.y + seg.a.y};
		return closest
	}

	return closest_point_on_seg(this, {x:x,y:y});

}

/**
 * checks if door's segments are seen by a bob
 * @param {Bob} bob the lurking bob
 * @return {boolean} true if at least one segment is seen
 */
Door.prototype.isSeenByBob = function(bob){
	var subs = this.subSegments();
	var res = false;
	for(var i=0; i<subs.length;i++) res = res || subs[i].isSeenByBob(bob);
	return res;
}

/**
 * calculate the sub segments of the door that are seen by a bob
 * @param {Bob} bob the stalking bob
 * @return {array} the arrays of seen subsegments
 */
Door.prototype.seenSegment = function(bob){
	var subs = this.subSegments(),
		res = subs[0].seenSegment(bob);
	res = res.concat(subs[1].seenSegment(bob));
	return res;
}

/**
 * calculate the two segments repreasenting the door
 * @return {array} the two segments repreasenting the door
 */
Door.prototype.subSegments = function(){
	var metrics = distanceAndAngle(this.a.x, this.a.y, this.b.x, this.b.y),
		cos = Math.cos(metrics.angle),
		sin = Math.sin(metrics.angle),
		cos2 = Math.cos(Math.PI + metrics.angle),
		sin2 = Math.sin(Math.PI + metrics.angle),
		d= metrics.distance;
		
	var left = d*(1-this.openess)/2 - this.yawness;
	var right = d*(1-this.openess)/2 -this.yawness;
	
	right *= 1 - this.center;
	left  *= 1 + this.center;
	var middle = {
		x:this.a.x   + cos * left,
		y: this.a.y  + sin * left,
		x2:this.b.x  + cos2 * right,
		y2: this.b.y + sin2 * right
	}

	return [
		new Segment(this.a.x, this.a.y, middle.x, middle.y),
		new Segment(middle.x2, middle.y2, this.b.x, this.b.y)
	]
}

/**
 * draws the two segments of a door on canvas
 * @param {Object} paper canvas dom element
 */
Door.prototype.draw = function(paper){
	var ctx = paper.getContext("2d");
	
	var segs = this.subSegments();
	
	ctx.beginPath();
	
	segs[0].draw(paper);
	segs[1].draw(paper);
}

/**
 * casts door's two segment shadows
 * @param {object} the Bob or the Light to cast shadow from
 */ 
Door.prototype.castShadow = function castDoorShadow(bob_or_light){
	var segs = this.subSegments();
	for(var i=0;i<segs.length;i++){
	
		segs[i].castShadow(bob_or_light);
	}
}
