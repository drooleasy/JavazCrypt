function Segment(x1, y1, x2, y2){
	this.a = {x:x1, y:y1};
	this.b = {x:x2, y:y2};
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
		intersect_2 = this.intersect(fov.right),
		intersect_cone = this.intersectWithCone(bob.x, bob.y, bob.sightLength, bob.angle, bob.sightWidth);
	return intersect_1 != null || intersect_2 != null || intersect_cone.length > 0;
}


Segment.prototype.seenSegment = function(bob){
	var sees_a = false,
		sees_b = false;
	if(bob.sees({x:this.a.x, y:this.a.y, width:1})) sees_a = true; 
	if(bob.sees({x:this.b.x, y:this.b.y, width:1})) sees_b = true;



	var angle_a, angle_b, angle_inter, angle_inter_1, angle_inter_2, left, rigth;

	
	if(sees_a && sees_b){
		angle_a = distanceAndAngle(bob.x,bob.y, this.a.x, this.a.y).angle - bob.angle;
		angle_b = distanceAndAngle(bob.x,bob.y, this.b.x, this.b.y).angle - bob.angle;
		
		angle_a=clipAngle(angle_a);
		angle_b=clipAngle(angle_b);
		
		
		left = this.a;
		right = this.b;
		if(angle_a > angle_b){
			left = this.b;
			right = this.a;
		}
		
		return new Segment(left.x, left.y, right.x, right.y);
	}

	
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
		angle_inter_1 = distanceAndAngle(bob.x,bob.y, intersects[0].x, intersects[0].y).angle - bob.angle;
		angle_inter_2 = distanceAndAngle(bob.x,bob.y, intersects[1].x, intersects[1].y).angle - bob.angle;

		angle_inter_1=clipAngle(angle_inter_1);
		angle_inter_2=clipAngle(angle_inter_2);
	
		
		left = intersects[0];
		right = intersects[1];

		if(angle_a > angle_b){
			left = intersects[1];
			right = intersects[0];
		}
		
		return new Segment(left.x, left.y, right.x, right.y);
	}
	
	
	function addInter(p, inter, bob){
		angle = distanceAndAngle(bob.x,bob.y, p.x, p.y).angle - bob.angle;
		angle_inter = distanceAndAngle(bob.x,bob.y, inter.x, inter.y).angle - bob.angle;

		angle_a=clipAngle(angle);
		angle_inter=clipAngle(angle_inter);


		left = p;
		right = inter;
		if(angle > angle_inter){
			left = inter;
			right = p;
		}
		
		return new Segment(left.x, left.y, right.x, right.y);
		
	}

	var inter = null;

	if(intersects.length>0) inter = intersects[0];

	if(sees_a && inter){
		return addInter(this.a, inter, bob);
	}
	
	if(sees_b && inter){
		return addInter(this.b, inter, bob);
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

Segment.prototype.drawShadow = function drawSegmentShadow(player){
		var seenSeg = this.seenSegment(player);
		if(seenSeg){
			paper.path(seenSeg.path()).attr({
				"fill":"#8FF",
				"stroke":"#8FF",
				"stroke-width":3
			});
			
			var ray_1 = castRay(player.x, player.y, seenSeg.a.x, seenSeg.a.y, player.sightLength);
			var ray_2 = castRay(player.x, player.y, seenSeg.b.x, seenSeg.b.y, player.sightLength);
			
			paper.path(ray_1.path()).attr({"stroke":"#3F3", "stroke-width":3});
			paper.path(ray_2.path()).attr({"stroke":"#3F3", "stroke-width":3});
			
			
			/*var */angle_1 = distanceAndAngle(player.x, player.y, ray_1.a.x, ray_1.a.y).angle - player.angle,
				angle_2 = distanceAndAngle(player.x, player.y, ray_2.a.x, ray_2.a.y).angle - player.angle;
			
			
			startAngle =  Math.min(angle_1, angle_2);
			endAngle = Math.max(angle_1, angle_2);
			
			startAngle = angle_1;
			endAngle = angle_2;
			
			var seg  = new Segment(ray_2.a.x, ray_2.a.y, ray_1.a.x, ray_1.a.y)
			
			var path = "M" + ray_1.a.x + " " + ray_1.a.y
				+ "L" + ray_1.b.x + " " + ray_1.b.y
				+ paper.circularArc(player.x, player.y, player.sightLength, player.angle+startAngle, player.angle+endAngle) 
				+ "L" + ray_2.a.x + " " + ray_2.a.y
				+ "L" + ray_1.a.x + " " + ray_1.a.y;
			//console.log(path);
			paper.path(
				path
			).attr({"fill":"#444","stroke":"#FFF", "stroke-width":5});
			
			paper.path(
				"M" + ray_1.a.x + " " + ray_1.a.y
				+ "L" + ray_1.b.x + " " + ray_1.b.y
			).attr({"fill":"#444","stroke":"#888", "stroke-width":5});
			
		}
	}
