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
	this.sightWidth = sightWidth || Light.defaults.sightWidth;


	this.lineWidth = Light.defaults.lineWidth;
	this.lineColor = Light.defaults.lineColor;

	this.lightColor = Light.defaults.lightColor;
	this.shadowColor = Light.defaults.shadowColor;

	this.startDecay = Light.defaults.startDecay;
	this.decayVariation = Light.defaults.decayVariation;

	this.shadow = new Shadow();

	this.belongsTo = null;

	this.renderer = document.createElement("canvas");
	this.renderer.width = this.sightLength *2;
	this.renderer.height = this.sightLength *2;

}
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



  var reachableSegments = this.getReachableSegments(segments);


/*
	for(var i=0; i<reachableSegments.length; i++){
		var seg = reachableSegments[i].segment;
		ctx.beginPath();

		ctx.moveTo(seg.a.x, seg.a.y);
		ctx.lineTo(seg.b.x, seg.b.y);
		ctx.stroke();

	}
*/

var cliping = [];


if(reachableSegments.length){

	for(var i=0; i< reachableSegments.length; i++){


		var reachableSegment = reachableSegments[i],
				segment = reachableSegment.segment,
				metric_a = reachableSegment.metric_a,
				metric_b = reachableSegment.metric_b;



		/*
		$('#hud').html(
			'a : ' + clipAnglePositive(metric_a.angle).toFixed(2)
			+'<br/>b : ' + clipAnglePositive(metric_b.angle).toFixed(2)
			+'<br/>diff : ' + clipAnglePositive(metric_b.angle - metric_a.angle).toFixed(2)
		)
		*/
		// dot the start point
		/*ctx.fillStyle = '#0F0'
		ctx.beginPath();
		ctx.arc(reachableSegments[0].segment.a.x, reachableSegments[0].segment.a.y, 10, 0, 2*Math.PI);
		ctx.closePath();
		ctx.fill();
		*/

		cliping.push({
			type:"segment",
			x1: segment.a.x,
			y1: segment.a.y,
			x2: segment.b.x,
			y2: segment.b.y

		});




		if(i+1<reachableSegments.length){ // next segment
			var nextReachable = reachableSegments[i+1],
					nextSegment = nextReachable.segment,
					next_metric_a = nextReachable.metric_a,
					next_metric_b = nextReachable.metric_b;

			if(nextSegment.a.x == segment.b.x && nextSegment.a.y == segment.a.y){

			}


		}else{


			var first = {
				x: cliping[0].x1,
				y: cliping[0].y1,
				angle: angleBetween(this.x, this.y, cliping[0].x1, cliping[0].y1)
			};

			if( segment.b.x != first.x || segment.b.y != first.y){



				// path to perimeter
				var ray = castRay(
					this.x, this.y,
					segment.b.x, segment.b.y,
					this.sightLength
				).inversed();

				cliping.push({
					type:"segment",
					x1: ray.a.x,
					y1: ray.a.y,
					x2: ray.b.x,
					y2: ray.b.y

				});


				// perimeter

				cliping.push({
					type:"arc",
					from: metric_b.angle,
					to: first.angle,
				})

				// closing
				// path from perimeter
				ray = castRay(
					this.x, this.y,
					first.x, first.y,
					this.sightLength
				);

				cliping.push({
					type:"segment",
					x1: ray.b.x,
					y1: ray.b.y,
					x2: ray.a.x,
					y2: ray.a.y

				});

			}

			/*

			a.x == -1.b.x && a.y == -1.b.y
				seg

			else a.angle < -1.b.angle
				a.distance < -1.b.distance
						intersect
						seg
						seg
				else
						intersect
						seg
						seg

			else
					inter circle
					seg
					arc
					seg
					seg
			 */



			//cliping.push({type:"arc", from:reachableSegments[0].metric_b.angle, to:2*Math.PI});
			}
		}// end for
	}else{
		cliping.push({type:"arc", from:0, to:2*Math.PI});
	}

	// draw
	ctx.strokeStyle='#FF0';
	ctx.beginPath();
	for(var i=0; i<cliping.length;i++){
		var path = cliping[i];
		if(path.type == "arc"){
				ctx.arc(this.x, this.y, this.sightLength, path.from, path.to);
		}else if(path.type == "segment"){
				ctx.moveTo(path.x1, path.y1);
				ctx.lineTo(path.x2, path.y2);
		}

	}
	ctx.stroke();
	if(reachableSegments.length){
			for(var i=0; i< reachableSegments.length; i++){


				var reachableSegment = reachableSegments[i];

				drawReachableSegment(ctx, reachableSegment, i==0);
			}
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

function drawReachableSegment(ctx, reachableSegment, markClosest){

	var segment = reachableSegment.segment;
	var angle = angleBetween(segment.a.x, segment.a.y, segment.b.x, segment.b.y);
	ctx.strokeStyle = randomColor();
	ctx.fillStyle = ctx.strokeStyle;

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
		ctx.arc(reachableSegment.closest.x, reachableSegment.closest.y, 10, 0, 2*Math.PI);
		ctx.closePath();
		ctx.fill();
	}
}


