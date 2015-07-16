
function deg2rad(deg){
	return deg*Math.PI/180;
}

function rad2deg(rad){
	return rad*180/Math.PI;
}

function clipAngle(angle){
	if(angle < -Math.PI) angle = Math.PI*2 + angle;
	if(angle > Math.PI) angle =  angle - 2*Math.PI;
	return angle;
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


function solveP2(a, b, c){ // ax2 + bx + c = 0, a!=0 !!!!
	var det = b*b - 4*a*c;
	if(det>=0){
		return [
			(-b + Math.sqrt(det))/(2*a),
			(-b - Math.sqrt(det))/(2*a)
		]; 
	} else return [];
}
