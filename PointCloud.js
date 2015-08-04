function PointCloud(/*x,y,...*/){
		this.points=[];
		if(arguments.length) for(var i=1;i<arguments.length;i+=2){
			this.points.push({
				x: arguments[i-1],
				y: arguments[i]
			});
		}
		return this;
	}
	
	
PointCloud.prototype.center = function(){
	
	var x=0,
		y=0,
		n=this.points.length;
	for(var i=0;i<n;i++){
		x+=this.points[i].x;
		y+=this.points[i].y;
		
	}
	return {
		x:x/n,
		y:y/n
	}
}


	
PointCloud.prototype.distances = function(from){
	var res = [],
		n=this.points.length;
	for(var i=0;i<n;i++){
		res.push(distanceBetween(from.x, from.y, this.points[i].x, this.points[i].y))		
	}
	return res;
}


PointCloud.prototype.angles = function(from){
	var res = [],
		n=this.points.length;
	for(var i=0;i<n;i++){
		res.push(angleBetween(from.x, from.y, this.points[i].x, this.points[i].y))		
	}
	return res;
}


PointCloud.prototype.distancesAndAngles = function(from){
	var res = [],
		n=this.points.length;
	for(var i=0;i<n;i++){
		res.push(distanceAndAngle(from.x, from.y, this.points[i].x, this.points[i].y))		
	}
	return res;
}

PointCloud.prototype.innerOuter = function(){
	
	var center = this.center();
	var d=distanceBetween(center.x, center.y, this.points[0].x, this.points[0].y),
		min_d=d,
		max_d=d,
		mn={
			x:this.points[0].x,
			y:this.points[0].y
		},
		mx={
			x:this.points[0].x,
			y:this.points[0].y
		};
		n=this.points.length;
	for(var i=1;i<n;i++){
		
		d=distanceBetween(center.x, center.y, this.points[i].x, this.points[i].y);
		if(d<min_d){
			min_d = d;
			mn={
				x:this.points[i].x,
				y:this.points[i].y
			};
		}
		
		if(d>max_d){
			max_d = d;
			mx={
				x:this.points[i].x,
				y:this.points[i].y
			};
		}		
	}
	return {
		min:mn,
		max:mx,
		center:center,
		min_distance: min_d,
		max_distance: max_d,
	};
}


PointCloud.prototype.plot = function(paper){
	var ctx = paper.getContext("2d");
	var n=this.points.length;
	ctx.beginPath();
	for(var i=0;i<n;i++){
		ctx.moveTo(this.points[i].x, this.points[i].y);
		ctx.arc(this.points[i].x, this.points[i].y, 2, 0, 2*Math.PI);
	}
	ctx.closePath();
	ctx.fill();
}

PointCloud.prototype.draw = function(paper){
	var ctx = paper.getContext("2d");
	var n=this.points.length;	
	ctx.fillStyle = "rgba(255,255,255,0.33)"
	ctx.beginPath();
	ctx.moveTo(this.points[0].x, this.points[0].y);
	for(var i=0;i<n;i++){
		ctx.lineTo(this.points[i].x, this.points[i].y);
	}
	ctx.lineTo(this.points[0].x, this.points[0].y);
	ctx.fill();
	ctx.stroke();
}

PointCloud.prototype.sort = function(){
	var center = this.center();
	this.points = this.points.sort(function(a, b){
		var angle_a = angleBetween(center.x, center.y, a.x, a.y); 
		var angle_b = angleBetween(center.x, center.y, b.x, b.y); 
		return angle_a - angle_b;
	})
}


PointCloud.prototype.inside = function(x,y){
	
	var metrics = this.angles({x:x,y:y});
	
	console.log("----------")
	//console.log(metrics)
	var previous_angle = clipAnglePositive(metrics[this.points.length-1]);
	var diff = metrics[0] - previous_angle;
	var previous_sign = diff < 0 ? -1 : 1;


var sum = 0;
	for(var i=0; i<this.points.length; i++){
		
	
		diff = clipAngle(metrics[i] - previous_angle);
		sign = diff < 0 ? -1 : 1;
		//if(sign != previous_sign) return true;
		
		//console.log(rad2deg(diff).toFixed(1));
		sum+=diff;
		var previous_angle = metrics[i];
		var previous_sign = sign;

	}
	console.log(rad2deg(sum).toFixed(1));
	return Math.abs(sum) > 0.001;
	
}

PointCloud.prototype.AABB = function(){

	var topLeft = {
		x:this.points[0].x,
		y:this.points[0].y
	}
	var bottomRight = {
		x:this.points[0].x,
		y:this.points[0].y
	}
	
	var i=1,
		n = this.points.length; 
	for(;i<n;i++){
		var p = this.points[i];
		if(p.x < topLeft.x) topLeft.x = p.x;	
		if(p.y < topLeft.y) topLeft.y = p.y;	
		if(p.x > bottomRight.x) bottomRight.x = p.x;	
		if(p.y > bottomRight.y) bottomRight.y = p.y;	
	}
	
	return {
		x:topLeft.x,
		y:topLeft.y,
		w:bottomRight.x - topLeft.x,
		h:bottomRight.y - topLeft.y
	}
}



PointCloud.prototype.plotInnerOuter = function plotInnerOuter(paper){
	var ctx = paper.getContext("2d");
	
	var innerOuter = pointCloud.innerOuter();

	ctx.fillStyle = "#ff0";								
	this.drawPoint(innerOuter.center, paper);
	ctx.fill();

	ctx.fillStyle = "#0f0";
	ctx.strokeStyle = "#0f0";
	this.drawPoint(innerOuter.min, paper);
	ctx.fill();
	this.drawPoint(innerOuter.center, paper, innerOuter.min_distance);
	ctx.stroke();
	
	ctx.fillStyle = "#f00";
	ctx.strokeStyle = "#f00";
	this.drawPoint(innerOuter.max, paper);
	ctx.fill();
	this.drawPoint(innerOuter.center, paper, innerOuter.max_distance);
	ctx.stroke();
}


PointCloud.prototype.strokeAABB = function strokeAABB(paper){
	var ctx = paper.getContext("2d");
	
	ctx.strokeStyle = "#66F";
	var AABB = pointCloud.AABB();
	
	
	ctx.strokeRect(AABB.x, AABB.y, AABB.w, AABB.h);
}


PointCloud.prototype.drawPoint = function drawPoint(p, paper, r){
	if(p instanceof Number) p = this.points[p];
	var ctx = paper.getContext("2d");
	r = r || 5
	ctx.beginPath();
	ctx.arc(p.x,p.y, r, 0, Math.PI*2);
	ctx.closePath();
	
}
