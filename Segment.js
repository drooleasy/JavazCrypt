function Segment(x1, y1, x2, y2){
	this.a = {x:x1, y:y1};
	this.b = {x:x2, y:y2};
}


Segment.prototype.closestPointFrom = function(x,y){
	
	function closest_point_on_seg(seg, circ_pos){
		var seg_v = {x:(seg.b.x - seg.a.x), y:(seg.b.y - seg.a.y)},
			pt_v = {x:(circ_pos.x - seg.a.x), y:(circ_pos.y - seg.a.y)},
			seg_v_len = Math.sqrt(seg_v.x*seg_v.x + seg_v.y*seg_v.y);
		if(seg_v_len <= 0){
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

Segment.prototype.path = function(){
	return "M" + this.a.x+" "+this.a.y + "L" + this.b.x+" "+this.b.y;
}



Segment.prototype.isSeenByBob = function(bob){
	
	if(
		bob.sees({x:this.a.x, y:this.a.y, width:1})
		||
		bob.sees({x:this.b.x, y:this.b.y, width:1})
	) return true;
	var fov = bob.fovSegments(),
		intersect_1 = this.intersect(fov.left),	
		intersect_2 = this.intersect(fov.right);
	return intersect_1 != null || intersect_2 != null;	
}


Segment.prototype.seenSegment = function(bob){
	var sees_a = false,
		sees_b = false;
	if(bob.sees({x:this.a.x, y:this.a.y, width:1})) sees_a = true; 
	if(bob.sees({x:this.b.x, y:this.b.y, width:1})) sees_b = true;
	
	if(sees_a && sees_b) return new Segment(this.a.x, this.a.y, this.b.x, this.b.y);
	
	var fov = bob.fovSegments(),
		intersect_1 = this.intersect(fov.left),	
		intersect_2 = this.intersect(fov.right);
	
	if(intersect_1 && intersect_2) return new Segment(intersect_1.x, intersect_1.y, intersect_2.x, intersect_2.y);
	
	var inter = intersect_1 || intersect_2;
	if(sees_a && inter){
		return new Segment(this.a.x, this.a.y, inter.x, inter.y);
	}
	if(sees_b && inter){
		return new Segment(this.b.x, this.b.y, inter.x, inter.y);
	}
	return null;
}

Segment.prototype.draw = function(paper){
	paper.path(this.path()).attr({
		"fill":"#000",
		"stroke":"#000000",
		"stroke-width":2
	});
}





function crossProduct(a,b){
	return a.x * b.y - a.y * b.x;
}


function minus(a,b){
	return {
		x: (a.x - b.x),
		y: (a.y - b.y)
	};
}

Segment.prototype.intersect = function (other){

	var this_v = minus(this.b, this.a);
	var other_v = minus(other.b, other.a);
	var diff = minus(other.a, this.a);
	var x = crossProduct(this_v, other_v);
	var t = crossProduct(diff, other_v) / x;
	var _u = crossProduct(diff, this_v);
	var u = _u / x;
	
	if(x==0 && _u == 0){ // colinear
		//console.log("colinear");
		return null; // !!!
	}
	
	if(x==0 && _u != 0){ // parallel
		//console.log("parallel");
		return null;
	}
	
	if(x!=0 && 0<=t && t<=1 && 0<=u && u<=1){
		//console.log("secant"); 
		return {
				x:(this.a.x + t * this_v.x),
				y:(this.a.y + t * this_v.y)
		};
	}
	//console.log("default");
	return null;
}

Segment.prototype.intersectWithCircle = function(cx,cy,cr){
	var v = minus(this.b,this.a),
		vx = v.x,
		vy = v.y,
		ox = this.a.x,
		oy = this.a.y;
		
	var res = solveP2(
		(vx*vx+vy*vy),
		(2*ox*vx - 2*vx*cx + 2*oy*vy - 2*vy*cy),
		(ox*ox + oy*oy - 2*ox*cx -2*oy*cy + cx*cx + cy*cy - cr*cr)
		
	);
	
	if(res.length == 0) return null;
	
	var sol = [];
	if(0<=res[0] && res[0]<=1){
		sol.push({
			x: (this.a.x + res[0] * vx),
			y: (this.a.y + res[0] * vy)
		});
	}
	if(0<=res[1] && res[1]<=1){
		sol.push({
			x: (this.a.x + res[1] * vx),
			y: (this.a.y + res[1] * vy)
		});
	}
	if(sol.length == 0) return null;
	
	return sol;
	
}


Segment.prototype.intersectWithCone = function(cx,cy,cr, angle, fov_angle){
	var possibles = this.intersectWithCircle(cx,cy,cr);
	if(possibles == null) return [];
	var i=0;
	var intersects = [];
	for(;i<possibles.length;i++){
		
		
		var angle_points = distanceAndAngle(cx, cy, possibles[i].x, possibles[i].y).angle;
		// console.log("absolu: " + rad2deg(angle_points))
		
		var angle_relative = angle_points - angle;
		// console.log("relatif: " + rad2deg(angle_relative))
		if((-fov_angle/2) <= angle_relative && angle_relative <= fov_angle/2){
			intersects.push(possibles[i]);
		}
	}
	return intersects;
}
