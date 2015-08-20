
var paper_width = 650;
var paper_height = 400;
			
			
var paper = document.getElementById("paper");
paper.width = paper_width;			
paper.height = paper_height;

var ctx = paper.getContext("2d");

var world = new World();
		
var player = new Bob(225, 200, 10, 0);
player.sightWidth=deg2rad(120);

var other = new Bob(375, 220, 10, -90);


world.bobs.push(player);
world.bobs.push(other);
world.player = player;



var path = new Path(
	500, 100, 
	500, 300, 
	400, 300, 
	350, 300, 
	100, 300,
	100, 200,
	100, 150,
	100, 100, 
	250, 200,
	350, 175,
	450, 125
	
);
path.close();

path.makeDoor(path.segments.length-2);
path.makeGlass(2);
path.makeGlass(5);


world.paths.push(path);

var boulder = new Path(
	250, 250,
	240, 265, 
	270, 260
);
boulder.close();

world.boulders.push(boulder);

var old_sees_player = false;
var old_sees_bob = false;

var door = new Door(250,250+1, 250,200-1);
var seg = new Segment(270,260, 270,300);

world.segments.push(door);
world.segments.push(seg);

var lights_on = false;
var draw_sight = false;
var relative = false;
var relative_angle = false;

var licht = new Light(350, 270, 100, 2*Math.PI, Math.PI);
var licht2 = new Light(150, 200, 100, 2*Math.PI, Math.PI);
//var licht3 = new Light(253, 230, 100, 2*Math.PI, Math.PI);


world.lights.push(other.light);
world.lights.push(player.light);
world.lights.push(licht);
world.lights.push(licht2);
//lights.push(licht3);


var view = new View(paper.width, paper.height, world, paper);

view.renderScene(paper, world);
window.requestAnimationFrame(function(){view.draw() });
keyboardControl(world);