Light.prototype.getReachableSegments = function(segments){
  var res = [];
			treated = []
  var l_aabb = this.AABB();
	// WORLD SHADOWS
	var lightPoint = new Point(this.x, this.y);
	if(segments){
		for(i=0;i<segments.length;i++){

			var segment = segments[i];
			var s_aabb = segment.AABB();
			if(!l_aabb.intersects(s_aabb)){
				continue;
			}




			var closest = segment.closestPointFrom(this.x, this.y),
					metric_closest = distanceAndAngle(this.x, this.y, closest.x, closest.y);

			if(distanceBetween(this.x, this.y, closest.x, closest.y) < this.sightLength){
				var clipedSegment, metric_a, metric_b;
				var intersections = segment.intersectWithCircle(this.x, this.y, this.sightLength);
				if(intersections.length == 2){

					clipedSegment = new Segment(intersections[0].x, intersections[0].y, intersections[1].x, intersections[1].y);
					metric_a = distanceAndAngle(this.x, this.y, clipedSegment.a.x, clipedSegment.a.y);
					metric_b = distanceAndAngle(this.x, this.y, clipedSegment.b.x, clipedSegment.b.y);

				}else if(intersections.length  == 1){

					var intersectionPoint = intersections[0];
					metric_a = distanceAndAngle(this.x, this.y, segment.a.x, segment.a.y);
					metric_b = distanceAndAngle(this.x, this.y, segment.b.x, segment.b.y);

					if(metric_a.distance > this.sightLength){
						clipedSegment = new Segment(intersectionPoint.x, intersectionPoint.y, segment.b.x, segment.b.y);
						metric_a = distanceAndAngle(this.x, this.y, clipedSegment.a.x, clipedSegment.a.y);
					}else {
						clipedSegment = new Segment(segment.a.x, segment.a.y, intersectionPoint.x, intersectionPoint.y);
						metric_b = distanceAndAngle(this.x, this.y, clipedSegment.b.x, clipedSegment.b.y);
					}

				}else {

					clipedSegment = segment;
					metric_a = distanceAndAngle(this.x, this.y, segment.a.x, segment.a.y);
					metric_b = distanceAndAngle(this.x, this.y, segment.b.x, segment.b.y);

				}

/*
				var orientedSegment;

				var angular_difference = clipAnglePositive(metric_b.angle) - clipAnglePositive(metric_a.angle);

				if(
						clipAnglePositive(angular_difference) > Math.PI
				){
					orientedSegment = clipedSegment.inversed();
					var tmp = metric_a;
					metric_a = metric_b;
					metric_b = tmp;
				}else {
					orientedSegment = clipedSegment.clone();
				}
*/


				if(closest.x == clipedSegment.a.x && closest.y == clipedSegment.a.y){
					treated.push({
						segment:clipedSegment,
						metric_a: metric_a,
						metric_b: metric_b,
						closest:closest,
						metric_closest: metric_closest
					});
				}else if(closest.x == clipedSegment.b.x && closest.y == clipedSegment.b.y){
					treated.push({
						segment:clipedSegment.inversed(),
						metric_a: metric_b,
						metric_b: metric_a,
						closest:closest,
						metric_closest: metric_closest
					});

				}else{
					treated.push({
						segment: new Segment(closest.x, closest.y, clipedSegment.a.x, clipedSegment.a.y),
						metric_a: metric_closest,
						metric_b: metric_a,
						closest:closest,
						metric_closest: metric_closest
					});
					treated.push({
						segment: new Segment(closest.x, closest.y, clipedSegment.b.x, clipedSegment.b.y),
						metric_a: metric_closest,
						metric_b: metric_b,
						closest:closest,
						metric_closest: metric_closest
					});
				}
			} // if(distanceBetween(this.x, this.y, closest.x, closest.y) < this.sightLength){
		}// for segments

	treated = treated.sort(function(s1, s2){
		return  s1.metric_closest.distance -s2.metric_closest.distance;
	})


	var filtered = [];
	while(treated.length){
		var first = treated.splice(0,1)[0];
		filtered.push(first);
		// looks for intersepted segments
		var first_length = distanceBetween(first.segment.a.x, first.segment.a.y, first.segment.b.x, first.segment.b.y);

		var toRemove = [];
		var neos = [];
		for(var i=0; i<treated.length; i++){
			var other = treated[i];
			var other_length = distanceBetween(other.segment.a.x, other.segment.a.y, other.segment.b.x, other.segment.b.y);
			var bigger, smaller, is_frist_bigger
			if(first_length > other_length){
				bigger = first;
				smaller = other;
				is_first_bigger = true;
			}else{
				bigger = other;
				smaller = first;
				is_first_bigger = false;
			}

			var tmp;
			var bigger_span = clipAnglePositive(bigger.metric_b.angle - bigger.metric_a.angle);
			if(bigger_span > Math.PI) {
				bigger.segment = bigger.segment.inversed();
				tmp = bigger.metric_a;
				bigger.metric_a = bigger.metric_b;
				bigger.metric_b = tmp;
				bigger_span -= Math.PI;
			}

			var smaller_span = clipAnglePositive(smaller.metric_b.angle - smaller.metric_a.angle);
			if(smaller_span > Math.PI) {
				smaller.segment = smaller.segment.inversed();
				tmp = smaller.metric_a;
				smaller.metric_a = smaller.metric_b;
				smaller.metric_b = tmp;
				smaller_span -= Math.PI;
			}

			var relative_span_a = clipAnglePositive(smaller.metric_a.angle - bigger.metric_a.angle);
			var relative_span_b = clipAnglePositive(smaller.metric_b.angle - bigger.metric_a.angle);

			if(relative_span_a < bigger_span && relative_span_b < bigger_span){
				if(is_first_bigger){
					// remove other
					toRemove.push(i);
				}else{
					console.log("todo")
				}
			}else if(relative_span_a < bigger_span){
					if(relative_span_b > Math.PI){
						if(other.metric_a.distance < first.metric_b.distance){
							var ray = castRay(
								this.x, this.y,
								other.segment.b.x, other.segment.b.y,
								this.sightLength
							);
							var intersect = ray.intersect(first.segment);
							var neoSegment = new Segment(intersect.x, intersect.y, first.segment.b.x, first.segment.b.y);
							first.segment = neoSegment;
							first.metric_a = distance;
//							neos.push(neoSegment);
						}else{
							var ray = castRay(
								this.x, this.y,
								first.segment.b.x, first.segment.b.y,
								this.sightLength
							);
							var intersect = ray.intersect(other.segment);
							var neoSegment = new Segment(intersect.x, intersect.y, other.segment.b.x, other.segment.b.y);
							first.segment = neoSegment;
							first.metric_a = distance;
//							neos.push(neoSegment);
						}
					}else {
						console.log('todo 2')
					}
				}
			}

		if(toRemove.length){
			for(var i=0; i<toRemove.length; i++){
				treated.splice(toRemove[i], 1);
			}
		}

		// resort treated
		treated = treated.sort(function(s1, s2){
			return  s1.metric_closest.distance -s2.metric_closest.distance;
		})

	}
}
/*
		for(var i=0; i<res.length; i++){
			console.log(clipAnglePositive(res[i].metric_a.angle));
		}
		debugger;
	*/
	res = filtered;
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
