
var paper = Raphael("paper", 650, 400);
			
var player = new Bob(325, 200, 10, -45, true);
var segment = new Segment(300, 120, 390, 260);

var drawables = [];
drawables.push(player);
drawables.push(segment);

$("#paper").on("click", function(evt){
	console.log(Raphael.isPointInsidePath(player.sightPath(), evt.clientX, evt.clientY));
})


function draw(){

	paper.clear();
	
	var color = "#FFFFFF";
	if(segment.isSeenByBob(player)) color = "#FF0000";
	player.sightColor = color;

	for(var i =0; i<drawables.length;i++){
		drawables[i].draw(paper);
	}
	
	/*
	if(Raphael.isBBoxIntersect(Raphael.pathBBox(player.sightPath()), Raphael.pathBBox(other.bodyPath())) 
		&& Raphael.pathIntersection(player.sightPath(), other.bodyPath()).length >0){
		console.log("touch!!!");	
	}
	
	if(Raphael.isPointInsidePath(player.sightPath(), other.x, other.y)){
		console.log("in!!!");	
	}
	
	*/
	
	
	var closest = segment.closestPointFrom(player.x, player.y);
	
	var point = circle(closest.x, closest.y, 2, 0);
	paper.path(point).attr({
		"fill":"#C1002A",
		"stroke":"#C1002A",
		"stroke-width":1
	});
	
	//player.fovSegments().left.draw(paper);
	
	if(segment.isSeenByBob(player)){
		var seenSeg = segment.seenSegment(player);
		if(seenSeg){
			paper.path(seenSeg.path()).attr({
				"fill":"#8FF",
				"stroke":"#8FF",
				"stroke-width":3
			});
			
			var ray_1 = castRay(player.x, player.y, seenSeg.a.x, seenSeg.a.y, player.sightLength);
			var ray_2 = castRay(player.x, player.y, seenSeg.b.x, seenSeg.b.y, player.sightLength);
			
			paper.path(ray_1.path()).attr({"stroke":"#3F3", "stroke-width":3});
			paper.path(ray_2.path()).attr({"stroke":"#3F3", "stroke-width":3});
			
			
			/*var */angle_1 = distanceAndAngle(player.x, player.y, ray_1.a.x, ray_1.a.y).angle - player.angle,
				angle_2 = distanceAndAngle(player.x, player.y, ray_2.a.x, ray_2.a.y).angle - player.angle;
			
			
			startAngle =  Math.min(angle_1, angle_2);
			endAngle = Math.max(angle_1, angle_2);
			
			startAngle = angle_1;
			endAngle = angle_2;
			
			var seg  = new Segment(ray_2.a.x, ray_2.a.y, ray_1.a.x, ray_1.a.y)
			
			var path = "M" + ray_1.a.x + " " + ray_1.a.y
				+ "L" + ray_1.b.x + " " + ray_1.b.y
				+ paper.circularArc(player.x, player.y, player.sightLength, player.angle+startAngle, player.angle+endAngle) 
				+ "L" + ray_2.a.x + " " + ray_2.a.y
				+ "L" + ray_1.a.x + " " + ray_1.a.y;
			//console.log(path);
			paper.path(
				path
			).attr({"fill":"#444","stroke":"#FFF", "stroke-width":5});
			
			paper.path(
				"M" + ray_1.a.x + " " + ray_1.a.y
				+ "L" + ray_1.b.x + " " + ray_1.b.y
			).attr({"fill":"#444","stroke":"#888", "stroke-width":5});
			
		}
	}
	
	
	if(segment.intersectWithCircle(player.x, player.y, player.sightLength)){
		//console.log("yo")
	}
	
	
	var sol = segment.intersectWithCone(player.x, player.y, player.sightLength, player.angle, player.sightWidth); 
	if(sol.length>0){
		//console.log("yaradilliou")
		for(i=0;i<sol.length;i++){
			paper.path(circle(sol[i].x,sol[i].y,3,0)).attr({
				"fil":"#00F",
				"stroke":"#00F",
				"stroke-width":1
			});
		}
	}
}

setInterval(draw, 1000/25);
keyboardControl(player);
