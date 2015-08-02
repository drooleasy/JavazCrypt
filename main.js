
var paper_width = 650;
var paper_height = 400;
			
			
var paper = document.getElementById("paper");
paper.width = paper_width;			
paper.height = paper_height;
var ctx = paper.getContext("2d");

var min_fps = Number.POSITIVE_INFINITY;
var max_fps = 0;
			
			
var player = new Bob(225, 200, 10, 0);
player.sightWidth=deg2rad(120);

var other = new Bob(375, 220, 10, -90);



var bobs =[];
bobs.push(player);
bobs.push(other);


var path = new Path(
	500, 100, 
	500, 300, 
	100, 300,
	100, 100, 
	250, 200
	
);
path.close();

var boulder = new Path(
	250, 250,
	240, 265, 
	270, 260
);
boulder.close();




var old_sees_player = false;
var old_sees_bob = false;



var door = new Door(250,250, 250,200);

segments = [];

segments.push(door);

var lights_on = false;
var draw_sight = false;



slowBuffer = document.createElement("canvas");
slowBuffer.width = paper.width;
slowBuffer.height = paper.height;

worldRenderer = document.createElement("canvas");
worldRenderer.width = paper.width;
worldRenderer.height = paper.height;


slowTempoDelay = 1000/20;

defaultSlowFunction = function(){ console.log("default slow")}

lastValidBuffer= document.createElement("canvas");
lastValidBuffer.width=paper.width;
lastValidBuffer.height=paper.height;

var licht = new Light(350, 270, 100, 2*Math.PI, Math.PI);
var licht2 = new Light(150, 270, 100, 2*Math.PI, Math.PI);
var licht3 = new Light(253, 230, 100, 2*Math.PI, Math.PI);

var lights = [];
lights.push(other.light);

lights.push(player.light);

lights.push(licht);
lights.push(licht2);
lights.push(licht3);

slowTempo = function slowTempo(){
	var ctx = slowBuffer.getContext("2d");
	
	ctx.fillStyle="#000"
	ctx.fillRect(0,0,slowBuffer.width,slowBuffer.height);

	
	var renderedLights = [],
		i=0,
		l=lights.length,
		n=l+1;
	
	
	
	function drawScene(ctx, nofill){
		// DRAWS SCENE
		ctx.fillStyle = "#393";
		ctx.strokeStyle = "#cfc";
		if(nofill) ctx.fillStyle = "rgba(0,0,0,0)";
		ctx.lineWidth = 4;
		ctx.beginPath();
		path.draw(worldRenderer, false);
		if(!nofill) ctx.fill();
		ctx.stroke();
		
		ctx.fillStyle = "#000";
		ctx.beginPath();
		boulder.draw(worldRenderer, true);
		if(!nofill) ctx.fill();
		ctx.stroke();

		for(var i=0; i< segments.length;i++){
			ctx.beginPath();
			segments[i].draw(worldRenderer);
			ctx.stroke();
		}
	}
	function conclude(){
		
		var ctx = slowBuffer.getContext("2d");
		var wctx = worldRenderer.getContext("2d");

		if(lights_on){
			wctx.globalCompositeOperation = "luminosity";
			wctx.drawImage(slowBuffer,0,0);
			wctx.globalCompositeOperation = "source-over";
			drawScene(wctx, true);

		}
		lastValidBuffer.getContext("2d").putImageData(wctx.getImageData(0,0,worldRenderer.width, worldRenderer.height), 0, 0);
		setTimeout(slowTempo, slowTempoDelay);
	}
	
	
	setTimeout(function(){
		var ctx = worldRenderer.getContext("2d");
		ctx.globalCompositeOperation = "source-over";
		
		ctx.fillStyle="#000";
		ctx.fillRect(0,0,worldRenderer.width,worldRenderer.height);
		drawScene(ctx);

		n--;
		if(n==0){
			conclude();
		}
	},0);
	
	for(i=0;i<l;i++){
		setTimeout(
			(function(a_light){
				return function(){
					a_light.draw(slowBuffer, path, boulder, bobs, segments);
					n--;
					if(n==0){
						conclude();
					}
					
				};
			})(lights[i]),
		0)
	}
}



function draw(){

	var timer = (new Date()).getTime();

	// CLEARING
	var ctx = paper.getContext("2d");
	ctx.fillStyle = "#000";
	ctx.fillRect(0, 0, paper_width, paper_height);
	player.shadow.clear();	
	

	// COLLISIONS
	player.collidesWithBob(other);
	for(var i=0; i<path.segments.length;i++) player.collidesWithSegment(path.segments[i]);
	for(var i=0; i<boulder.segments.length;i++) player.collidesWithSegment(boulder.segments[i]);
	for(var i=0; i<segments.length;i++) player.collidesWithSegment(segments[i]);


	// DOORS

	for(i=0;i<segments.length;i++){
		var segment = segments[i]; 
		if(segment instanceof Door) {
			var closest = segment.closestPointFrom(player.x, player.y);
			var d = distanceBetween(closest.x, closest.y, player.x, player.y)
			if(d<player.width*1.5){
				segment.open();
			}else{
				segment.close();
			}
		}
	}

	// DRAWS FOV

	if(lastValidBuffer){ 
		var oldCompo = ctx.globalCompositeOperation;

		paper.getContext("2d").drawImage(lastValidBuffer,0,0);
		
		ctx.globalCompositeOperation = oldCompo;
	
	}
	
	if(draw_sight) player.drawSight(paper, path, boulder, other, segments);




	var sees_bob = player.sees(other);
		
	// DRAWS OTHERS IF PERCEIVED
	if(!lights_on || !draw_sight || sees_bob || player.feels(other)){
		other.draw(paper);
	}

	
	
	// PLAYERS REACTION
	player.speak(paper);

	
	// OTHER ATTENTION
	if(player.saying || other.feels(player)){
		var a = clipAngle(
			clipAnglePositive(angleBetween(other.x, other.y, player.x, player.y)) - clipAnglePositive(other.angle)
		);
		if(Math.abs(a) > deg2rad(2)) other.angle += deg2rad(2) * Math.abs(a)/a;
	}


	
	// OTHERS REACTION
	var sees_player = other.sees(player);
	if(sees_player){
		if(!old_sees_player) other.say(paper, "Hello Bob !");
	}else{
		old_sees_player = false;
	}
	other.speak(paper);
	
	// DRAWS PLAYER
	player.draw(paper);
	
	
	// FPS CALCULATION
/*	timer = (new Date()).getTime() - timer;
	timer/=1000;
	var fps = 1.0/timer;
	min_fps = Math.min(min_fps, fps);
	max_fps = Math.max(max_fps, fps);
	var color = "green";
	if(fps<25) color = "red"
	display("<span style='color:red;weight:bold;'>min : " +	min_fps.toFixed(3) + "</span>");
	display("<span style='color:black;weight:bold;'>fps : " + fps.toFixed(3) + "</span>", true);
	display("<span style='color:green;weight:bold;'>max : " + max_fps.toFixed(3) + "</span>", true);
*/
	// REQUEST NEXT FRAME
	window.requestAnimationFrame(draw);
}



setTimeout(slowTempo, slowTempoDelay);


window.requestAnimationFrame(draw);
keyboardControl(player);
