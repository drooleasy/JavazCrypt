function Glass(x1, y1, x2, y2){
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
	
	this.center = -1; // -1...1
}







Glass.prototype.isSeenByBob = function(bob){
	var subs = this.subSegments();
	var res = false;
	for(var i=0; i<subs.length;i++) res = res || subs[i].isSeenByBob(bob);
	return res;
}


Glass.prototype.seenSegment = function(bob){
	var subs = this.subSegments(),
		res = subs[0].seenSegment(bob);
	res = res.concat(subs[1].seenSegment(bob));
	return res;
}


Glass.prototype.draw = function(paper){
	var ctx = paper.getContext("2d");
	ctx.beginPath();
	ctx.moveTo(this.a.x, this.a.y);
	ctx.lineTo(this.b.x, this.b.y);

}

Glass.prototype.closestPointFrom = function(x,y){
	
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
Glass.prototype.castShadow = function castGlassShadow(bob_or_light){

}

Glass.prototype.seenSegment = function(bob){
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
