function Door(x1, y1, x2, y2){
	this.a = {x:x1, y:y1};
	this.b = {x:x2, y:y2};
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
}


Door.prototype.intersect = function (other){
	var segs = this.subSegments();
	for(var i=0; i<segs.length;i++){
		var inter = segs[i].intersect(other);
		if(inter) return inter;
	}
	return null;

}

Door.speed = 1/66;

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


Door.prototype.isSeenByBob = function(bob, segments){
	var subs = this.subSegments();
	var res = false;
	for(var i=0; i<subs.length;i++) res = res || subs[i].isSeenByBob(bob, segments);
	return res;
}


Door.prototype.seenSegment = function(bob){
	var subs = this.subSegments(),
		res = subs[0].seenSegment(bob);
	res = res.concat(subs[1].seenSegment(bob));
	return res;
}

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

Door.prototype.draw = function(paper){
	var ctx = paper.getContext("2d");
	
	var segs = this.subSegments();
	
	ctx.beginPath();
	
	segs[0].draw(paper);
	segs[1].draw(paper);
}


Door.prototype.castShadow = function castDoorShadow(bob_or_light){
	var segs = this.subSegments();
	for(var i=0;i<segs.length;i++){
	
		segs[i].castShadow(bob_or_light);
	}
}
