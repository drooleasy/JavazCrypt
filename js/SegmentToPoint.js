
function SegmentToPoint(segment, point){
//console.log(segment)
	var closest = segment.closestPointFrom(point.x, point.y);
	this.segment = segment;
	this.closest = closest;
	this.metric = {
		a : distanceAndAngle(point.x, point.y, segment.a.x, segment.a.y),
		b : distanceAndAngle(point.x, point.y, segment.b.x, segment.b.y),
		closest : distanceAndAngle(point.x, point.y, closest.x, closest.y)
	};
	if(this.metric.a.distance > this.metric.b.distance){
		this.farest = this.segment.a;
		this.metric.farest = this.metric.a;
	}else{
		this.farest = this.segment.b;
		this.metric.farest = this.metric.b;
	}
	this.length = distanceBetween(segment.b.x, segment.b.y, segment.a.x, segment.a.y);
	this.angle = clipAngle(this.metric.b.angle - this.metric.a.angle); // cliped
}

SegmentToPoint.prototype.recompute = function(point){
	var closest = this.segment.closestPointFrom(point.x, point.y);
	//this.segment = this.segment;
	this.closest = closest;
	this.metric = {
		a : distanceAndAngle(point.x, point.y, this.segment.a.x, this.segment.a.y),
		b : distanceAndAngle(point.x, point.y, this.segment.b.x, this.segment.b.y),
		closest : distanceAndAngle(point.x, point.y, closest.x, closest.y)
	};
	if(this.metric.a.distance > this.metric.b.distance){
		this.farest = this.segment.a;
		this.metric.farest = this.metric.a;
	}else{
		this.farest = this.segment.b;
		this.metric.farest = this.metric.b;
	}
	this.length = distanceBetween(this.segment.b.x, this.segment.b.y, this.segment.a.x, this.segment.a.y);
	this.angle = clipAngle(this.metric.b.angle - this.metric.a.angle); // cliped
	return this;
}

SegmentToPoint.prototype.swap = function(){
	var tmp =	this.segment.a;
	this.segment.a = this.segment.b;
	this.segment.b = tmp;
	tmp =	this.metric.a;
	this.metric.a = this.metric.b;
	this.metric.b = tmp;
	this.angle = clipAngle(this.angle - Math.PI);
	return this;
};


SegmentToPoint.prototype.draw = function(ctx, markClosest, color, label){
		color = color || randomColor();
		var segment = this.segment;
		var angle = angleBetween(segment.a.x, segment.a.y, segment.b.x, segment.b.y);
		ctx.strokeStyle = color;
		ctx.fillStyle = ctx.strokeStyle;


		ctx.beginPath();

		ctx.moveTo(
			segment.a.x + Math.cos(angle+Math.PI/2) * 10,
			segment.a.y  + Math.sin(angle+Math.PI/2) * 10
		);


		ctx.lineTo(
			segment.a.x - Math.cos(angle+Math.PI/2) * 10,
			segment.a.y - Math.sin(angle+Math.PI/2) * 10
		);
		ctx.stroke();


if(label){
	ctx.strokeText(
		label,
		segment.a.x + Math.cos(angle+Math.PI/4) * 10,
		segment.a.y  + Math.sin(angle+Math.PI/4) * 10
	)
}


		ctx.beginPath();
		ctx.moveTo(segment.a.x, segment.a.y);
		ctx.lineTo(segment.b.x, segment.b.y);
		ctx.stroke();

		ctx.beginPath();
		ctx.lineTo(
			segment.b.x + Math.cos(angle+Math.PI*3.2/4) * 10,
			segment.b.y  + Math.sin(angle+Math.PI*3.2/4) * 10
		);
		ctx.lineTo(
			segment.b.x + Math.cos(angle-Math.PI*3.2/4) * 10,
			segment.b.y  + Math.sin(angle-Math.PI*3.2/4) * 10
		);
		ctx.lineTo(segment.b.x, segment.b.y);
		ctx.fill();

		if(markClosest){
			ctx.beginPath();
			ctx.arc(this.closest.x, this.closest.y, 3, 0, 2*Math.PI);
			ctx.closePath();
			ctx.stroke();
		}
		return this;
};


SegmentToPoint.prototype.clockwise = function(){
	if(this.angle < 0) this.swap();
	return this;
}


SegmentToPoint.prototype.counterClockwise = function(){
	if(this.angle > 0) this.swap();
	return this;
}


SegmentToPoint.prototype.closeToFar = function(){
	if(this.metric.b.distance < this.metric.a.distance) this.swap();
	return this;
}


SegmentToPoint.prototype.farToClose = function(){
	if(this.metric.a.distance < this.metric.b.distance) this.swap();
	return this;
}

SegmentToPoint.prototype.isSinglePoint = function(){
	return Math.abs(this.length) < 0.001;

}
