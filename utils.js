
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

function clipAngle(angle){  
	var turns = angle / (2*Math.PI);
	turns = (turns<0 ? Math.ceil(turns) : Math.floor(turns)); 
	angle -= turns * 2*Math.PI;
	if(angle < -Math.PI) angle = 2*Math.PI + angle;
	if(angle > Math.PI) angle =  angle - 2*Math.PI;
	return angle;
	// angle > 0 == to the right
	// angle < 0 == to the left
}


function clipAnglePositive(angle){
	var turns = angle / (2*Math.PI);
	turns = (turns<0 ? Math.ceil(turns) : Math.floor(turns)); 
	angle -= turns * 2*Math.PI;
	if(angle < 0) angle = 2*Math.PI + angle ;
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



function castRay(ox, oy, tx, ty, limit){
	var vx = tx-ox,
		vy = ty-oy;
		
		
	/*	
		tx,
		ty,
		tx + k * vx ,
		ty + k * vy
		
		dx = tx + k * vx - ox
		dy = ty + k * vy - oy
		
		dx*dx + dy*dy == limit*limit
		
		
		(tx + k * vx - ox)*(tx + k * vx - ox)
		(tx - ox + k * vx)*(tx - ox + k * vx)
		
		(tx-ox)² + 2*(tx-ox)*(k*vx) + k² * vx²
		
		k² * vx² + k² * vy²
		2*(tx-ox)*(k*vx) + 2*(ty-oy)*(k*vy)
		(tx-ox)² + (ty-oy)² - limit²

		2*(tx-ox)*(k*vx) + 2*(ty-oy)*(k*vy)
		2*tx*k*vx - 2*ox*k*vx + 2*ty*k*vy - 2*oy*k*vy
		k*(2*tx*vx -2*ox*vx + 2*ty*vy - 2*oy*vy)
	*/
		var sol = solveP2(
			(vx*vx + vy*vy),
			(2*tx*vx -2*ox*vx + 2*ty*vy - 2*oy*vy),
			((tx-ox)*(tx-ox) + (ty-oy)*(ty-oy) - limit*limit)
		);
		
		if(sol.length>0){
			return new Segment(tx, ty, tx + sol[0] * vx, ty + sol[0] * vy);
		}
		return null 
	
}



function crossProduct(a,b){
	return a.x * b.y - a.y * b.x;
}


function minus(a,b){
	return {
		x: (a.x - b.x),
		y: (a.y - b.y)
	};
}



function intersection(a1,a2,b1,b2){ // a1<a2 && b1<b2
	
	if(b1>a2 || a1 >b2) return []
	
	var mn = Math.min(a1,b1);
	var mx = Math.max(a2,b2);
	
	if(a1>b1 && a2<b2) return [[b1,b2]];
	if(b1>a1 && b2<a2) return [[a1,a2]];
	
	return [[Math.max(mn, a1, b1), Math.min(mx, a2, b2)]];
	
}


function union(a1,a2,b1,b2){ // a1<a2 && b1<b2
	
	if(b1>a2 || a1 >b2) return [[a1,a2], [b1,b2]];
	var mn = Math.min(a1,b1);
	var mx = Math.max(a2,b2);
	return [[mn,mx]]
	
}
