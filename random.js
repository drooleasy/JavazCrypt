
function randomPointCloud(x,y, w, h, num){
	var points = [];
	for(var i=0; i<num;i++){
		points.push(x+Math.random()*w);
		points.push(y+Math.random()*h);
	}
	var pointCloud = PointCloud.apply(new PointCloud(), points);
	return pointCloud;
}



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


function randomTowardLeft(p){ // bias : 0, .5,  1
	p = p || 2;
	var r = Math.random(),
		s = 1;
	r = Math.pow(r, p);
	return 0 + s * r;
}


function randomTowardRight(p){ // bias : 0, .5,  1
	p = p || 2; 
	var r = Math.random(),
		s = -1;
	r = Math.pow(r, p);
	return 1 + s * r;
}


function randomTowardCenter(p){ // bias : 0, .5,  1
	p = p || 2; 
	var r = Math.random(),
		s = Math.random()>.5 ? 1 : -1;
	r = Math.pow(r, p) / Math.pow(2,p-1);
	
	return .5 + s * r;
}

function randomBiased(bias, p){
	p = p || 2; 
	if(bias == 0) return randomTowardCenter(p);
	else if(bias > 0) return randomTowardRight(p);
	else return randomTowardLeft(p);
}


function test(){

	var n = 1000;
	var left =0,
		center = 0,
		right = 0,
		bias = 2;
	for(var i=0; i<n; i++){
	   left+= randomBiased(-1, bias);
	   center+= randomBiased(0, bias);
	   right+= randomBiased(1, bias);
	}
	console.log("left: " + left/n);
	console.log("centert: "+center/n);
	console.log("right: " + right/n);
	
}
