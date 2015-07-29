
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




var lights_on = false;



slowBuffer = document.createElement("canvas");
slowBuffer.width = paper.width;
slowBuffer.height = paper.height;

slowTempoDelay = 1000/12;

defaultSlowFunction = function(){ console.log("default slow")}

lastValidBuffer=null;


var licht = new Light(250, 270, 200, 2*Math.PI, Math.PI);

var lights = [];
//lights.push(licht);
lights.push(other.light);
lights.push(player.light);

slowTempo = function slowTempo(){
	var ctx = slowBuffer.getContext("2d");
	
	ctx.fillStyle="#000"
	ctx.fillRect(0,0,slowBuffer.width,slowBuffer.height);
	
	var renderedLights = [],
		i=0,
		l=lights.length,
		n=l;
	
	
	function conclude(){
		var ctx = slowBuffer.getContext("2d");
		lastValidBuffer = slowBuffer.getContext('2d').getImageData(0, 0, slowBuffer.width, slowBuffer.height);
		setTimeout(slowTempo, slowTempoDelay);
	}
	
	for(i=0;i<l;i++){
		setTimeout(
			(function(a_light){
				return function(){
					var ctx = slowBuffer.getContext("2d");
					ctx.globalCompositeOperation = "ligther";
					var oldComposite = ctx.globalCompositeOperation = "ligther";
		
					a_light.draw(slowBuffer, path, boulder, bobs);
					n--;
					renderedLights.push(slowBuffer.getContext('2d').getImageData(0, 0, slowBuffer.width, slowBuffer.height))
					if(n==0){
						conclude();
					}
					ctx.globalCompositeOperation = oldComposite;
		
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


	// DRAWS SCENE
	if(lights_on){
		ctx.fillStyle = "#393";
		ctx.strokeStyle = "#cfc";
		ctx.lineWidth = 2;
		ctx.beginPath();
		path.draw(paper, false);
		ctx.fill();
		ctx.stroke();
		
		ctx.fillStyle = "#000";
		ctx.beginPath();
		boulder.draw(paper, true);
		ctx.fill();
		ctx.stroke();
	} else {
		// DRAWS FOV
			
		 	
		if(lastValidBuffer){ 
			paper.getContext("2d").putImageData(lastValidBuffer,0,0);
			player.drawSight(paper, path, boulder, other);
		}

	}



	var sees_bob = player.sees(other);
		
	// DRAWS OTHERS IF PERCEIVED
	if(lights_on || sees_bob || player.feels(other)){
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
