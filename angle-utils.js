var PIPI = 2*Math.PI;

function deg2rad(deg){
	return deg*Math.PI/180;
}

function rad2deg(rad){
	return rad*180/Math.PI;
}


function display(msg, dontClear){
	var dbg = document.getElementById("dbg-info");
	if(dbg) dbg.innerHTML = (!!dontClear ?  dbg.innerHTML + "<br/>" : "") + msg;
}



function turns(angle){
	return angle / (PIPI);
}

function clipAngle(angle){  
	var t = turns(angle);
	t = (t<0 ? Math.ceil(t) : Math.floor(t)); 
	angle -= t * PIPI;
	if(angle < -Math.PI) angle = PIPI + angle;
	if(angle > Math.PI) angle =  angle - PIPI;
	return angle;
	// angle > 0 == to the right
	// angle < 0 == to the left
}


function clipAnglePositive(angle){
	var turns = angle / (2*Math.PI);
	turns = (turns<0 ? Math.ceil(turns) : Math.floor(turns)); 
	angle -= turns * 2*Math.PI;
	if(angle < 0) angle = PIPI + angle ;
	return angle;
}


function clipAngleNegative(angle){
	var turns = angle / PIPI;
	turns = (turns<0 ? Math.ceil(turns) : Math.floor(turns)); 
	angle -= turns * PIPI;
	if(angle < 0) angle = PIPI + angle ;
	return angle - PIPI;
}



function angle(from_x,from_y, to_x,to_y){
	var dx = to_x - from_x,
		dy = to_y - from_y;
	return clipAngle(Math.atan2(dy,dx));
}

function distance(from_x,from_y, to_x,to_y){
	var dx = to_x - from_x,
		dy = to_y - from_y;
	return Math.sqrt(dx*dx+dy*dy); 
}

function distanceAndAngle(from_x,from_y, to_x,to_y){
	var dx = to_x - from_x,
		dy = to_y - from_y,
		distance = Math.sqrt(dx*dx+dy*dy),
		angle = clipAngle(Math.atan2(dy,dx));
	return {
		distance : distance,
		angle : angle
	};
}


function quadrant(angle){
	
	var cos = Math.cos(angle),
		sin = Math.sin(angle),
		res = {
		cos: cos,
		sin: sin,
		x: (cos > 0 ? 0 : 1),
		y: (sin > 0 ? 1 : 0)
	};
	
	res.isTop = (res.y == 0);
	res.isLeft = (res.x == 0);
	res.isDown = (res.y == 1);
	res.isRight = (res.x == 1);
	
	return res;
}

function cossin(angle){
	return {
		x: Math.cos(angle),
		y: Math.sin(angle)
	}	
}

function rad(a){
	var res = new Number(a);
	res.unit = "rad";
	res.rad = function radToRad(){
		return this;
	};
	res.deg = function radToDeg(){
		return deg(rad2deg(this));
	};
	
	
	res.clip = function radClip(){
		return rad(clipAngle(this));
	};
	
	res.positive = function radClipPositive(){
		return rad(clipAnglePositive(this));
	};
	
	res.negative = function radClipNegative(){
		return rad(clipAngleNegative(this));
	};
	
	res.turns = function radTurns(){
		return turns(this);
	};
	
	res.sin = function radSin(){
		var res = Math.sin(this);
		this.sin = function radSinCache(){
			return res;
		}
		return res;
	};

	res.cos = function radCos(){
		var res = Math.cos(this);
		this.cos = function radCosCache(){ 
			return res;
		}
		return res;
	};

	res.quadrant = function radQuadrant(){
		return quadrant(this);
	};

	return res;
}




function deg(a){
	var res = new Number(a);
	res.unit = "deg";

	res.deg = function degToDeg(){
		return this;
	}
	res.rad = function degToRad(){
		return rad(deg2rad(this));
	}
	res.clip = function degClip(){
		return deg(rad2deg(this.rad().clip()));
	}
	
	res.positive = function degClipPositive(){
		return deg(rad2deg(this.rad().positive()));	
	}
	res.negative = function degClipPositive(){
		return deg(rad2deg(this.rad().negative()));	
	}
	
	res.turns = function degTurns(){
		return this.toRad().turns();
	}
	
	res.sin = function degSin(){
		var res = Math.sin(this.rad());
		this.sin = function degSinCache(){
			return res;
		}
		return res;
	}

	res.cos = function degCos(){
		var res = Math.cos(this.rad());
		this.cos = function degCosCache(){ 
			return res;
		}
		return res;
	}
	
	res.quadrant = function degQuadrant(){
		return quadrant(this.rad());
	}
	
	return res;
}
