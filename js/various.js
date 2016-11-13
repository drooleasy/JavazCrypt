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
				if(segment.isBob) clipedSegment.isBob = true;
			}else if(intersections.length  == 1){

				var intersectionPoint = intersections[0];
				metric_a = distanceAndAngle(center.x, center.y, segment.a.x, segment.a.y);
				metric_b = distanceAndAngle(center.x, center.y, segment.b.x, segment.b.y);

				if(metric_a.distance > center.radius){
					clipedSegment = new Segment(intersectionPoint.x, intersectionPoint.y, segment.b.x, segment.b.y);
				}else {
					clipedSegment = new Segment(segment.a.x, segment.a.y, intersectionPoint.x, intersectionPoint.y);
				}
				if(segment.isBob) clipedSegment.isBob = true;
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
    if(a.metric.closest.distance == b.metric.closest.distance){
        return b.angle - a.angle
      }
    return a.metric.closest.distance - b.metric.closest.distance
	});
	while(data.length){
		var first = data.shift().clockwise();
		res.push(first);
    var rest = [];
    for(var i=0; i<data.length; i++){
			var other = data[i].clockwise();


      var a = clipAnglePositive(other.metric.a.angle - first.metric.a.angle);
      var b = clipAnglePositive(other.metric.b.angle - first.metric.a.angle);
      var w = clipAnglePositive(first.metric.b.angle - first.metric.a.angle);
//debugger;
      if(a > Math.PI && b > w && b < Math.PI){
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
              prj1.y,
							isBob = !!other.isBob
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
              other.segment.b.y,
							isBob = !!other.isBob
            ),
            center
          );
          if(neo2.isSinglePoint()){
            neo2 = null;
          }
        }
       if(neo1){
         rest.push(neo1);
         //console.log("neo1")
       }
       if(neo2){
         rest.push(neo2);
        // console.log("neo2")
       }

     }else if( a <= w && b > w){
        var prj = project(center, first.segment.b, other);
        var neo = null;
        if(prj){
          var neo = new SegmentToPoint(
            new Segment(
              prj.x,
              prj.y,
              other.segment.b.x,
              other.segment.b.y,
							isBob = !!other.isBob
            ),
            center
          );
          if(neo.isSinglePoint()){
            neo = null;
          }
        }
        if(neo){
          rest.push(neo);
        }

      }else if( a <= w && b <= w){
        // skip
      }else if(a  > Math.PI && b <= w){
        var prj = project(center, first.segment.a, other);
        var neo = null;
        if(prj){
          var neo = new SegmentToPoint(
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
          rest.push(neo);
        }



      }else{
        rest.push(other);
      }




    }//enfor

    data = rest.sort(function(a, b){
      return a.metric.closest.distance - b.metric.closest.distance
    });;

  }// end while

	return res;
}
