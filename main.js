
var paper = Raphael("paper", 650, 400);
			
var player = new Bob(325, 200, 10, -45, true);
var other = new Bob(375, 220, 10, -90, false);

var drawables = [];
drawables.push(player);
drawables.push(other);

$("#paper").on("click", function(evt){
	console.log(Raphael.isPointInsidePath(player.sightPath(), evt.clientX, evt.clientY));
})


function draw(){

	paper.clear();
	
	var color = "#FFFFFF";
	if(player.sees(other)) color = "#FF0000";
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
	
	if(player.sees(other)){
		other.drawShadow(player);
	}
	
	
}

setInterval(draw, 1000/25);
keyboardControl(player);
