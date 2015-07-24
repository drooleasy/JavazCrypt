function Bob(x,y, width, angle, fov_angle, fov_distance){
	this.x = x || Bob.defaults.x;
	this.y = y || Bob.defaults.y;
	this.angle = clipAngle(deg2rad(angle)) || clipAngle(Bob.defaults.angle);
	
	
	this.width = width || Bob.defaults.width; // radius !!!
	this.width = width || Bob.defaults.width; // radius !!!
	
	this.sightLength = fov_distance || Bob.defaults.sightLength;
	this.sightWidth = fov_angle && deg2rad(fov_angle) || Bob.defaults.sightWidth;
	this.sightColor= "#FFFFFF";
	
	this.consciousness = Bob.defaults.consciousness;
	
	
	this.speedForward = Bob.defaults.speedForward;
	this.speedBackward = Bob.defaults.speedBackward;
	this.speedTurn = Bob.defaults.speedTurn; 
	
	
	this.bubbleStyle = {
		"fill":"#FFF",
		"stroke":"#FFF",
		"stroke-width":3
	};
	
	this.body = {
		style : {
			"fill":Bob.defaults.body.style["fill"],
			"stroke":Bob.defaults.body.style["stroke"],
			"stroke-width":Bob.defaults.body.style["stroke-width"]
		},
		x:0,
		y:0
	};
	this.eyes = {
		left:{
			style : {
				"fill":Bob.defaults.eyes.left.style["fill"]
			},
			offset: Bob.defaults.eyes.left.offset,
			angle: Bob.defaults.eyes.left.angle,
			radius: Bob.defaults.eyes.left.radius
		},
		
		right:{
			style : {
				"fill":Bob.defaults.eyes.right.style["fill"]
			},
			offset: Bob.defaults.eyes.right.offset,
			angle: Bob.defaults.eyes.right.angle,
			radius: Bob.defaults.eyes.right.radius
		}
	};
	
	this.nose = {
		style : {
			"fill": Bob.defaults.nose.style["fill"]
		},
		offset:Bob.defaults.nose.offset,
		angle:Bob.defaults.nose.angle,
		radius:Bob.defaults.nose.radius
	};
	

	this.textStyle = {
		stroke: "#000"
	};

	this.light = new Light(
		this.x, this.y, 
		this.sightLength*1.1, // overshoot due to slow rate of light refreshing (when moving forward)   
		Math.PI*2, this.angle
	);
		
	this.shadow = new Shadow();
	this.saying = false;

}


Bob.defaults = {
	
	x : 0,
	y : 0,
	angle : 0,
	
	
	width : 10, // radius !!!
	
	sightLength : 200,
	sightWidth : deg2rad(120),
	sightColor: "#FFFFFF",
	
	consciousness : 2.5,
	
	
	speedForward : 2,
	speedBackward : 1,
	speedTurn : deg2rad(3), 
	
	body : {
		style : {
			"fill":"#17A9C6",
			"stroke":"#000000",
			"stroke-width":2		
		},
		x:0,
		y:0
	},
	eyes : {
		left:{
			style : {
			 "fill":"#fff"
			},
			offset:10,
			angle: deg2rad(-60),
			radius:2
		},
		
		right:{
			style : {
			 "fill":"#fff"
			},
			offset:10,
			angle:deg2rad(60),
			radius:2

		}
	},
	
	nose : {
		style : {
			"fill":"#C33"
		},
		offset:10,
		angle: 0,
		radius: 2
	},
	

	textStyle : {
		stroke: "#000"
	}
}


Bob.prototype.replaceLight = function moveForward(){
	if(this.light){
		this.light.moveTo(this);
		this.light.angle = this.angle;
	}
}

Bob.prototype.moveForward = function moveForward(){
	this.x += Math.cos(this.angle)*this.speedForward;
	this.y += Math.sin(this.angle)*this.speedForward;
	this.replaceLight();
}

Bob.prototype.moveBackward = function moveBackward(){
	this.x += Math.cos(this.angle)*(-1)*this.speedBackward;
	this.y += Math.sin(this.angle)*(-1)*this.speedBackward;
	this.replaceLight();
}

Bob.prototype.turnLeft = function turnLeft(){
	this.angle -= this.speedTurn;
	this.angle = clipAngle(this.angle);
	this.replaceLight();
}

Bob.prototype.turnRight =  function turnRight(){
	this.angle += this.speedTurn;
	this.angle = clipAngle(this.angle);
	this.replaceLight();
}

