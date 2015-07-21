
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



			
			
var player = new Bob(325, 200, 10, -85);
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
	250, 200 
);

path.close();

var boulder = new Path(
	250, 250,
	270, 260,
	240, 265 
);

boulder.close();

var drawables = [];
drawables.push(path); // order matters !
drawables.push(boulder); // order matters !
//drawables.push(player);
//drawables.push(other);


var old_sees_other = false;

function draw(){

	var timer = (new Date()).getTime();
	 // clear();
	var ctx = paper.getContext("2d");
	ctx.fillStyle = "#000";
	ctx.fillRect(0, 0, paper_width, paper_height);


	player.shadow.clear();
	
	for(i=0;i<candles.length;i++){
		candles[i].shadow.clear();
	}

	player.collidesWithBob(other);

	for(var i=0; i<path.segments.length;i++) player.collidesWithSegment(path.segments[i]);
	for(var i=0; i<boulder.segments.length;i++) player.collidesWithSegment(boulder.segments[i]);


	
	var color = "#FF0000";
	player.sightColor = color;

	for(var i =0; i<drawables.length;i++){
		drawables[i].draw(paper);
	}

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
				//console.log(lights[index_light]);
				render.data[index+0] = map.data[index+0] * lights.data[index+0]/255;
				render.data[index+1] = map.data[index+1] * lights.data[index+1]/255;
				render.data[index+2] = map.data[index+2] * lights.data[index+2]/255;
				render.data[index+3] = map.data[index+3] * 1;
			}
		}
		
		ctx.putImageData(render, 0, 0);
	}
	

	player.drawSight(paper);



	var seenSegments = path.seenSegments(player);

	var seenSegments2 = boulder.seenSegments(player);



	var ctx = paper.getContext('2d');
	ctx.strokeStyle = "#6C6";
	ctx.lineWidth = 6;
	
	
	

	ctx.beginPath();
		
	for(i=0;i<seenSegments.length;i++){
		ctx.moveTo(seenSegments[i].a.x, seenSegments[i].a.y);
		ctx.lineTo(seenSegments[i].b.x, seenSegments[i].b.y);
	}

	for(i=0;i<seenSegments2.length;i++){
		
		ctx.moveTo(seenSegments2[i].a.x, seenSegments2[i].a.y);
		ctx.lineTo(seenSegments2[i].b.x, seenSegments2[i].b.y);
	}
	ctx.stroke();




	

	
	for(i=0;i<seenSegments.length;i++){
		seenSegments[i].castShadow(player);
	}

	for(i=0;i<seenSegments2.length;i++){
		seenSegments2[i].castShadow(player);
	}





	var sees_bob = player.sees(other);

	if(sees_bob){
		other.castShadow(player);
		for(i=0;i<candles.length;i++){
			other.castShadow(candles[i]);
		
		}
	}
	

	
	player.shadow.draw(paper);
	



	if(sees_bob){
		if(!old_sees_other) other.say(paper, "Hello world");
		old_sees_other = true;
		other.draw(paper);
	}else{
		old_sees_other = false;
	}
	

	player.draw(paper);
	
	timer = (new Date()).getTime() - timer;
	
	timer/=1000;
	var fps = 1.0/timer;
	
	var color = "green";
	if(fps<25) color = "red"
	display("<span style='color:"+color+";weight:bold;'>fps : " + fps.toFixed(3) + "</span>");

}

setInterval(draw, 1000/13);
keyboardControl(player);
