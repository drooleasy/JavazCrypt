function Glass(){
	var that = this instanceof Glass ? this : new Glass(0,0,0,0);
	
	if(!Glass.router.route(that, arguments)) throw "Invalid arguments";


	that.shadow = null;
	that.style = {
		"fill":"#000",
		"stroke":"#000000",
		"stroke-width":2,
		"stroke-linecap":"round"
	};
	that.openess = 0;
	
	that.center = -1; // -1...1
	
	return that;
}


Glass.router = new ArgRouter();
Glass.router.combine(Point.route("a"), Point.route("b"));



Glass.prototype = new Segment();
Glass.prototype.constructor = Glass;



Glass.prototype.castShadow = function castGlassShadow(bob_or_light){

}


Glass.prototype.castTint = function castSegmentShadow(bob_or_light){
	var metrics_a = distanceAndAngle(bob_or_light.x, bob_or_light.y, this.a.x, this.a.y),
		metrics_b = distanceAndAngle(bob_or_light.x, bob_or_light.y, this.b.x, this.b.y);

	
	var angle_a = metrics_a.angle - bob_or_light.angle,
		angle_b = metrics_b.angle - bob_or_light.angle;

	var distance_a = metrics_a.distance,
		distance_b = metrics_b.distance;

	if(distance_a > bob_or_light.sightLength && distance_b > bob_or_light.sightLength){
		return;
	};

	angle_a = clipAnglePositive(angle_a);
	angle_b = clipAnglePositive(angle_b);
	
	
	var mn = Math.min(angle_a, angle_b);
	var mx = Math.max(angle_a, angle_b);
	
	
	
	var left,
		right;
	if(mn==angle_a){
		left = this.a;
		right = this.b;
	}else{
		left = this.b;
		right = this.a
	}


	var diff = clipAnglePositive(mx-mn);	
	var tmp;
	if(diff > Math.PI){
		tmp = left;
		left = right;
		right = tmp;
	}

	
	var ray_1 = castRay(bob_or_light.x, bob_or_light.y, left.x, left.y, bob_or_light.sightLength);
	var ray_2 = castRay(bob_or_light.x, bob_or_light.y, right.x, right.y, bob_or_light.sightLength);
	
	var angle_1 = angleBetween(bob_or_light.x, bob_or_light.y, ray_1.a.x, ray_1.a.y),
		angle_2 = angleBetween(bob_or_light.x, bob_or_light.y, ray_2.a.x, ray_2.a.y);
	
	
	var coneData = {
			x:bob_or_light.x,
			y:bob_or_light.y,
			ray_1 : ray_1,
			ray_2 : ray_2,
			angle_1 : angle_1,
			angle_2 : angle_2,
			radius : bob_or_light.sightLength
		}

	
	bob_or_light.tints.paths.push(coneData);

}



Glass.prototype.seenSegment = function(bob, segments){
	var segments = Segment.prototype.seenSegment.apply(this, arguments);
	for(var i=0; i<segments.length; i++){
		segments[i] = new Glass(segments[i].a, segments[i].b);
	}
	return segments;
}
