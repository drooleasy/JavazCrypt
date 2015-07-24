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
	this.consciousness = 2.5;
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
	this.light = new Light(this.x, this.y, this.sightLength*1.1, Math.PI*2, this.angle)
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
	var metrics = distanceAndAngle(this.x, this.y, other.x, other.y),
		distance = metrics.distance;
	if((distance - other.width) < this.width*this.consciousness) return true;
	return false;
}

Bob.prototype.sees =  function inSight(other){ 
	var metrics = distanceAndAngle(this.x, this.y, other.x, other.y),
		distance = metrics.distance;
	
	var angle = metrics.angle,	
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

	this.shadow.draw(paper, function() {	ctx.globalCompositeOperation = oldCompositeOpration;});

	
	
}








Bob.prototype.draw = function(paper){	
	var ctx = paper.getContext('2d');
	ctx.fillStyle = this.bodyStyle["fill"];
	ctx.strokeStyle = this.bodyStyle["stroke"];
	ctx.lineWidth = this.bodyStyle["stroke-width"];
	
	ctx.beginPath();
	ctx.arc(this.x, this.y, this.width, 0, 2*Math.PI);
	ctx.stroke();
	ctx.fill();
	
	ctx.fillStyle="#C33"
	
	var nose_offset = 0;
	
	var nose = {
		x:this.x +Math.cos(this.angle) * (this.width+nose_offset),
		y:this.y +Math.sin(this.angle) * (this.width+nose_offset),
		r: 3
	}
	
	var eye_offset = 0;
	
	ctx.beginPath();
	ctx.arc(nose.x, nose.y, nose.r, 0, 2*Math.PI);
	ctx.stroke();
	ctx.fill();
	
	ctx.fillStyle="#fff"
	
	var eye_left = {
		x:this.x +Math.cos(this.angle-this.sightWidth/2) * (this.width+eye_offset),
		y:this.y +Math.sin(this.angle-this.sightWidth/2) * (this.width+eye_offset),
		r: 2
	}
	
	ctx.beginPath();
	ctx.arc(eye_left.x, eye_left.y, eye_left.r, 0, 2*Math.PI);
	ctx.stroke();
	ctx.fill();
	
	var eye_right = {
		x:this.x +Math.cos(this.angle+this.sightWidth/2) * (this.width+eye_offset),
		y:this.y +Math.sin(this.angle+this.sightWidth/2) * (this.width+eye_offset),
		r: 2
	}
	
	ctx.beginPath();
	ctx.arc(eye_right.x, eye_right.y, eye_right.r, 0, 2*Math.PI);
	ctx.stroke();
	ctx.fill();
};



Bob.prototype.speak = function(paper){
	if(this.saying){
		var margin = 5,
			height = 14,
			lineHeight = 9;
			
		var msg = this.saying;
		
		var metrics = ctx.measureText(msg);
		
		var bubble_width = metrics.width + 2 * margin;
		var bubble_height = height + 2 * margin;
		
		var bubble_x = this.x + this.width + 10 ;
		var bubble_y = this.y - this.width - 10 - height - margin;

		var text_x = bubble_x + margin;
		var text_y = bubble_y + margin + lineHeight;

		this.bubbleStyle = {
			"fill":"#FFF",
			"stroke":"#FFF",
			"stroke-width":1
		};

		ctx.fillStyle = this.bubbleStyle["fill"];
		ctx.strokeStyle = this.bubbleStyle["stroke"];
		ctx.lineWidth = this.bubbleStyle["stroke-width"];
		ctx.fontColor = this.bubbleStyle["font-color"];
		
		var anchor = new Segment(
			bubble_x+bubble_width/2,
			bubble_y+bubble_height/2,
			this.x + this.width + 2,
			this.y - this.width - 2
		);
		
		anchor.draw(paper);
			
		
		var rec = {
			x:bubble_x, 
			y:bubble_y, 
			w:bubble_width, 
			h:bubble_height
		};
		
		
		var top_left = {
			x:rec.x, 
			y:rec.y, 
			w:rec.w/2, 
			h:rec.h/2
		}
		
		
		var top_right = {
			x:rec.x + rec.w/2, 
			y:rec.y, 
			w:rec.w/2, 
			h:rec.h/2
		}
		
		
		var bottom_right = {
			x:rec.x + rec.w/2, 
			y:rec.y + rec.h/2, 
			w:rec.w/2, 
			h:rec.h/2
		}
		
		var bottom_left = {
			x:rec.x, 
			y:rec.y + rec.h/2, 
			w:rec.w/2, 
			h:rec.h/2
		}
		
		var radius = Math.min(rec.w,rec.h)/2
		
		ctx.moveTo(bottom_left.x, bottom_left.y);
		ctx.arcTo(
			top_left.x, top_left.y, 
			top_right.x, top_right.y, 
			radius
		);
		ctx.arcTo( 
			top_right.x + top_right.w, top_right.y,
			top_right.x + top_right.w, top_right.y + top_right.h,    
			radius
		);
		ctx.arcTo(
			bottom_right.x + bottom_right.w, bottom_right.y + bottom_right.h,  
			bottom_right.x, bottom_right.y + bottom_right.h, 
			radius
		);
		ctx.arcTo(
			bottom_left.x, bottom_left.y + bottom_left.h,  
			bottom_left.x, bottom_left.y, 
			radius
		);
		
		ctx.fill();
		ctx.stroke();

		if(false) ctx.fillRect(
			bubble_x, 
			bubble_y, 
			bubble_width, 
			bubble_height
		)
		
		if(false) ctx.strokeRect(
			bubble_x, 
			bubble_y, 
			bubble_width, 
			bubble_height
		)		
		
		
		
		ctx.fillStyle= "#000"; //this.bubbleStyle["stroke"];
		ctx.fillText(
			msg,
			text_x, 
			text_y
		);
	}
}

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
		
		var angle = distanceAndAngle(light.x, light.y, side.x, side.y).angle - light.angle;
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
	
		var left_2_angle = distanceAndAngle(this.x, this.y, left.ray.a.x, left.ray.a.y).angle - light.angle;
		left_2_angle = clipAngle(left_2_angle);
	
		var right_2_angle = distanceAndAngle(this.x, this.y, right.ray.a.x, right.ray.a.y).angle  - light.angle;    
		right_2_angle = clipAngle(right_2_angle);
		
		if(left_2_angle > right_2_angle) {
			
			var tmp = left_2_angle;
			left_2_angle = right_2_angle;
			right_2_angle = tmp;
			
		} 

		
	var bob_angle = distanceAndAngle(light.x, light.y, this.x, this.y).angle;
		

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
