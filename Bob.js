function Bob(x,y, width, angle, fov_angle, fov_distance){
	this.x = x;
	this.y = y;
	this.width = width; // radius !!!
	this.angle = clipAngle(deg2rad(angle));
	this.sightLength = fov_distance || 200;
	this.sightWidth = fov_angle && deg2rad(fov_angle) || deg2rad(120);
	this.sightColor= "#FFFFFF";
	this.speedForward = 2;
	this.speedBackward = 1;
	this.speedTurn = deg2rad(3); 
	this.saying = false;
	this.shadow = null;
	this.bodyStyle = {
		"fill":"#17A9C6",
		"stroke":"#000000",
		"stroke-width":2
	};
	this.bubbleStyle = {
		"fill":"#FFF",
		"stroke":"#FFF",
		"stroke-width":3
	};
	this.textStyle = {
		stroke: "#000"
	};
	this.shadow = new Shadow();
}

Bob.prototype.moveForward = function moveForward(){
	this.x += Math.cos(this.angle)*this.speedForward;
	this.y += Math.sin(this.angle)*this.speedForward;
}

Bob.prototype.moveBackward = function moveBackward(){
	this.x += Math.cos(this.angle)*(-1)*this.speedBackward;
	this.y += Math.sin(this.angle)*(-1)*this.speedBackward;
}

Bob.prototype.turnLeft = function turnLeft(){
	this.angle -= this.speedTurn;
	this.angle = clipAngle(this.angle);
}

Bob.prototype.turnRight =  function turnRight(){
	this.angle += this.speedTurn;
	this.angle = clipAngle(this.angle);
}

Bob.prototype.sees =  function inSight(other){
	var metrics = distanceAndAngle(this.x, this.y, other.x, other.y),
		distance = metrics.distance,
		angle = metrics.angle,	
		relativeAngle =  clipAngle(angle - this.angle),
		width = other.width,
		deltaAngle = Math.asin(width / distance)
	
	return relativeAngle + deltaAngle >= (-this.sightWidth/2) 
		&& relativeAngle - deltaAngle <= this.sightWidth/2  
		&& distance - width <= this.sightLength
}


Bob.prototype.bodyPath = function(){
	return circle(this.x, this.y, this.width, this.angle);
};

Bob.prototype.sightPath = function(){
	return cone(this.x, this.y, this.sightLength, this.angle, this.sightWidth);
};

Bob.prototype.drawSight = function(paper){
	
	var px = this.x / paper.width;
	var py = this.y / paper.height;
	
	var grad = "#877";
	//console.log(grad)	
	
	paper.path(this.sightPath()).attr({
		"fill": grad, //this.sightColor, // filling the background color
		//"fill-opacity":".3", // filling the background color
		"stroke":"#FF0000", // the color of the border
		//"stroke-opacity":".5", // the color of the border
		"stroke-width":1 // the size of the border
	});
}


Bob.prototype.draw = function(paper){
	paper.path(this.bodyPath()).attr(this.bodyStyle);
	
	if(this.saying){
		var msg = this.saying;
		var bubble_width = 30;
		var bubble_height = 10;
		var bubble_x = this.x+this.width+3 + bubble_width;
		var bubble_y = this.y-this.width-3 ;
		
		
		var anchor = new Segment(
			bubble_x,
			bubble_y,
			this.x+this.width +2,
			this.y -2
		);
		var l = paper.path(anchor.path()).attr(this.bubbleStyle);	
		
		var ec = paper.ellipse(
			bubble_x, 
			bubble_y, 
			bubble_width, 
			bubble_height
		).attr(this.bubbleStyle);
		
		paper.text(
			bubble_x, 
			bubble_y, 	
			msg
		).attr(this.textStyle);

	}
};




Bob.prototype.collidesWithBob = function(bob){

	var metrics = distanceAndAngle(this.x, this.y, bob.x, bob.y),
		distance = this.width + bob.width;
	if(metrics.distance < distance ){ // collides
			this.x = bob.x - Math.cos(metrics.angle) * distance; 
			this.y = bob.y - Math.sin(metrics.angle) * distance; 
	}
	
}


Bob.prototype.collidesWithSegment = function(segment){

	var closest = segment.closestPointFrom(this.x, this.y);
	var metrics = distanceAndAngle(this.x, this.y, closest.x, closest.y),
		distance = this.width;
	if(metrics.distance < distance ){ // collides
			this.x = closest.x - Math.cos(metrics.angle) * distance; 
			this.y = closest.y - Math.sin(metrics.angle) * distance; 
	}
	
}


