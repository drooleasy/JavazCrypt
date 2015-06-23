
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
