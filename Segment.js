function Segment(x1, y1, x2, y2){
	this.a = {x:x1, y:y1};
	this.b = {x:x2, y:y2};
	this.shadow = null;
	this.style = {
		"fill":"#000",
		"stroke":"#000000",
		"stroke-width":2,
		"stroke-linecap":"round"
	};
}

Segment.prototype.inversed = function(){
	return new Segment(this.b.x, this.b.y, this.a.x, this.a.y);
};


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


Segment.prototype.isSeenByBob = function(bob){
	
	if(	
		bob.sees({x:this.a.x, y:this.a.y, width:1})
		||
		bob.sees({x:this.b.x, y:this.b.y, width:1})
	) return true;
	var fov = bob.fovSegments(),
		intersect_1 = this.intersect(fov.left),	
		intersect_2 = this.intersect(fov.right),
		intersect_cone = this.intersectWithCone(bob.x, bob.y, bob.sightLength, bob.angle, bob.sightWidth);
	return intersect_1 != null || intersect_2 != null || intersect_cone.length > 0;
}


Segment.prototype.seenSegment = function(bob){
	var sees_a = false,
		sees_b = false,
		res = [];

	var a = {x:this.a.x, y:this.a.y, width:2};
	if(bob.sees(a) || bob.feels(a)) sees_a = true; 
	
	var b = {x:this.b.x, y:this.b.y, width:2}
	if(bob.sees(b) || bob.feels(b)) sees_b = true;

	var angle_a, angle_b, angle_inter, angle_inter_1, angle_inter_2, left, rigth;

	
	if(sees_a && sees_b){
		res =  [new Segment(this.a.x, this.a.y, this.b.x, this.b.y)];
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
			angle_inter_min = clipAngle(distanceAndAngle(bob.x,bob.y, intersects[0].x, intersects[0].y).angle - bob.angle);
			angle_inter_max = angle_inter_min;
			left = intersects[0];
			right = intersects[0];

			for(i=1;i<intersects.length;i++){
				var angle_inter = clipAngle(distanceAndAngle(bob.x,bob.y, intersects[i].x, intersects[i].y).angle - bob.angle);
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

Segment.prototype.draw = function(paper){
	var ctx = paper.getContext("2d");
	ctx.beginPath();
	ctx.moveTo(this.a.x, this.a.y);
	ctx.lineTo(this.b.x, this.b.y);
	ctx.stroke();
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


Segment.prototype.intersectWithCone = function(cx,cy,cr, angle, fov_angle){
	var possibles = this.intersectWithCircle(cx,cy,cr);
	if(possibles == null) return [];
	var i=0;
	var intersects = [];
	for(;i<possibles.length;i++){
		
		
		var angle_points = distanceAndAngle(cx, cy, possibles[i].x, possibles[i].y).angle;
		
		var angle_relative = clipAngle(angle_points - angle);
		
		if((-fov_angle/2) <= angle_relative && angle_relative <= fov_angle/2){
			intersects.push(possibles[i]);
		}
	}
	return intersects;
}

Segment.prototype.castShadow = function castSegmentShadow(player){
	var angle_a = distanceAndAngle(player.x, player.y, this.a.x, this.a.y).angle - player.angle,
		angle_b = distanceAndAngle(player.x, player.y, this.b.x, this.b.y).angle - player.angle;

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

	
	var ray_1 = castRay(player.x, player.y, left.x, left.y, player.sightLength);
	var ray_2 = castRay(player.x, player.y, right.x, right.y, player.sightLength);
	
	var angle_1 = distanceAndAngle(player.x, player.y, ray_1.a.x, ray_1.a.y).angle,
		angle_2 = distanceAndAngle(player.x, player.y, ray_2.a.x, ray_2.a.y).angle;
	
	
	var coneData = {
			x:player.x,
			y:player.y,
			ray_1 : ray_1,
			ray_2 : ray_2,
			angle_1 : angle_1,
			angle_2 : angle_2,
			radius : player.sightLength
		}

	
	player.shadow.paths.push(coneData);

}
