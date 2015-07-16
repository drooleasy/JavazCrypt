
var paper = Raphael("paper", 650, 400);
			
var player = new Bob(325, 200, 10, -45, true);
var other = new Bob(375, 220, 10, -90, false);

var drawables = [];
drawables.push(player);
drawables.push(other);

$("#paper").on("click", function(evt){
	console.log(Raphael.isPointInsidePath(player.sightPath(), evt.clientX, evt.clientY));
})


function draw(){

	paper.clear();
	
	var color = "#FFFFFF";
	if(player.sees(other)) color = "#FF0000";
	player.sightColor = color;

	for(var i =0; i<drawables.length;i++){
		drawables[i].draw(paper);
	}
	
	/*
	if(Raphael.isBBoxIntersect(Raphael.pathBBox(player.sightPath()), Raphael.pathBBox(other.bodyPath())) 
		&& Raphael.pathIntersection(player.sightPath(), other.bodyPath()).length >0){
		console.log("touch!!!");	
	}
	
	if(Raphael.isPointInsidePath(player.sightPath(), other.x, other.y)){
		console.log("in!!!");	
	}
	
	*/
	
	if(player.sees(other)){
	
		
		
		var fov = player.fovSegments(),
			intersect_1 = fov.left.intersectWithCircle(other.x, other.y, other.width),	
			intersect_2 = fov.right.intersectWithCircle(other.x, other.y, other.width);
		// var intersect_cone = this.intersectWithCone(bob.x, bob.y, bob.sightLength, bob.angle, bob.sightWidth);
		
		
		var dist_1, dist_2, secants= [];
		
		
		var closest_1 = null;
		if(intersect_1){
			closest_1 = intersect_1[0];
			if(intersect_1.length > 1){
				 dist_1 = distanceAndAngle(player.x, player.y, intersect_1[0].x, intersect_1[0].y).distance;
				 dist_2 = distanceAndAngle(player.x, player.y, intersect_1[1].x, intersect_1[1].y).distance;
				 if(dist_2 < dist_1) closest_1 = intersect_1[1]
			}
		}
		
		var angle_1 = null;
		
		
		if(closest_1){
			var ray_1 = castRay(player.x, player.y, closest_1.x, closest_1.y, player.sightLength);
			var angle_1 = distanceAndAngle(player.x, player.y, closest_1.x, closest_1.y).angle - player.angle;
			var angle_1 = clipAngle(angle_1);


			secants.push({angle:angle_1, ray:ray_1});

			ray_1.draw(paper);
		}

		
		var closest_2 = null;
		if(intersect_2){
			closest_2 = intersect_2[0];
			if(intersect_2.length > 1){
				 dist_1 = distanceAndAngle(player.x, player.y, intersect_2[0].x, intersect_2[0].y).distance;
				 dist_2 = distanceAndAngle(player.x, player.y, intersect_2[1].x, intersect_2[1].y).distance;
				 if(dist_2 < dist_1) closest_2 = intersect_2[1]
			}
		}
				
		
		var angle_2 = null;
		
		if(closest_2){
			var ray_2 = castRay(player.x, player.y, closest_2.x, closest_2.y, player.sightLength);
			
			var angle_2 = distanceAndAngle(player.x, player.y, closest_2.x, closest_2.y).angle - player.angle;
			var angle_2 = clipAngle(angle_2);

			
			
			secants.push({angle:angle_2, ray:ray_2});
			
			ray_2.draw(paper);
		}
		
		
		
		var metrics = distanceAndAngle(player.x,player.y, other.x, other.y);
		var angle = clipAngle(metrics.angle - this.angle);
		var distance = metrics.distance;
		
		var half_angle_intersept = Math.asin(other.width/distance); 
		
		var v = minus(other, player);
		
		var v_perp = {x:(-v.y), y:(v.y == 0 ? (-v.x) : v.x)}
		
		
		/*
			(v_perp.x*k)²+(v_perp.y*k)² = other.width²
			
			k² * (v_perp.x² + v_perp.y²)
			O
			-other.width² 
		*/
		var sol = solveP2(
			(v_perp.x*v_perp.x + v_perp.y*v_perp.y),
			(0),
			(-other.width*other.width) 
		
		);
		
		var angle_3 = null;
		var angle_4 = null;
		
		
		if(sol.length != 0){
			var left_side = {	
				x: (other.x + v_perp.x * sol[0]),
				y: (other.y + v_perp.y * sol[0])
			}
			var ray_3 = castRay(player.x, player.y, left_side.x, left_side.y, player.sightLength);
			ray_3.draw(paper);
			
			var angle_3 = distanceAndAngle(player.x, player.y, left_side.x, left_side.y).angle - player.angle;
			var angle_3 = clipAngle(angle_3);
			
			secants.push({angle:angle_3, ray:ray_3});

			var right_side = {	
				x: (other.x + v_perp.x * sol[1]),
				y: (other.y + v_perp.y * sol[1])
			}
			var ray_4 = castRay(player.x, player.y, right_side.x, right_side.y, player.sightLength);
			ray_4.draw(paper);


			var angle_4 = distanceAndAngle(player.x, player.y, right_side.x, right_side.y).angle - player.angle;
			var angle_4 = clipAngle(angle_4);

		
			secants.push({angle:angle_4, ray:ray_4});

		}
		
		
		
		if(secants.length){
			
			var left = secants[0];
			var right = secants[0];
			var i = 1;
			for(;i<secants.length;i++){
				if(secants[i].angle < left.angle) left = secants[i];
				if(secants[i].angle > right.angle) right = secants[i];
			}
	
	
			var left_2_angle = distanceAndAngle(other.x, other.y, left.ray.a.x, left.ray.a.y).angle - player.angle;
		    var right_2_angle = distanceAndAngle(other.x, other.y, right.ray.a.x, right.ray.a.y).angle  - player.angle;
		    
		    
		    
		    left_2_angle = clipAngle(left_2_angle);
		    right_2_angle = clipAngle(right_2_angle);
			
			if(left_2_angle > right_2_angle) {
				
				var tmp = left_2_angle;
				left_2_angle = right_2_angle;
				right_2_angle = tmp;
				
			} 
	
			var middle = (left_2_angle + right_2_angle)/2;
						
			var path = "M" + left.ray.a.x + " " + left.ray.a.y
				+ "L" + left.ray.b.x + " " + left.ray.b.y
				+ paper.circularArc(
					player.x, 
					player.y, 
					player.sightLength, 
					player.angle + left.angle,
					player.angle + right.angle
					
				) 
			
				+ "L" + right.ray.a.x + " " + right.ray.a.y
				
				+ describeArc(
					other.x, 
					other.y, 
					other.width, 
					player.angle + left_2_angle,
					player.angle + right_2_angle
				
				)
				
				 + "Z"
			console.log(path);
			paper.path(
				path
			).attr({"fill":"#444","stroke":"#FFF", "stroke-width":5});
			
			paper.path(
				"M" + left.ray.a.x + " " + left.ray.a.y
				+ "L" + left.ray.b.x + " " + left.ray.b.y
			).attr({"fill":"#444","stroke":"#888", "stroke-width":5});



			
		}
		
		
		
		
	
		
				
	}
	
	
}

setInterval(draw, 1000/25);
keyboardControl(player);
