
var paper_width = 650;
var paper_height = 400;
			
			
var paper = document.getElementById("paper");
paper.width = paper_width;			
paper.height = paper_height;
var ctx = paper.getContext("2d");

			








var segment_1 = new Segment(200, 100, 200, 300);
	
var handle_1 = new Handle(segment_1.a.x,segment_1.a.y, 5, function(){
		console.log("handled " + this.r);
		segment_1.a.x = this.x;
		segment_1.a.y = this.y;
});
var handle_2 = new Handle(segment_1.b.x,segment_1.b.y, 5, function(){
		console.log("handled " + this.r);
		segment_1.b.x = this.x;
		segment_1.b.y = this.y;
});

handle_1.label = "A";
handle_2.label = "B";


var segment_2 = new Segment(500, 100, 500, 300);
	
var handle_3 = new Handle(segment_2.a.x,segment_2.a.y, 5, function(){
		console.log("handled " + this.r);
		segment_2.a.x = this.x;
		segment_2.a.y = this.y;
});
var handle_4 = new Handle(segment_2.b.x,segment_2.b.y, 5, function(){
		console.log("handled " + this.r);
		segment_2.b.x = this.x;
		segment_2.b.y = this.y;
});

handle_3.label = "C";
handle_4.label = "D";




var segments = [
	segment_1,
	segment_2
];


var handles = [
	handle_1,
	handle_2,
	handle_3,
	handle_4
];



$(paper).on("click", function(evt){
	
	var mx = evt.pageX - $(paper).offset().left;
	var my = evt.pageY - $(paper).offset().top;
	
	for(var i=0;i<handles.length;i++){
		var handle = handles[i];
		if(distanceBetween(mx,my, handle.x,handle.y) < handle.r){
			console.log("handle clicked")
		}
	}
});


var dragged = null;

$(paper).on("mousedown", function(evt){
	
	var mx = evt.pageX - $(paper).offset().left;
	var my = evt.pageY - $(paper).offset().top;
	
	for(var i=0;i<handles.length;i++){
		var handle = handles[i];
		if(distanceBetween(mx,my, handle.x,handle.y) < handle.r){
			console.log("handle down");
			dragged = handle;
		}
	}
});

$(paper).on("mouseup", function(evt){
	
	var mx = evt.pageX - $(paper).offset().left;
	var my = evt.pageY - $(paper).offset().top;
	
	
	for(var i=0;i<handles.length;i++){
		var handle = handles[i];
		if(distanceBetween(mx,my, handle.x,handle.y) < handle.r){
			console.log("handle up");
			dragged = null;
		}
	}
});


var overred = null;
$(paper).on("mousemove", function(evt){
	
	var mx = evt.pageX - $(paper).offset().left;
	var my = evt.pageY - $(paper).offset().top;
	
	if(dragged){
			dragged.x = mx;
			dragged.y = my;
			dragged.onMove.call(dragged);
	}

	if(overred && distanceBetween(mx,my, overred.x,overred.y) > overred.r){
		overred.onMouseOut.call(overred);
		overred = null;
	}

	for(var i=0;i<handles.length;i++){
		var handle = handles[i];
		if(handle !== dragged && distanceBetween(mx,my, handle.x,handle.y) < handle.r){
			handle.onMouseOver.call(handle);
			overred = handle;
		}
	}

});

var lights_on = false;


var bobs = [];

slowBuffer = document.createElement("canvas");
slowBuffer.width = paper.width;
slowBuffer.height = paper.height;

slowTempoDelay = 1000/12;

defaultSlowFunction = function(){ console.log("default slow")}

lastValidBuffer=null;


var licht = new Light(250, 270, 200, 2*Math.PI, Math.PI);

var lights = [];
lights.push(licht);

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
		if(false)setTimeout(
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

	// CLEARING
	var ctx = paper.getContext("2d");
	ctx.fillStyle = "#000";
	ctx.fillRect(0, 0, paper_width, paper_height);
	


	ctx.fillStyle = "#393";
	ctx.strokeStyle = "#cfc";
	ctx.lineWidth = 2;
	for(var i=0;i<segments.length;i++){
		var segment = segments[i];
		segment.draw(paper);
		//ctx.fill();
		ctx.stroke();
	}

	for(var i=0;i<handles.length;i++){
		var handle = handles[i];
		handle.draw(paper);
	}
	window.requestAnimationFrame(draw);
}



setTimeout(slowTempo, slowTempoDelay);


window.requestAnimationFrame(draw);
