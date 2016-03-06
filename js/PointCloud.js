/**
 * a 2D points set
 * @constructor
 * @param {number} x the x -coordinate of a point
 * @param {number} y the y -coordinate of a point
 */
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
	
/**
 * compute the center of the points cloud
 * @return {object} the center point with average x- and y- coordinates
 */
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


/**
 * compute all the distances between the cloud's point and another point
 * @param {object} from an x-y point object
 * @return {array} array of all the distances
 */	
PointCloud.prototype.distances = function(from){
	var res = [],
		n=this.points.length;
	for(var i=0;i<n;i++){
		res.push(distanceBetween(from.x, from.y, this.points[i].x, this.points[i].y))		
	}
	return res;
}


/**
 * compute all the angles between the cloud's point and another point
 * @param {object} from an x-y point object
 * @return {array} array of all the angles
 */	

PointCloud.prototype.angles = function(from){
	var res = [],
		n=this.points.length;
	for(var i=0;i<n;i++){
		res.push(angleBetween(from.x, from.y, this.points[i].x, this.points[i].y))		
	}
	return res;
}

/**
 * compute all the distances and angles between the cloud's point and another point
 * @param {object} from an x-y point object
 * @return {array} array of all the distances and angles
 */	

PointCloud.prototype.distancesAndAngles = function(from){
	var res = [],
		n=this.points.length;
	for(var i=0;i<n;i++){
		res.push(distanceAndAngle(from.x, from.y, this.points[i].x, this.points[i].y))		
	}
	return res;
}

/**
 * compute the minimal and maximal distance distance of points toward the center (and return the matching extremum points)  
 * @return {object} with the min and max points, the center and the min_distance and the max_distance
 */
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

/**
 * draw this point cloud on canvas (as one path)
 * @param {object} paper the canvas dom node
 */
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


/**
 * draw this point cloud on canvas (as one path) with lines between the points
 * @param {object} paper the canvas dom node
 */
PointCloud.prototype.draw = function(paper){
	var ctx = paper.getContext("2d");
	var n=this.points.length;	
	ctx.beginPath();
	ctx.moveTo(this.points[0].x, this.points[0].y);
	for(var i=1;i<n;i++){
		ctx.lineTo(this.points[i].x, this.points[i].y);
	}
	ctx.lineTo(this.points[0].x, this.points[0].y);
	ctx.closePath();
	ctx.fill();
	ctx.stroke();
}

/**
 * sorts the points according to their angle with the center
 */
PointCloud.prototype.sort = function(){
	var center = this.center();
	this.points = this.points.sort(function(a, b){
		var angle_a = angleBetween(center.x, center.y, a.x, a.y); 
		var angle_b = angleBetween(center.x, center.y, b.x, b.y); 
		return angle_a - angle_b;
	})
}

/**
 * checks if a point is inside the hull of the points cloud
 * @param {number} x the tested point x coordinate 
 * @param {number} y the tested point y coordinate 
 */
PointCloud.prototype.inside = function(x,y){	
	var metrics = this.angles({x:x,y:y});
	var previous_angle = clipAnglePositive(metrics[this.points.length-1]);
	var diff = metrics[0] - previous_angle;
	var previous_sign = diff < 0 ? -1 : 1;
	var sum = 0;
	for(var i=0; i<this.points.length; i++){	
		diff = clipAngle(metrics[i] - previous_angle);
		sign = diff < 0 ? -1 : 1;
		sum+=diff;
		var previous_angle = metrics[i];
		var previous_sign = sign;

	}
	return Math.abs(sum) > 0.001;
	
}

/**
 * compute the points cloud AABB
 * @return {AABB} the axialy aligned bounding box of this points cloud
 */
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
	
	var w=bottomRight.x - topLeft.x,
		h=bottomRight.y - topLeft.y;
	
	return new AABB(
		topLeft.x,
		topLeft.y,
		w,
		h
	);
}


/**
 * plot the center and the circle at minimal and maximal distance of it
 * @param {object} paper the canvas dom element
 */
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

/**
 * draw the aabb of this points cloud
 * @param {object} paper the canvas dom node
 */
PointCloud.prototype.strokeAABB = function strokeAABB(paper){
	var ctx = paper.getContext("2d");
	
	ctx.strokeStyle = "#66F";
	var AABB = pointCloud.AABB();
	
	
	ctx.strokeRect(AABB.x, AABB.y, AABB.w, AABB.h);
}

/**
 * draw one of the cloud points
 * @param {number} p the point index
 * @param {object} paper the canvas dom node
 * @param {number} r the radius of the circle to draw
 */
PointCloud.prototype.drawPoint = function drawPoint(p, paper, r){
	if(p instanceof Number) p = this.points[p];
	var ctx = paper.getContext("2d");
	r = r || 5
	ctx.beginPath();
	ctx.arc(p.x,p.y, r, 0, Math.PI*2);
	ctx.closePath();
	
}



/**
 * generate a random points cloud in a box
 * @param {number} x the x coordinate of the bounding box
 * @param {number} y the y coordinate of the bounding box
 * @param {number} w the width of the bounding box
 * @param {number} h the height of the bounding box
 * @param {number} num the number of points to generate
 */
