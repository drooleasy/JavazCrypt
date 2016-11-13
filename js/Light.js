/**
 * a light scource
 * @contructor
 * @param {number} x the x coordianate of the light (defaults to 0)
 * @param {number} y the y coordianate of the light (defaults to 0)
 * @param {number} sightLength the range of the light (defaults to 200)
 * @param {number} sightWidth the angular range of the light (defaults to 2PI)
 * @param {number} angle the orientation of the light (defaults to 0)
 */
function Light (x, y, sightLength, sightWidth, angle){
	this.x  = x || Light.defaults.x;
	this._x = x || Light.defaults.x;
	this.y  = y || Light.defaults.y;
	this._y = y || Light.defaults.y;
	this.positionVariation = Light.defaults.positionVariation;
	this.angle = angle || Light.defaults.angle;


	this.sightLength = sightLength || Light.defaults.sightLength;
	this._sightLength = sightLength || Light.defaults.sightLength;
	this.sightWidth = sightWidth || Light.defaults.sightWidth;


	this.lineWidth = Light.defaults.lineWidth;
	this.lineColor = Light.defaults.lineColor;

	this.lightColor = Light.defaults.lightColor;
	this.shadowColor = Light.defaults.shadowColor;

	this.startDecay = Light.defaults.startDecay;
	this.decayVariation = Light.defaults.decayVariation;

	this.shadow = new Shadow();

	this.belongsTo = null;

	//this.renderer = document.createElement("canvas");
	//this.renderer.width = this.sightLength *2;
	//this.renderer.height = this.sightLength *2;
	var that = this;

//	window.requestAnimationFrame(this.randomize);
}


Light.prototype.randomize = function(){
	this.x = this._x + Math.random()*6 - 3;
	this.y = this._y + Math.random()*6 - 3;
	this.sightLength = (1 - Math.pow(Math.random()/3,2)) * this._sightLength;
	var that = this;
	window.requestAnimationFrame(this.randomize);
};

/**
 * default light settings
 */
Light.defaults = {
	x:0,
	y:0,
	positionVariation : 2,

	angle: 0,

	sightWidth: PIPI,
	sightLength: 200,

	startDecay : 0.1,
	decayVariation : 0.1,

	lineWidth:1,
	lineColor : "#000",

	//lightColor : "rgba(48,144,48,1)",
	lightColor : "rgba(128,128,128,0.3)",
	shadowColor : "rgba(0,0,0,1)",


};

/**
 * move the light
 * @param {Point} pos the new position
 */
Light.prototype.moveTo = function(pos){
	this._x = pos.x;
	this._y = pos.y;
}

/**
 * draw this light on canvas
 * @param {object} paper the canvas dom element
 * @param {array} segments the segments the light can cast shadows from
 * @param {array} bobs the bobs the light can cast shadows from
 */
