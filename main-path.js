
var paper = Raphael("paper", 650, 400);
			
var player = new Bob(325, 200, 10, -45, true);
var path = new Path(
	300, 120, 
	390, 260, 
	180, 132,
	200, 200 
);

var drawables = [];
drawables.push(player);
drawables.push(path);

$("#paper").on("click", function(evt){
	console.log(Raphael.isPointInsidePath(player.sightPath(), evt.clientX, evt.clientY));
})


function draw(){

	paper.clear();

	for(var i=0; i<path.segments.length;i++) player.collidesWithSegment(path.segments[i]);


	
	var color = "#FFFFFF";
	if(true || path.isSeenByBob(player)) color = "#FF0000";
	player.sightColor = color;

	for(var i =0; i<drawables.length;i++){
		drawables[i].draw(paper);
	}
	
	var seenSegments = path.seenSegments(player);
	for(i=0;i<seenSegments.length;i++){
		paper.path(seenSegments[i].path()).attr({
			"stroke": "#F88",
			"stroke-width": 10
		})
		
		seenSegments[i].drawShadow(player);
	}
	
	
	/*
	var closest = segment.closestPointFrom(player.x, player.y);
	
	var point = circle(closest.x, closest.y, 2, 0);
	paper.path(point).attr({
		"fill":"#C1002A",
		"stroke":"#C1002A",
		"stroke-width":1
	});
	
	
	if(segment.isSeenByBob(player)){
		segment.drawShadow(player);
	}
	
	
	var sol = segment.intersectWithCone(player.x, player.y, player.sightLength, player.angle, player.sightWidth); 
	if(sol.length>0){
		for(i=0;i<sol.length;i++){
			paper.path(circle(sol[i].x,sol[i].y,3,0)).attr({
				"fil":"#00F",
				"stroke":"#00F",
				"stroke-width":1
			});
		}
	}
	*/ 
}

setInterval(draw, 1000/25);
keyboardControl(player);