function randomPointCloud(x,y, w, h, num){
	var points = [];
	for(var i=0; i<num;i++){
		points.push(x+Math.random()*w);
		points.push(y+Math.random()*h);
	}
	var pointCloud = PointCloud.apply(new PointCloud(), points);
	return pointCloud;
}


/**
 * generate a random points cloud in a donut
 * @param {number} x the x coordinate of the center of the bounding circles
 * @param {number} y the y coordinate of the center of the bounding circles
 * @param {number} r_min the minimum distance to the center
 * @param {number} r_max the maximum distance to the center
 * @param {number} num the number of points to generate
 */
function randomPointCloudFromCenter(x,y, r_min, r_max, num){
	var points = [];
	for(var i=0; i<num;i++){
		var angle = Math.random()*2*Math.PI;
		var distance = r_min + Math.random()*(r_max-r_min);
		points.push(x+Math.cos(angle)*distance);
		points.push(y+Math.sin(angle)*distance);
	}
	var pointCloud = PointCloud.apply(new PointCloud(), points);
	return pointCloud;
}

/**
 * generate a random points cloud around a circle
 * @param {number} x the x coordinate of the center of the reference circle
 * @param {number} y the y coordinate of the center of the reference circle
 * @param {number} r the radius of the reference circle
 * @param {number} delta the variation factor of points against the refernce circle 
 * @param {number} num the number of points to generate
 */
function randomPointCloudFromCircle(x,y, r, delta, num){
	var points = [];
	for(var i=0; i<num;i++){
		var angle = Math.random()*2*Math.PI;
		var distance = r + Math.random()*delta*2-delta;
		points.push(x+Math.cos(angle)*distance);
		points.push(y+Math.sin(angle)*distance);
	}
	var pointCloud = PointCloud.apply(new PointCloud(), points);
	return pointCloud;
}




/**
 * generate a random points cloud around a donut
 * @param {number} x the x coordinate of the center of the reference circle
 * @param {number} y the y coordinate of the center of the reference circle
 * @param {number} r the radius of the reference circle
 * @param {number} delta the variation factor of points against the refernce circle 
 * @param {number} num the number of points to generate
 */
function randomDonut(x,y, r, delta, num){
	var points = [];
	for(var i=0; i<num;i++){
		var angle = Math.random()*2*Math.PI;
		var distance1 = r + Math.random()*delta*2-delta;
		points.push(x+Math.cos(angle)*distance1);
		points.push(y+Math.sin(angle)*distance1);
	}
	var pointCloud = PointCloud.apply(new PointCloud(), points);

	var center = pointCloud.center();
	
	var metrics = pointCloud.distancesAndAngles(center);
	
	var points2 = [];
	
	for(var i=0; i<num;i++){
		var rnd= 1.3 +Math.random();
		points2.push(center.x+Math.cos(metrics[i].angle)*metrics[i].distance*rnd);
		points2.push(center.y+Math.sin(metrics[i].angle)*metrics[i].distance*rnd);
	}
	var pointCloud2 = PointCloud.apply(new PointCloud(), points2);

	return {
		inner: pointCloud,
		outer: pointCloud2
	};
}


/**
 * generate a ring of point
 * @param {number} x the x coordinate of the center of the reference circle
 * @param {number} y the y coordinate of the center of the reference circle
 * @param {number} d the radius of the reference circle
 * @param {number} num the number of points to generate
 */
function ring(x,y,d,num){
	var points = [];
	var angle = Math.PI*2/num;
	var i = 0;
	for(;i<num;i++){
		points.push(x+Math.cos(i*angle)*d);
		points.push(y+Math.sin(i*angle)*d);
	}
	return PointCloud.apply(new PointCloud(), points);
}


/**
 * genrate a random donut (two rings with matching point at same angle from center)
 * @param {number} x the x coordinate of the center of the reference circle
 * @param {number} y the y coordinate of the center of the reference circle
 * @param {number} d the radius of the reference circle
 * @param {number} num the number of points to generate
 */
function randomSimpleDonut(x,y, r, delta, num){
	var points = [];
	for(var i=0; i<num;i++){
		var angle = Math.random()*2*Math.PI;
		var distance1 = r + Math.random()*delta*2-delta;
		points.push(x+Math.cos(angle)*distance1);
		points.push(y+Math.sin(angle)*distance1);
	}
	var pointCloud = PointCloud.apply(new PointCloud(), points);

	var center = pointCloud.center();
	
	var metrics = pointCloud.distancesAndAngles(center);
	
	var points2 = [];
	
	for(var i=0; i<num;i++){
		var rnd= 1.7;
		points2.push(center.x+Math.cos(metrics[i].angle)*metrics[i].distance*rnd);
		points2.push(center.y+Math.sin(metrics[i].angle)*metrics[i].distance*rnd);
	}
	var pointCloud2 = PointCloud.apply(new PointCloud(), points2);

	return {
		inner: pointCloud,
		outer: pointCloud2
	};
}

