function cliped(center, segments){
	var res = [];
	for(var i = 0; i < segments.length; i++){
		var segment = segments[i];
		var closest = segment.closestPointFrom(center.x, center.y);
		if(distanceBetween(center.x, center.y, closest.x, closest.y) < center.radius){
			var clipedSegment, metric_a, metric_b;
			var intersections = segment.intersectWithCircle(center.x, center.y, center.radius);
			if(intersections.length == 2){

				clipedSegment = new Segment(intersections[0].x, intersections[0].y, intersections[1].x, intersections[1].y);
			}else if(intersections.length  == 1){

				var intersectionPoint = intersections[0];
				metric_a = distanceAndAngle(center.x, center.y, segment.a.x, segment.a.y);
				metric_b = distanceAndAngle(center.x, center.y, segment.b.x, segment.b.y);

				if(metric_a.distance > center.radius){
					clipedSegment = new Segment(intersectionPoint.x, intersectionPoint.y, segment.b.x, segment.b.y);
				}else {
					clipedSegment = new Segment(segment.a.x, segment.a.y, intersectionPoint.x, intersectionPoint.y);
				}
			}else {
				clipedSegment = segment;
			}

			if(closest.x == clipedSegment.a.x && closest.y == clipedSegment.a.y){
				res.push(new SegmentToPoint(clipedSegment, center));
			}else if(closest.x == clipedSegment.b.x && closest.y == clipedSegment.b.y){
				res.push(new SegmentToPoint(clipedSegment, center).swap());

			}else{
				res.push(new SegmentToPoint(
					new Segment(closest.x, closest.y, clipedSegment.a.x, clipedSegment.a.y),
					center
				));
				res.push(new SegmentToPoint(
					new Segment(closest.x, closest.y, clipedSegment.b.x, clipedSegment.b.y),
					center
				));
			}
		} // if(distanceBetween(this.x, this.y, closest.x, closest.y) < this.sightLength){

	}
	return res;
}

function project(center, point, segmentToPoint){
	var rayon = castRay(center.x, center.y, point.x, point.y, center.radius);
	var res = rayon.intersect(segmentToPoint.segment);
	return res;

}


function obstruded(center, segmentFromPoints){
	var res = [];

	var data = segmentFromPoints.sort(function(a, b){
		return a.metric.closest.distance - b.metric.closest.distance
	});
	while(data.length){
		var first = data.shift().clockwise();
		for(var i=0; i<data.length; i++){
			var other = data[i].clockwise();
			if(false && other.isSinglePoint()){
				data.splice(i, 1);
				continue;
			}
			if(first.metric.a.angle < other.metric.a.angle){ // [first.a, other.a]
				if(first.metric.b.angle > other.metric.a.angle){ // [first.a, other.a] [other.a first.b]
					if(first.metric.b.angle > other.metric.b.angle){ // [first.a, other.a] [other.a first.b] [other.b, first.b]
						data.splice(i, 1);
					}else{ // first.metric.b.angle < othermetric..b.angle // [first.a, other.a] [other.a first.b] [first.b other.b]
						//neo project first.b over other, other.b
						var prj = project(center, first.segment.b, other);
						var neo = null;
						if(prj){
							var neo = new SegmentToPoint(
								new Segment(
									prj.x,
									prj.y,
									other.segment.b.x,
									other.segment.b.y
								),
								center
							);
							if(neo.isSinglePoint()){
								neo = null;
							}
						}
						if(neo){
							data.splice(i, 1, neo);
							data.sort(function(a, b){
									return a.metric.closest.distance - b.metric.closest.distance
								});
						}else{
							data.splice(i, 1);
						}
					}
				}else{ // first.metric.a.angle < other.metric.a.angle && first.metric.b.angle < other.metric.a.angle
						// [first.a, other.a] [first.b other.a]
					// visible, do nada
				}
			}else{ // first.metric.a.angle > other.metric.a.angle // [other.a, first.a]
				if(first.metric.a.angle < other.metric.b.angle){ // [other.a, first.a] [first.a other.b]
					if(first.metric.b.angle > other.metric.b.angle){ // [other.a, first.a] [first.a other.b] [other.b first.a]

						var prj = project(center, first.segment.a, other);
						var neo = null;
						if(prj){
							neo = new SegmentToPoint(
								new Segment(
									other.segment.a.x,
									other.segment.a.y,
									prj.x,
									prj.y
								),
								center
							);
							if(neo.isSinglePoint()){
								neo = null;
							}
						}
						if(neo){
							data.splice(i, 1, neo);
							data.sort(function(a, b){
								return a.metric.closest.distance - b.metric.closest.distance
							});
						}else{
							data.splice(i, 1);
						}
					}else{ // first.metric.b.angle < other.metric.b.angle // [other.a, first.a] [first.a other.b] [first.b, other.b]
						var prj1 = project(center, first.segment.a, other);
						var prj2 = project(center, first.segment.b, other);
						var neo1 = null;;
						var neo2 = null;;
						if(prj1){
							var neo1 = new SegmentToPoint(
								new Segment(
									other.segment.a.x,
									other.segment.a.y,
									prj1.x,
									prj1.y
								),
								center
							);
							if(neo1.isSinglePoint()){
								neo1 = null;
							}
						}
						if(prj2){
							var neo2 = new SegmentToPoint(
								new Segment(
									prj2.x,
									prj2.y,
									other.segment.b.x,
									other.segment.b.y
								),
								center
							);
							if(neo2.isSinglePoint()){
								neo2 = null;
							}
						}
						if(neo1 && neo2) data.splice(i, 1, neo1, neo2);
						else if(neo1) data.splice(i, 1, neo1);
						else if(neo2) data.splice(i, 1, neo2);
						else data.splice(i, 1);
						if(neo1 || neo2) data.sort(function(a, b){
							return a.metric.closest.distance - b.metric.closest.distance
						});
					}
				}else{ // first.metric.a.angle > other.metric.a.angle && first.metric.a.angle > other.metric.b.angle
						// // [other.a, first.a] [other.b, first.a]
					// visible, do nada
				}
			}
		}


		res.push(first);
	}


	return res;
}