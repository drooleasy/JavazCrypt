
var paper = Raphael("paper", 650, 400);
			
var player = new Bob(325, 200, 10, -45);
var other = new Bob(335, 220, 10, -90);

var drawables = [];
//drawables.push(player);
drawables.push(other);

var segment = new Segment(300, 120, 390, 260);
drawables.push(segment);




$("#paper").on("click", function(evt){
	console.log(Raphael.isPointInsidePath(player.sightPath(), evt.clientX, evt.clientY));
})


function draw(){

	paper.clear();
	
	player.collidesWithBob(other);
	player.collidesWithSegment(segment);

	
	var color = "#FFFFFF";
	if(player.sees(other) || segment.isSeenByBob(player)) color = "#FF0000";
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
	
	player.drawSight(paper);
	
	if(player.sees(other)){
		other.drawShadow(paper, player);
	}
	
	if(segment.isSeenByBob(player)){
		segment.drawShadow(paper, player);
	}

	player.draw(paper);

}

setInterval(draw, 1000/25);
keyboardControl(player);
