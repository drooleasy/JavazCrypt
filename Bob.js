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
	var x1 = this.x + Math.cos(clipAnglePositive(this.angle - this.sightWidth/2)) * this.sightLength,
		y1 = this.y + Math.sin(clipAnglePositive(this.angle - this.sightWidth/2)) * this.sightLength;

	ctx.beginPath();			
	ctx.moveTo(this.x,this.y);
	
	ctx.arc(this.x+Math.random()*2-1, this.y+Math.random()*2-1, this.width*this.consciousness, 0, 2*Math.PI);
	
	ctx.moveTo(this.x,this.y);
	ctx.lineTo(x1, y1);
	ctx.arc(this.x, this.y, this.sightLength, clipAnglePositive(this.angle-this.sightWidth/2), clipAnglePositive(this.angle+this.sightWidth/2));
	ctx.lineTo(this.x,this.y);
	ctx.closePath();
}		

Bob.prototype.drawSight = function(paper, lights_on){		
	var ctx = paper.getContext('2d');
	
	var oldCompositeOpration = ctx.globalCompositeOperation;
	ctx.globalCompositeOperation = "destination-atop";
	
	if(lights_on) ctx.globalCompositeOperation = "source-over";
	ctx.fillStyle = "rgba(255,255,255,1)";
	ctx.strokeStyle = "#FF0000";
			


	
	ctx.lineWidth = 3;

	this.drawFOV(ctx);
//	ctx.stroke();
	ctx.fill();
	
	ctx.globalCompositeOperation = oldCompositeOpration;

	
	if(!lights_on){
		var grd=ctx.createRadialGradient(this.x,this.y,0,this.x,this.y,this.sightLength);
		grd.addColorStop(0,"rgba(255,255,128,0)");
		grd.addColorStop(0.333 + Math.random()*0.1-0.05,"rgba(0,0,0,0)");
		grd.addColorStop(1,"rgba(0,0,0,1)");

		ctx.fillStyle = grd;
		ctx.strokeStyle = "#000000";
		ctx.lineWidth = 5;
				
		this.drawFOV(ctx)
		//ctx.stroke();
		ctx.fill();

	}
	
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
			"stroke":"#17A9C6",
			"stroke-width":1
		};

		ctx.fillStyle = this.bubbleStyle["fill"];
		ctx.strokeStyle = this.bubbleStyle["stroke"];
		ctx.lineWidth = this.bubbleStyle["stroke-width"];
		ctx.fontColor = this.bubbleStyle["font-color"];
		
		var anchor = new Segment(
			bubble_x,
			bubble_y+bubble_height,
			this.x+this.width +2,
			this.y
		);
		
		anchor.draw(paper);
			
		ctx.fillRect(
			bubble_x, 
			bubble_y, 
			bubble_width, 
			bubble_height
		)
		ctx.strokeRect(
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

Bob.prototype.castShadow = function cast_bob_shadow(player){	

	var secants = [];
	var factor = 120/100;
	var v = minus(this, player);
	var v_perp = {x:(-v.y), y:(v.y == 0 ? (-v.x) : v.x)}
	var sol = solveP2(
		(v_perp.x*v_perp.x + v_perp.y*v_perp.y),
		(0),
		(-(this.width*factor)*(this.width*factor)) 
	
	);
	
	function addInner(k, v_perp, player, secants){
		var side = {	
			x: (other.x + v_perp.x * k),
			y: (other.y + v_perp.y * k)
		}
		var ray = castRay(player.x, player.y, side.x, side.y, player.sightLength);
		
		var angle = distanceAndAngle(player.x, player.y, side.x, side.y).angle - player.angle;
		angle = clipAngle(angle);
		
		secants.push({angle:angle, ray:ray});
	}
	
	if(sol.length != 0){
		addInner(sol[0], v_perp, player, secants)
		addInner(sol[1], v_perp, player, secants)
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
	
		var left_2_angle = distanceAndAngle(other.x, other.y, left.ray.a.x, left.ray.a.y).angle - player.angle;
		left_2_angle = clipAngle(left_2_angle);
	
		var right_2_angle = distanceAndAngle(other.x, other.y, right.ray.a.x, right.ray.a.y).angle  - player.angle;    
		right_2_angle = clipAngle(right_2_angle);
		
		if(left_2_angle > right_2_angle) {
			
			var tmp = left_2_angle;
			left_2_angle = right_2_angle;
			right_2_angle = tmp;
			
		} 

		
	var bob_angle = distanceAndAngle(player.x, player.y, this.x, this.y).angle;
		

	var coneData = {
			x:player.x,
			y:player.y,
			ray_1 : left.ray,
			ray_2 : right.ray,
			angle_1 : player.angle+left.angle,
			angle_2 : player.angle+right.angle,
			radius : player.sightLength,
			
		
			
			bob:{
				width:this.width,
				x1 : this.x + Math.cos(bob_angle) * this.width*2.5,
				y1 : this.y + Math.sin(bob_angle) * this.width*2.5,
				x2 : left.ray.a.x,
				y2 : left.ray.a.y,
				r:this.width
			}
		}

		
		//player.shadow.paths.push(path);
		player.shadow.paths.push(coneData);
	}

}


Bob.prototype.say = function (paper, msg){	
	this.saying = msg;
	var that = this;
	setTimeout(function shutUp(){ that.saying=false}, 3*1000)
}
