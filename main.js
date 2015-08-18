
var paper_width = 650;
var paper_height = 400;
			
			
var paper = document.getElementById("paper");
paper.width = paper_width;			
paper.height = paper_height;

var ctx = paper.getContext("2d");

			
			
var player = new Bob(225, 200, 10, 0);
player.sightWidth=deg2rad(120);

var other = new Bob(375, 220, 10, -90);



var bobs =[];
bobs.push(player);
bobs.push(other);


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


var boulder = new Path(
	250, 250,
	240, 265, 
	270, 260
);
boulder.close();

var old_sees_player = false;
var old_sees_bob = false;

var door = new Door(250,250+1, 250,200-1);
var glass = new Glass(270,260, 270,300);

var segments = [];
segments.push(door);
segments.push(glass);

var all_segments = segments.concat(path.segments).concat(boulder.segments);

var lights_on = false;
var draw_sight = false;
var relative = false;
var relative_angle = false;

var licht = new Light(350, 270, 100, 2*Math.PI, Math.PI);
var licht2 = new Light(150, 200, 100, 2*Math.PI, Math.PI);
//var licht3 = new Light(253, 230, 100, 2*Math.PI, Math.PI);


var lights = [];
lights.push(other.light);

lights.push(player.light);

lights.push(licht);
lights.push(licht2);
//lights.push(licht3);

function draw(){


	// CLEARING
	var ctx = paper.getContext("2d");


	ctx.fillStyle = "#000";
	ctx.fillRect(0, 0, paper_width, paper_height);
	player.shadow.clear();	
	player.tints.clear();	
	
	ctx.save();

	// TRANSFORMS
	if(relative){
		ctx.translate(paper.width/2,paper.height/2);	
		if(relative_angle) ctx.rotate(-player.angle-Math.PI/2);
		ctx.translate(-player.x,-player.y);	
	}	
	
	// GET LAST RENDERING
	if(renderScene.lastValidBuffer){ 
		var oldCompo = ctx.globalCompositeOperation;
		paper.getContext("2d").drawImage(renderScene.lastValidBuffer,0,0);	
		ctx.globalCompositeOperation = oldCompo;
		
	}

	// DRAWS FOV	
	if(draw_sight) player.drawSight(paper, all_segments, other);
	
	// DRAWS OTHERS IF PERCEIVED
	var sees_bob = player.sees(other, all_segments);
	if(!lights_on || !draw_sight || sees_bob || player.feels(other)){
		other.draw(paper);
	}
	
	// PLAYERS REACTION
	player.speak(paper, player, relative_angle);
	
	// OTHER ATTENTION
	if(player.saying || other.feels(player)){
		var a = clipAngle(
			clipAnglePositive(angleBetween(other.x, other.y, player.x, player.y)) - clipAnglePositive(other.angle)
		);
		if(Math.abs(a) > deg2rad(2)) other.angle += deg2rad(2) * Math.abs(a)/a;
	}

	// OTHERS REACTION
	var sees_player = other.sees(player, all_segments);
	if(sees_player){
		if(!old_sees_player) other.say(paper, "Hello Bob !");
	}else{
		old_sees_player = false;
	}
	other.speak(paper, player, relative_angle);
	
	// DRAWS PLAYER
	player.draw(paper);

	// REVERSE TRANSFORMS
	//if(relative){
	//	ctx.translate(player.x,player.y);
	//	if(relative_angle) ctx.rotate(player.angle-Math.PI/2);
	//	ctx.translate(-paper.width/2,-paper.height/2);	
			
	//}	
	ctx.restore();
	
	// REQUEST NEXT FRAME
	window.requestAnimationFrame(draw);
}

renderScene(paper, path, boulder, bobs, segments);
window.requestAnimationFrame(draw);
keyboardControl(player, segments, other);