Bob.prototype.feels =  function inSight(other){ 
	var d = distanceBetween(this.x, this.y, other.x, other.y); 
	if((d - other.width) < this.width*this.consciousness) return true;
	return false;
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





Bob.prototype.drawFOV = function(ctx){
	
	var angle_1 = clipAnglePositive(this.angle - this.sightWidth/2),
		angle_2 = clipAnglePositive(this.angle + this.sightWidth/2);
	
	
	var ox = this.x+Math.random()*2-1;
	var oy = this.y+Math.random()*2-1;
	
	var x = ox + Math.cos(angle_2) * this.width*this.consciousness,
		y = oy + Math.sin(angle_2) * this.width*this.consciousness;
	var x0 = ox + Math.cos(angle_1) * this.width*this.consciousness,
		y0 = oy + Math.sin(angle_1) * this.width*this.consciousness;
	var x1 = ox + Math.cos(angle_1) * this.sightLength,
		y1 = oy + Math.sin(angle_1) * this.sightLength;

	ctx.beginPath();			
	ctx.moveTo(x,y);
	
	ctx.arc(ox, oy, this.width*this.consciousness, angle_2,  angle_1);
	ctx.lineTo(x1, y1);
	ctx.arc(ox, oy, this.sightLength, angle_1, angle_2);
	ctx.lineTo(x,y);
	ctx.closePath();
}		

Bob.prototype.drawSight = function(paper, path, boulder, bob){		
	var ctx = paper.getContext('2d');

	var oldCompositeOpration = ctx.globalCompositeOperation;

	var seenSegments = path.seenSegments(this);		
	var seenSegments2 = boulder.seenSegments(this);


	// WORLD SHADOWS
	for(i=0;i<seenSegments.length;i++){
		seenSegments[i].castShadow(this);
	}
	for(i=0;i<seenSegments2.length;i++){
		seenSegments2[i].castShadow(this);
	}

	// OTHERS SHADOWS
	var sees_bob = bob && this.sees(bob);
	if(sees_bob){
		bob.castShadow(this);
	}
	


	ctx.globalCompositeOperation = "destination-atop";
	//ctx.globalCompositeOperation = "source-over";


	ctx.fillStyle = "rgba(48,144,48,1)";
			
	ctx.beginPath();
	this.drawFOV(ctx);
	ctx.closePath();
	ctx.fill();

	ctx.globalCompositeOperation = "source-over";

	
	

	// DRAWS SEEN WALLS

	ctx.strokeStyle = "#FFF";
	ctx.lineWidth = 2;
	ctx.lineCap = "round";

	ctx.beginPath();
	for(i=0;i<seenSegments.length;i++){
		ctx.moveTo(seenSegments[i].a.x, seenSegments[i].a.y);
		ctx.lineTo(seenSegments[i].b.x, seenSegments[i].b.y);
	}
	ctx.closePath();
	ctx.stroke();

	ctx.beginPath();
	for(i=0;i<seenSegments2.length;i++){	
		ctx.moveTo(seenSegments2[i].a.x, seenSegments2[i].a.y);
		ctx.lineTo(seenSegments2[i].b.x, seenSegments2[i].b.y);
	}

	ctx.closePath();
	ctx.stroke();

	ctx.strokeStyle = "#000";
	ctx.lineWidth = 3;
			
	ctx.beginPath();
	this.drawFOV(ctx);
	ctx.closePath();
	ctx.stroke();



	this.shadow.draw(paper, function() {	ctx.globalCompositeOperation = oldCompositeOpration;});

	
	
}








Bob.prototype.draw = function(paper){	
	var ctx = paper.getContext('2d');
	ctx.fillStyle = this.body.style["fill"];
	ctx.strokeStyle = this.body.style["stroke"];
	ctx.lineWidth = this.body.style["stroke-width"];
	
	ctx.beginPath();
	ctx.arc(this.x, this.y, this.width, 0, 2*Math.PI);
	ctx.stroke();
	ctx.fill();
	
	ctx.fillStyle=this.nose.style["fill"];
	
	var nose = {
		x: this.x + Math.cos(this.angle + this.nose.angle) * (this.nose.offset),
		y: this.y + Math.sin(this.angle + this.nose.angle) * (this.nose.offset),
		r: this.nose.radius
	}
	
	var eye_offset = 0;
	
	ctx.beginPath();
	ctx.arc(nose.x, nose.y, nose.r, 0, 2*Math.PI);
	ctx.stroke();
	ctx.fill();
	
	ctx.fillStyle = this.eyes.left.style["fill"];
	
	var eye_left = {
		x: this.x + Math.cos(this.angle + this.eyes.left.angle) * (this.eyes.left.offset),
		y: this.y + Math.sin(this.angle + this.eyes.left.angle) * (this.eyes.left.offset),
		r: this.eyes.left.radius
	}
	
	ctx.beginPath();
	ctx.arc(eye_left.x, eye_left.y, eye_left.r, 0, 2*Math.PI);
	ctx.stroke();
	ctx.fill();

	ctx.fillStyle = this.eyes.right.style["fill"];
	
	var eye_right = {
		x: this.x + Math.cos(this.angle + this.eyes.right.angle) * (this.eyes.right.offset),
		y: this.y + Math.sin(this.angle + this.eyes.right.angle) * (this.eyes.right.offset),
		r: this.eyes.right.radius
	}
	
	ctx.beginPath();
	ctx.arc(eye_right.x, eye_right.y, eye_right.r, 0, 2*Math.PI);
	ctx.stroke();
	ctx.fill();
};



Bob.prototype.speak = function(paper){
	if(this.saying){
		var msg = this.saying;
		Bubble.draw(paper, msg, this.x, this.y, deg2rad(-45), this.width+6);
	}
}

Bob.prototype.collidesWithBob = function(bob){
	var metrics = distanceAndAngle(this.x, this.y, bob.x, bob.y),
		distance_min = this.width + bob.width;
	if(metrics.distance < distance_min ){ // collides
			this.x = bob.x - Math.cos(metrics.angle) * distance_min; 
			this.y = bob.y - Math.sin(metrics.angle) * distance_min; 
	}
}


Bob.prototype.collidesWithSegment = function(segment){
	var closest = segment.closestPointFrom(this.x, this.y);
	var metrics = distanceAndAngle(this.x, this.y, closest.x, closest.y),
		distance_min = this.width;
	if(metrics.distance < distance_min ){ // collides
			this.x = closest.x - Math.cos(metrics.angle) * distance_min; 
			this.y = closest.y - Math.sin(metrics.angle) * distance_min; 
	}
}


Bob.prototype.fovSegments = function(){
		
		var semiSight = this.sightWidth/2;
		
		return {
				left: new Segment(
					this.x,
					this.y,
					this.x + Math.cos(this.angle - semiSight) * this.sightLength,
					this.y + Math.sin(this.angle - semiSight) * this.sightLength
				),
				right:new Segment(
					this.x,
					this.y,
					this.x + Math.cos(this.angle + semiSight) * this.sightLength,
					this.y + Math.sin(this.angle + semiSight) * this.sightLength
				), 	
		}
}

Bob.prototype.drawShadow = function draw_bob_shadow(paper, player){
		if(this.shadow.paths.length>0) this.shadow.draw(paper);
}	

Bob.prototype.castShadow = function cast_bob_shadow(light){	

	var secants = [];
	var factor = 120/100;
	var v = minus(this, light);
	var v_perp = {x:(-v.y), y:(v.y == 0 ? (-v.x) : v.x)}
	var sol = solveP2(
		(v_perp.x*v_perp.x + v_perp.y*v_perp.y),
		(0),
		(-(this.width*factor)*(this.width*factor)) 
	
	);
	
	function addInner(k, v_perp, that, light, secants){
		var side = {	
			x: (that.x + v_perp.x * k),
			y: (that.y + v_perp.y * k)
		}
		var ray = castRay(light.x, light.y, side.x, side.y, light.sightLength);
		
		var angle = angleBetween(light.x, light.y, side.x, side.y) - light.angle;
		angle = clipAngle(angle);
		
		secants.push({angle:angle, ray:ray});
	}
	
	if(sol.length != 0){
		addInner(sol[0], v_perp, this, light, secants)
		addInner(sol[1], v_perp, this, light, secants)
	}
	
	
	
	secants = secants.sort(function(a,b){return a.angle - b.angle});
	
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
	
		var left_2_angle = angleBetween(this.x, this.y, left.ray.a.x, left.ray.a.y) - light.angle;
		left_2_angle = clipAngle(left_2_angle);
	
		var right_2_angle = angleBetween(this.x, this.y, right.ray.a.x, right.ray.a.y) - light.angle;    
		right_2_angle = clipAngle(right_2_angle);
		
		if(left_2_angle > right_2_angle) {
			
			var tmp = left_2_angle;
			left_2_angle = right_2_angle;
			right_2_angle = tmp;
			
		} 

		
	var bob_angle = angleBetween(light.x, light.y, this.x, this.y);
		

	var coneData = {
			x:light.x,
			y:light.y,
			ray_1 : left.ray,
			ray_2 : right.ray,
			angle_1 : light.angle+left.angle,
			angle_2 : light.angle+right.angle,
			radius :light.sightLength,
			
		
			
			bob:{
				width:this.width,
				x1 : this.x + Math.cos(bob_angle) * this.width*2.5,
				y1 : this.y + Math.sin(bob_angle) * this.width*2.5,
				x2 : left.ray.a.x,
				y2 : left.ray.a.y,
				r : this.width
			}
		}

		
		//player.shadow.paths.push(path);
		light.shadow.paths.push(coneData);
	}

}


Bob.prototype.say = function (paper, msg){	
	this.saying = msg;
	var that = this;
	setTimeout(function shutUp(){ that.saying=false}, 3*1000)
}

