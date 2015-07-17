
var paper_width = 650;
var paper_height = 400;
var paper = Raphael("paper", paper_width, paper_height);
paper.width = paper_width;			
paper.height = paper_height;
			
var player = new Bob(325, 200, 10, -85);
player.sightWidth=deg2rad(120);

var other = new Bob(375, 220, 10, -90);


var candle = new Candle(330, 210, 1000);
var candle2 = new Candle(210, 220, 1000);
var candles = [];
//candles.push(candle);
//candles.push(candle2);


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


$("#paper").on("click", function(evt){
	console.log(Raphael.isPointInsidePath(player.sightPath(), evt.clientX, evt.clientY));
})


var old_sees_other = false;

function draw(){

	var timer = (new Date()).getTime();
	paper.clear();


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


	player.drawSight(paper);


	 
	var seenWallStyle = {
		"stroke": "#8F8",
		"stroke-width": 2,
		"stroke-linecap":"round"
	};

	var seenSegments = path.seenSegments(player);

	var seenSegments2 = boulder.seenSegments(player);


	for(i=0;i<seenSegments.length;i++){
		paper.path(seenSegments[i].path()).attr(seenWallStyle)
	}

	for(i=0;i<seenSegments2.length;i++){
		paper.path(seenSegments2[i].path()).attr(seenWallStyle)
	}


	
	for(i=0;i<seenSegments.length;i++){
		seenSegments[i].castShadow(player);
		
		for(var j=0;j<candles.length;j++){
			seenSegments[i].castShadow(candles[j]);
		}

	}

	for(i=0;i<seenSegments2.length;i++){
		seenSegments2[i].castShadow(player);
		for(j=0;j<candles.length;j++){
			seenSegments2[i].castShadow(candles[j]);
		}
	}


	var sees_bob = player.sees(other);

	if(sees_bob){
		other.castShadow(player);
		for(i=0;i<candles.length;i++){
			other.castShadow(candles[i]);
		
		}
	}
	

	
	player.shadow.draw(paper);
	
	for(i=0;i<candles.length;i++){
		candles[i].shadow.draw(paper);
	}

	if(sees_bob){
		if(!old_sees_other) other.say(paper, "Hello world");
		old_sees_other = true;
		other.draw(paper);
	}else{
		old_sees_other = false;
	}
	



	for(i=0;i<candles.length;i++){
		candles[i].draw(paper);
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
