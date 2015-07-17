
var paper = Raphael("paper", 650, 400);
			
var player = new Bob(325, 200, 10, -45);

var other = new Bob(375, 220, 10, -90);


var path = new Path(
	500, 100, 
	500, 300, 
	100, 300,
	100, 100, 
	250, 200 
);

path.close();

var drawables = [];
drawables.push(path); // order matters !
//drawables.push(player);
//drawables.push(other);


$("#paper").on("click", function(evt){
	console.log(Raphael.isPointInsidePath(player.sightPath(), evt.clientX, evt.clientY));
})


var old_sees_other = false;

function draw(){

	paper.clear();



	player.collidesWithBob(other);

	for(var i=0; i<path.segments.length;i++) player.collidesWithSegment(path.segments[i]);


	
	var color = "#FF0000";
	player.sightColor = color;

	for(var i =0; i<drawables.length;i++){
		drawables[i].draw(paper);
	}
	
	var seenSegments = path.seenSegments(player);
	for(i=0;i<seenSegments.length;i++){
		paper.path(seenSegments[i].path()).attr({
			"stroke": "#888",
			"stroke-width": 3
		})
	}
	
	player.drawSight(paper);

	for(i=0;i<seenSegments.length;i++){
		paper.path(seenSegments[i].path()).attr({
			"stroke": "#888",
			"stroke-width": 3
		})
		
		seenSegments[i].drawShadow(paper, player);
	}

	 
	if(player.sees(other)){
		other.drawShadow(paper, player);
		if(!old_sees_other) other.say(paper, "Hello world");
		other.draw(paper);
		old_sees_other = true;
	}else{
		old_sees_other = false;
	}

	player.draw(paper);

}

setInterval(draw, 1000/25);
keyboardControl(player);
