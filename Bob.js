function Bob(x,y, width, angle, drawSight, fov_angle, fov_distance){
	this.x = x;
	this.y = y;
	this.width = width; // radius !!!
	this.angle = clipAngle(deg2rad(angle));
	this.drawSight = !!drawSight;
	this.sightLength = fov_distance || 200;
	this.sightWidth = fov_angle && deg2rad(fov_angle) || deg2rad(120);
	this.sightColor= "#FFFFFF";
	this.speedForward = 2;
	this.speedBackward = 1;
	this.speedTurn = deg2rad(1); 
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

Bob.prototype.draw = function(paper){
	paper.path(this.bodyPath()).attr({
		"fill":"#17A9C6",
		"stroke":"#000000",
		"stroke-width":2
	});
	if(this.drawSight) paper.path(this.sightPath()).attr({
		"fill": this.sightColor, // filling the background color
		"fill-opacity":".5", // filling the background color
		"stroke":"#FF0000", // the color of the border
		"stroke-opacity":".5", // the color of the border
		"stroke-width":2 // the size of the border
	});
};

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