Bob.prototype.fovSegments = function(){
	
		return {
			
				left: new Segment(
					this.x,
					this.y,
					this.x + Math.cos(this.angle - this.sightWidth/2) * this.sightLength,
					this.y + Math.sin(this.angle - this.sightWidth/2) * this.sightLength
				),
				right:new Segment(
					this.x,
					this.y,
					this.x + Math.cos(this.angle + this.sightWidth/2) * this.sightLength,
					this.y + Math.sin(this.angle + this.sightWidth/2) * this.sightLength
				), 
					
		}
}

Bob.prototype.drawShadow = function draw_bob_shadow(paper, player){
		if(this.shadow.paths.length>0) this.shadow.draw(paper);
}	

Bob.prototype.castShadow = function cast_bob_shadow(player){	

	var secants = [];
	
	/*
	var fov = player.fovSegments(),
		intersect_1 = fov.left.intersectWithCircle(other.x, other.y, other.width),	
		intersect_2 = fov.right.intersectWithCircle(other.x, other.y, other.width);
	// var intersect_cone = this.intersectWithCone(bob.x, bob.y, bob.sightLength, bob.angle, bob.sightWidth);
	
	
		
	function addIntersect(intersect, player, secants){
		var farthest = intersect[0];
		if(intersect.length > 1){
			 dist_1 = distanceAndAngle(player.x, player.y, intersect[0].x, intersect[0].y).distance;
			 dist_2 = distanceAndAngle(player.x, player.y, intersect[1].x, intersect[1].y).distance;
			 if(dist_2 > dist_1) farthest = intersect[1]
		}
		
		var ray = castRay(player.x, player.y, farthest.x, farthest.y, player.sightLength);
		var angle = distanceAndAngle(player.x, player.y, farthest.x, farthest.y).angle - player.angle;
		var angle= clipAngle(angle);


		secants.push({angle:angle, ray:ray});

		//ray.draw(paper);
	}
	
	
	if(intersect_1){
		addIntersect(intersect_1, player, secants)
	}
	
	if(intersect_2){
		addIntersect(intersect_2, player, secants)
	}
	*/
	
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
	
	
	
	function addInner(k, v_perp, player, secants){
		var side = {	
			x: (other.x + v_perp.x * k),
			y: (other.y + v_perp.y * k)
		}
		var ray = castRay(player.x, player.y, side.x, side.y, player.sightLength);
		//ray.draw(paper);
		
		var angle = distanceAndAngle(player.x, player.y, side.x, side.y).angle - player.angle;
		angle = clipAngle(angle);
		
		secants.push({angle:angle, ray:ray});
	}
	
	if(sol.length != 0){
		addInner(sol[0], v_perp, player, secants)
		addInner(sol[1], v_perp, player, secants)
	}
	
	
	//console.log(secants.length);
	
	secants = secants.sort(function(a,b){return a.angle - b.angle});
	//console.log(secants);
	
	if(secants.length){
		
		var left = secants[0];
		var right = secants[secants.length-1];
		var i = 1;
		
		if(secants.length==3){
			if(intersect_1){
				left = secants[1];
			}
			
			if(intersect_2){
				right = secants[1];
			}
		}
	
		var left_2_angle = distanceAndAngle(other.x, other.y, left.ray.a.x, left.ray.a.y).angle - player.angle;
		left_2_angle = clipAngle(left_2_angle);
	
		var right_2_angle = distanceAndAngle(other.x, other.y, right.ray.a.x, right.ray.a.y).angle  - player.angle;    
		right_2_angle = clipAngle(right_2_angle);
		
		if(left_2_angle > right_2_angle) {
			
			var tmp = left_2_angle;
			left_2_angle = right_2_angle;
			right_2_angle = tmp;
			
		} 

					
		var path = "M" + left.ray.a.x + " " + left.ray.a.y
			+ "L" + left.ray.b.x + " " + left.ray.b.y
			+ paper.circularArc(
				player.x, 
				player.y, 
				player.sightLength , 
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
			
			) + "Z";

		
		if(false)paper.path(
			"M" + left.ray.a.x + " " + left.ray.a.y
			+ "L" + left.ray.b.x + " " + left.ray.b.y
		).attr({"fill":"#FFF","stroke":"#FFF", "stroke-width":1});
		
		player.shadow.paths.push(path);
	}

}


Bob.prototype.say = function (paper, msg){	
	this.saying = msg;
	var that = this;
	setTimeout(function shutUp(){ that.saying=false}, 3*1000)
}