Light.prototype.draw = function(paper, segments, bobs){



	var ctx = paper.getContext('2d');
	ctx.fillStyle="#777";

  var reachableSegments = this.getReachableSegments(segments);


	if(reachableSegments.length){












		var center = {
			x: this._x + Math.random()*4-2,
			y: this._y + Math.random()*4-2,
			radius: this.sightLength * (1-Math.pow(Math.random()/3, 2))
		}


		var segs = [];


		for(var i=0; i<bobs.length; i++){
			var bob = bobs[i];
			if(bob.light === this) continue;
			var metric = distanceAndAngle(center.x, center.y, bob.x, bob.y);
			if(metric.distance < center.radius){
				var tangent1 = {};
				tangent1.x = bob.x + Math.cos(metric.angle + Math.PI/2) * bob.width;
				tangent1.y = bob.y + Math.sin(metric.angle + Math.PI/2) * bob.width;
				var tangent2 = {};
				tangent2.x = bob.x + Math.cos(metric.angle - Math.PI/2) * bob.width;
				tangent2.y = bob.y + Math.sin(metric.angle - Math.PI/2) * bob.width;
				var bobSegment = new Segment(tangent1.x, tangent1.y, tangent2.x, tangent2.y);
				bobSegment.isBob = true;
				reachableSegments.push(bobSegment);
			}
		}


		for(var i=0; i<reachableSegments.length;i++){
			var segment = reachableSegments[i];
			if(segment instanceof Glass){
				// dont push
			}else if( segment instanceof Door){
				var subs = segment.subSegments();
				segs.push(subs[0]);
				segs.push(subs[1]);
			}else{
				segs.push(segment);
			}
		}



		var clipeds = cliped(center, segs);
		var obs = obstruded(center, clipeds);


	/*	for(var i=0; i<obs.length; i++){
			ctx.beginPath()
			obs[i].draw(ctx, true, "#00F")
		}
*/

		if(!obs.length)
			$('#hud').html($('#hud').html() + "no obs<br/>");
		if(obs.length){
			$('#hud').html($('#hud').html() + "obs<br/>");

//for(var j = 0; j<obs.length;j++){
//obs[j].clockwise();
//}


obs = obs.sort(function(a, b){
		if(a.metric.closest.distance == b.metric.closest.distance){
				return b.angle - a.angle
			}
		return a.metric.closest.distance - b.metric.closest.distance
	});

for(var i=0; i<obs.length; i++){
//						ctx.beginPath()
//						obs[i].draw(ctx, true, "#00F", i+1)
	}
	var first = obs.shift();

	ctx.beginPath();
	//first.draw(ctx, false, "#FF0")

	var dbg_obs = [first];

	var grd=ctx.createRadialGradient(center.x,center.y,0,center.x,center.y,center.radius);
	grd.addColorStop(0,"rgba(255,255,255, 1)");
	grd.addColorStop(1,"rgba(0,0,0, .01)");

//ctx.fillStyle = "rgba(255,255,255,.5)"
ctx.fillStyle = grd;
ctx.beginPath();
ctx.moveTo(first.segment.a.x, first.segment.a.y);
ctx.lineTo(first.segment.b.x, first.segment.b.y);

var last = first;


function join(ctx, last, next, dontDrawNext){
	if(Math.abs(next.metric.a.angle - last.metric.b.angle) < 0.001){
		ctx.lineTo(next.segment.a.x, next.segment.a.y);

	}else{

		var rayon1 = castRay(center.x, center.y, last.segment.b.x, last.segment.b.y, center.radius);
		rayon1 = new SegmentToPoint(rayon1, center);
		rayon1.closeToFar();
		ctx.lineTo(rayon1.segment.b.x, rayon1.segment.b.y);
		var angleDiff = clipAnglePositive(next.metric.a.angle - rayon1.metric.b.angle);
		//var angleDiff = angleBetween(rayon1.segment.b.x, rayon1.segment.b.y, next.segment.a.x, next.segment.a.y) ;
		var ccw =	angleDiff > Math.PI;
		//if(dontDrawNext) ccw = !ccw;
		//if(angleDiff > Math.PI) ccw = !ccw;
		//if(angleDiff > Math.PI) console.log('kaput');
		ctx.arc(center.x, center.y, center.radius, clipAnglePositive(rayon1.metric.b.angle), clipAnglePositive(next.metric.a.angle));

		/*
		var rayon2 = castRay(center.x, center.y, next.segment.a.x, last.segment.a.y, center.radius);
		rayon2 = new SegmentToPoint(rayon2, center);
		rayon2.farToClose();
		ctx.lineTo(rayon2.segment.b.x, rayon2.segment.b.y);
		*/
		ctx.lineTo(next.segment.a.x, next.segment.a.y);
	}
	if(!dontDrawNext) ctx.lineTo(next.segment.b.x, next.segment.b.y);
}

while(obs.length){
	obs.sort(function(a,b){
			a.clockwise();
			b.clockwise();
		return clipAnglePositive(a.metric.a.angle.toFixed(3) - last.metric.b.angle.toFixed(3)) < clipAnglePositive(b.metric.a.angle.toFixed(3) - last.metric.b.angle.toFixed(3)) ? -1 : 1;


	});


	var next = obs.shift();
	join(ctx, last, next);
	last = next;
	dbg_obs.push(last);
	// obs[i].clockwise().draw(ctx, i==0, '#F00');

}

join(ctx, last, first, true);

			//ctx.clip();
		 			ctx.closePath();
		 			ctx.fill();
		 			//ctx.strokeStyle="#FFF";
		 			//ctx.stroke();


		}// if obs.length




	}else{
	//		console.log("berk")
			ctx.beginPath();
			ctx.arc(this.x, this.y, this.sightLength, 0, 2*Math.PI);
			ctx.fill();

}




}


function randomColor(){
	var res = "rgb(";
	for(var i=0; i<3;i++){
		if(i>0) res += ",";
		res += Math.floor(Math.random()*256);
	}
	res += ")";
	return res;
}



Light.prototype.getReachableSegments = function(segments){
  var res = [];
			treated = []
  var l_aabb = this.AABB();
	if(segments){
		for(i=0;i<segments.length;i++){

			var segment = segments[i];
			var s_aabb = segment.AABB();
			if(!l_aabb.intersects(s_aabb)){
				continue;
			}
			res.push(segment);
		}
	}
  return res;
}

/**
 * axially aligned bouding box for the light range with a tolerance factor
 * @param {number} tolerance the tolerance (scale) for the AABB
 * @return {AABB} the bounding box for this light range
 */
Light.prototype.AABB = function lightAABB(tolerance){
	var topLeft = {
		x : this.x - this.sightLength,
		y : this.y - this.sightLength
	}
	var w = this.sightLength*2;
	var h = this.sightLength*2;

	var w2 = w*tolerance;
	var h2 = h*tolerance;

	topLeft.x += (w-w2)/2;
	topLeft.y += (h-h2)/2;

	return new AABB(
		topLeft.x,
		topLeft.y,
		w2,
		h2
	);

}
