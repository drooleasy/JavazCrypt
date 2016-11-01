/**
 * a segment (for a wall, a boulde side....)
 * @constructor
 * @param {number} ax first extremity x cordinate
 * @param {number} ay first extremity y cordinate
 * @param {number} bx second extremity x cordinate
 * @param {number} by second extremity y cordinate
 */
var Segment = function Segment(ax, ay, bx, by){
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
};

/**
 * build a new segment with this one's saped ends
 * @return {Segement} the swaped version of this segment
 */
Segment.prototype.inversed = function(){
	return new Segment(this.b.x, this.b.y, this.a.x, this.a.y);
};

/**
 * clones this segment
 * @return {Segment} the cloned segment
 */
Segment.prototype.clone = function(){
	return new Segment(this.a.x, this.a.y, this.b.x, this.b.y);
}

/**
 * string representation
 * @return {string} the string representation
 */
Segment.prototype.toString = function toString(){
	return "Segment("+ this.a.x + ", " +this.a.y + ", " + this.b.x + ", " +this.b.y +")";
}

/**
 * return the closest point on this segment to another point
 * @param {numer} x x coordinate of the exterior point
 * @param {number} y y coordinate of the exterior point
 * @return {object} the x-y closest point on this segment
 */
Segment.prototype.closestPointFrom = function(x, y){
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

};

/**
 * checks if this segment is seen by a bob
 * @param {Bob} bob the watching bob
 * @param {array} segments other segments that may go between bob and this segment
 * @return {boolean} true if this segment is at least partially seen
 */
Segment.prototype.isSeenByBob = function(bob, segments){

	if(
		bob.sees({x:this.a.x, y:this.a.y, width:1}, segments)
		||
		bob.sees({x:this.b.x, y:this.b.y, width:1}, segments)
	) return true;
	var fov = bob.fovSegments(),
		intersect_1 = this.intersect(fov.left),
		intersect_2 = this.intersect(fov.right),
		intersect_cone = this.intersectWithCone(bob.x, bob.y, bob.sightLength, bob.angle, bob.sightWidth);
	return intersect_1 != null || intersect_2 != null || intersect_cone.length > 0;
}

/**
 * calculates the subportion of this segement that is seen by a bob
 * @param {Bob} bob the lurking bob
 * @param {array} segments other segments that may go between bob and this segment
 * @return {array} sub-segments that are being seen by the bob
 */
Segment.prototype.seenSegment = function(bob, segments){
	var sees_a = false,
		sees_b = false,
		res = [];

	var a = {x:this.a.x, y:this.a.y, width:2};
	if(bob.sees(a, []) || bob.feels(a)) sees_a = true;

	var b = {x:this.b.x, y:this.b.y, width:2}
	if(bob.sees(b, []) || bob.feels(b)) sees_b = true;

	var angle_a, angle_b, angle_inter, angle_inter_1, angle_inter_2, left, rigth;


	if(sees_a && sees_b){
		res =  [this.clone()];
	}else{


		var fov = bob.fovSegments(),
			intersect_1 = this.intersect(fov.left),
			intersect_2 = this.intersect(fov.right),
			intersect_cone = this.intersectWithCone(bob.x, bob.y, bob.sightLength, bob.angle, bob.sightWidth);

		var intersects = [];
		if(intersect_1) intersects.push(intersect_1);
		if(intersect_2) intersects.push(intersect_2);
		for(i=0;i<intersect_cone.length;i++){
			intersects.push(intersect_cone[i]);
		}


		if(intersects.length > 1){
			angle_inter_min = clipAngle(angleBetween(bob.x,bob.y, intersects[0].x, intersects[0].y) - bob.angle);
			angle_inter_max = angle_inter_min;
			left = intersects[0];
			right = intersects[0];

			for(i=1;i<intersects.length;i++){
				var angle_inter = clipAngle(angleBetween(bob.x,bob.y, intersects[i].x, intersects[i].y) - bob.angle);
				if(angle_inter < angle_inter_min){
					angle_inter_min = angle_inter;
					right = intersects[i];
				}
				if(angle_inter > angle_inter_max){
					angle_inter_max = angle_inter;
					left = intersects[i];
				}
			}
			res = [new Segment(left.x, left.y, right.x, right.y)];
		}else if(intersects.length==1){

			var inter = intersects[0];

			if(sees_a){
				res =  [new Segment(this.a.x, this.a.y, inter.x, inter.y)];
			}else if(sees_b){
				res =  [new Segment(this.b.x, this.b.y, inter.x, inter.y)];
			}else{
				res = [new Segment(inter.x, inter.y, this.b.x, this.b.y)];
			}
		}

		var intersect_conscious = this.intersectWithCircle(bob.x, bob.y, bob.width*bob.consciousness);

		if(intersect_conscious.length==2){
			res.push(new Segment(intersect_conscious[0].x, intersect_conscious[0].y, intersect_conscious[1].x, intersect_conscious[1].y));
		}

		if(intersect_conscious.length==1){
			inter = intersect_conscious[0];
			if(sees_a){
				res.push(new Segment(this.a.x, this.a.y, inter.x, inter.y));
			}else if(sees_b){
				res.push(new Segment(this.b.x, this.b.y, inter.x, inter.y));
			}else{
				res.push(new Segment(inter.x, inter.y, this.b.x, this.b.y));
			}
		}

	}
	return res;
}

/**
 * draw this segement on canvas
 * @param {object} paper the canvas dom node
 * @param {boolean} dontStroke wether to begin and close the segment path (default to false)
 */
