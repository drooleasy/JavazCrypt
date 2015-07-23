
var paper_width = 650;
var paper_height = 400;
var paper = document.getElementById("paper");
paper.width = paper_width;			
paper.height = paper_height;
			
			

var ctx = document.getElementById("paper").getContext("2d");

var offcanvas = document.createElement("canvas");

offcanvas.style.width = paper_width + "px";
offcanvas.width = paper_width;
offcanvas.style.height = paper_height + "px";
offcanvas.height = paper_height;
offcanvas.style.backgroundColor = "#000";


var min_fps = Number.POSITIVE_INFINITY;
var max_fps = 0;
			
			
var player = new Bob(225, 200, 10, 0);
player.sightWidth=deg2rad(120);

var other = new Bob(375, 220, 10, -90);

var candles = [
	//new Candle(420,120,300),
	//new Candle(370,270,130),
	//new Candle(210,180,300),
	//new Candle(100,170,130)
];



var path = new Path(
	500, 100, 
	500, 300, 
	100, 300,
	100, 100, 
	248, 200, 
	252, 200 
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

function draw(){

	var timer = (new Date()).getTime();




	// CLEARING
	var ctx = paper.getContext("2d");
	ctx.fillStyle = "#000";
	ctx.fillRect(0, 0, paper_width, paper_height);
	player.shadow.clear();	
	for(i=0;i<candles.length;i++){
		candles[i].shadow.clear();
	}


	// COLLISIONS
	player.collidesWithBob(other);
	for(var i=0; i<path.segments.length;i++) player.collidesWithSegment(path.segments[i]);
	for(var i=0; i<boulder.segments.length;i++) player.collidesWithSegment(boulder.segments[i]);


	// DRAWS SCENE
	ctx.fillStyle = "#cfc";
	ctx.strokeStyle = "#6C6";
	ctx.lineWidth = 6;
	ctx.lineJoint = "round";
	ctx.lineCap = "round";
	path.draw(paper, false);
	
	ctx.fillStyle = "#000";
	boulder.draw(paper, true);
	

	// RENDERS CANDLES
	
	if(candles.length){
		var offctx = offcanvas.getContext('2d');
		
		offctx.globalCompositeOperation = "source-over";
		offctx.fillStyle = 'black';
		offctx.fillRect(0,0,paper_width,paper_height);

		offctx.globalCompositeOperation = "lighter";
		for(p=0;p<1;p++) for(var i=0; i<candles.length;i++){
			var candle = candles[i];
			candle.drawHalo(offcanvas, paper_width, paper_height);
		}
		var render = ctx.createImageData(paper_width, paper_height),
			map = ctx.getImageData(0,0,paper_width, paper_height),
			lights = offctx.getImageData(0,0,paper_width, paper_height);
		for(var x=0; x<paper_width;x++){
			for(var y=0; y<paper_height;y++){
				var index = (x +y*paper_width)*4;
				render.data[index+0] = map.data[index+0] * lights.data[index+0]/255;
				render.data[index+1] = map.data[index+1] * lights.data[index+1]/255;
				render.data[index+2] = map.data[index+2] * lights.data[index+2]/255;
				render.data[index+3] = map.data[index+3] * 1;
			}
		}
		
		ctx.putImageData(render, 0, 0);
	}
	

	var player_light = new Bob(
		player.x  + Math.random()*2-1,
		player.y + Math.random()*2-1,
		player.width,
		rad2deg(player.angle),
		rad2deg(player.sightWidth),
		player.sightLength *1.1
	);

	// player_light = player;

	if(!lights_on){
		// DRAWS FOV

		player.drawSight(paper);


		// DRAWS SEEN WALLS
		var ctx = paper.getContext('2d');
		ctx.strokeStyle = "#6C6";
		ctx.lineWidth = 6;

		var seenSegments = path.seenSegments(player);		
		var seenSegments2 = boulder.seenSegments(player);
		ctx.beginPath();
		for(i=0;i<seenSegments.length;i++){
			ctx.moveTo(seenSegments[i].a.x, seenSegments[i].a.y);
			ctx.lineTo(seenSegments[i].b.x, seenSegments[i].b.y);
		}
		for(i=0;i<seenSegments2.length;i++){	
			ctx.moveTo(seenSegments2[i].a.x, seenSegments2[i].a.y);
			ctx.lineTo(seenSegments2[i].b.x, seenSegments2[i].b.y);
		}
		
		/*
			var feltSegments = path.feltSegments(player);		
			var feltSegments2 = boulder.feltSegments(player_light);
			ctx.beginPath();
			for(i=0;i<feltSegments.length;i++){
				ctx.moveTo(feltSegments[i].a.x, feltSegments[i].a.y);
				ctx.lineTo(feltSegments[i].b.x, feltSegments[i].b.y);
			}
			for(i=0;i<feltSegments2.length;i++){	
				ctx.moveTo(feltSegments2[i].a.x, feltSegments2[i].a.y);
				ctx.lineTo(feltSegments2[i].b.x, feltSegments2[i].b.y);
			}

		*/
		
		ctx.stroke();
		
		// WORLD SHADOWS
		for(i=0;i<seenSegments.length;i++){
			seenSegments[i].castShadow(player_light);
		}
		for(i=0;i<seenSegments2.length;i++){
			seenSegments2[i].castShadow(player_light);
		}




		// OTHERS SHADOWS
		var sees_bob = player.sees(other);
		if(sees_bob){
			other.castShadow(player_light);
			for(i=0;i<candles.length;i++){
				other.castShadow(candles[i]);
			
			}
		}

	}



	
	// DRAWS OTHERS IF PERCEIVED
	if(lights_on || sees_bob || player.feels(other)){
		other.draw(paper);
	}

	
	// DRAWS PLAYER SHADOWS
	if(!lights_on) player_light.shadow.draw(paper);


	// PLAYERS REACTION
	if(sees_bob){
		if(!old_sees_bob) player.say(paper, "Hello Bob...");
	}else{
		old_sees_bob = false;
	}
	player.speak(paper);

	
	// OTHER ATTENTION
	if(player.saying || other.feels(player)){
		var a = clipAngle(clipAnglePositive(distanceAndAngle(other.x, other.y, player.x, player.y).angle) - clipAnglePositive(other.angle));
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
	timer = (new Date()).getTime() - timer;
	timer/=1000;
	var fps = 1.0/timer;
	min_fps = Math.min(min_fps, fps);
	max_fps = Math.max(max_fps, fps);
	var color = "green";
	if(fps<25) color = "red"
	display("<span style='color:red;weight:bold;'>min : " +	min_fps.toFixed(3) + "</span>");
	display("<span style='color:black;weight:bold;'>fps : " + fps.toFixed(3) + "</span>", true);
	display("<span style='color:green;weight:bold;'>max : " + max_fps.toFixed(3) + "</span>", true);

	// REQUEST NEXT FRAME
	window.requestAnimationFrame(draw);
}

window.requestAnimationFrame(draw);
keyboardControl(player);
