var paper_width = 650;
var paper_height = 400;


var paper = document.getElementById("paper");
paper.width = paper_width;
paper.height = paper_height;

var ctx = paper.getContext("2d");

var world = new World();



(function initWorld(){

	var player = new Bob(225, 150, 10, 0);
	player.sightWidth=deg2rad(120);

	var other = new Bob(375, 220, 10, -90);


	world.bobs.push(player);
	world.bobs.push(other);
	world.player = player;



	var pathBorder = new Path(
		0,0,
		0,400,
		650, 400,
		650,0
	);
	pathBorder.close();

	var path = new Path(
		500, 100,
		500, 300,
		400, 300,
		350, 300,
		270, 300,
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
	path.makeGlass(6);


	world.paths.push(pathBorder);

	world.paths.push(path);
	var boulder = new Path(
		250, 250,
		240, 265,
		270, 260
	);
	boulder.close();

	world.boulders.push(boulder);
/*
	var delta = 50;
  for(var i=0; i<3; i++){
		for(var j=0; j<3; j++){
			var boulder = new Path(
				i*delta + 0, j*delta + 0,
				i*delta + 20, j*delta + 10,
				i*delta + 10, j*delta + 20,
				i*delta + 10, j*delta + 10
			);
			boulder.close();

			world.boulders.push(boulder);

		}
	}
*/
	var door = new Door(250,249, 250,201);
	var seg = new Segment(270,260, 270,300);

	world.segments.push(door);
	world.segments.push(seg);

	var licht = new Light(350, 270, 100, 2*Math.PI, Math.PI);
	var licht2 = new Light(150, 200, 150, 2*Math.PI, Math.PI);
	//var licht3 = new Light(253, 230, 100, 2*Math.PI, Math.PI);


//	world.lights.push(other.light);
	world.lights.push(player.light);
	world.lights.push(licht);
	world.lights.push(licht2);
	//lights.push(licht3);

})();

var old_sees_player = false;
var old_sees_bob = false;

var view = new View(paper.width, paper.height, world, paper);

view.renderScene(paper, world);
window.requestAnimationFrame(function(){view.draw() });
keyboardControl(world);


view.lights_on = true;
view.relative = false;
view.relative_angle = false;

$('#lights').on("click", function(evt){
	//global
	view.lights_on= !view.lights_on;

	this.innerHTML = "Lights " + (view.lights_on ? 'ON' : 'OFF');
	this.className = "button " + (view.lights_on ? 'button-on' : 'button-off');
	evt.preventDefault();
	return false;
});

$('#sight').on("click", function(evt){
	//global
	view.draw_sight= !view.draw_sight;

	this.innerHTML = "Sight " + (view.draw_sight ? 'ON' : 'OFF');
	this.className = "button " + (view.draw_sight ? 'button-on' : 'button-off');
	evt.preventDefault();
	return false;
});
$('#relative').on("click", function(evt){
	//globals
	view.relative= !view.relative;
	view.relative_angle= !view.relative_angle;

	this.innerHTML = "Relative " + (view.relative ? 'ON' : 'OFF');
	this.className = "button " + (view.relative ? 'button-on' : 'button-off');
	evt.preventDefault();
	return false;
});

$("#say").on("click", function(evt){
	//global
	world.player.say(paper, 'Hello...?\nSomeone\'s there?\nHeyho ?');
	evt.preventDefault();
	return false;
});