Segment.prototype.draw = function(paper, dontStroke){
	var ctx = paper.getContext("2d");
	if(!dontStroke) ctx.beginPath();
	if(!dontStroke) ctx.moveTo(this.a.x, this.a.y);
	ctx.lineTo(this.b.x, this.b.y);
	if(!dontStroke) ctx.stroke();
}

/**
 * given one end, return the other
 * @param (Point} p one end
 * @return {Point} the other end
 */
Segment.prototype.otherPoint = function(p){
	if(p===this.a) return this.b;
	if(p===this.b) return this.a;
	return null;
}

/**
 * check if this segment intersects with another
 * @param {Segment} other the pther segment
 * @return {point|null} null if the segments dont intersects (or are colinear), the intersection point otherwise
 */
Segment.prototype.intersect = function (other){

	var this_v = minus(this.b, this.a);
	var other_v = minus(other.b, other.a);
	var diff = minus(other.a, this.a);
	var x = crossProduct(this_v, other_v);
	var t = crossProduct(diff, other_v) / x;
	var _u = crossProduct(diff, this_v);
	var u = _u / x;

	if(x==0 && _u == 0){ // colinear
		return null; // !!!
	}

	if(x==0 && _u != 0){ // parallel
		return null;
	}

	if(x!=0 && 0<=t && t<=1 && 0<=u && u<=1){ // secant
		return {
				x:(this.a.x + t * this_v.x),
				y:(this.a.y + t * this_v.y)
		};
	}

	return null;
}

/**
 * compute the intersection with a circle
 * @param {number} cx the circle's center x
 * @param {number} cy the circle's center y
 * @param {number} cr the circle's radius
 * @return {array} an array of the 0, 1 or 2 intersection points
 */
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

	var sol = [];

	if(res.length == 0) return sol;

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

	return sol;

}

/**
 * compute the intersection with a cone
 * @param {number} cx the cone x coordinate
 * @param {number} cy the cone y coordinate
 * @param {number} cr the cone radius
 * @param {number} angle the cone's angle
 * @param {number} fov_angle the cone aperture
 * @return {array} the intersection points (or an empty array)
 */
Segment.prototype.intersectWithCone = function(cx,cy,cr, angle, fov_angle){
	var possibles = this.intersectWithCircle(cx,cy,cr);
	if(possibles == null) return [];
	var i=0;
	var intersects = [];
	for(;i<possibles.length;i++){


		var angle_points = angleBetween(cx, cy, possibles[i].x, possibles[i].y);

		var angle_relative = clipAngle(angle_points - angle);

		if((-fov_angle/2) <= angle_relative && angle_relative <= fov_angle/2){
			intersects.push(possibles[i]);
		}
	}
	return intersects;
}

/**
 * calculate the shadows that a light project from this segment
 * @param {Light} bob_or_light a bob (carrying a light) or a light source
 */
Segment.prototype.castShadow = function castSegmentShadow(bob_or_light){
	var metrics_a = distanceAndAngle(bob_or_light.x, bob_or_light.y, this.a.x, this.a.y),
		metrics_b = distanceAndAngle(bob_or_light.x, bob_or_light.y, this.b.x, this.b.y);


	var angle_a = metrics_a.angle - bob_or_light.angle,
		angle_b = metrics_b.angle - bob_or_light.angle;

	var distance_a = metrics_a.distance,
		distance_b = metrics_b.distance;

	angle_a = clipAnglePositive(angle_a);
	angle_b = clipAnglePositive(angle_b);


	var mn = Math.min(angle_a, angle_b);
	var mx = Math.max(angle_a, angle_b);



	var left,
		right;
	if(mn==angle_a){
		left = this.a;
		right = this.b;
	}else{
		left = this.b;
		right = this.a
	}


	var diff = clipAnglePositive(mx-mn);
	var tmp;
	if(diff > Math.PI){
		tmp = left;
		left = right;
		right = tmp;
	}


	var ray_1 = castRay(bob_or_light.x, bob_or_light.y, left.x, left.y, bob_or_light.sightLength);
	var ray_2 = castRay(bob_or_light.x, bob_or_light.y, right.x, right.y, bob_or_light.sightLength);

	var angle_1 = angleBetween(bob_or_light.x, bob_or_light.y, ray_1.a.x, ray_1.a.y),
		angle_2 = angleBetween(bob_or_light.x, bob_or_light.y, ray_2.a.x, ray_2.a.y);


	var coneData = {
			x:bob_or_light.x,
			y:bob_or_light.y,
			ray_1 : ray_1,
			ray_2 : ray_2,
			angle_1 : angle_1,
			angle_2 : angle_2,
			radius : bob_or_light.sightLength
		}


	bob_or_light.shadow.paths.push(coneData);

}

/**
 * compute the AABB for this segment
 * @param {number} tolerance a scale factor for the AABB
 * @return {AABB} the AABB for this segment
 */
Segment.prototype.AABB = function segmentAABB(tolerance){
	tolerance = tolerance || 1;
	var topLeft = {
		x : Math.min(this.a.x, this.b.x),
		y : Math.min(this.a.y, this.b.y),
	}
	var w = Math.abs(this.a.x - this.b.x)
	var h = Math.abs(this.a.y - this.b.y)

	var w2 = w*tolerance;
	var h2 = h*tolerance;

	topLeft.x += (w-w2)/2;
	topLeft.y += (h-h2)/2;

	var thickness = this.style["line-width"];

	return new AABB(
		topLeft.x - thickness,
		topLeft.y - thickness,
		Math.max(w2, thickness),
		Math.max(h2, thickness)
	);

}
