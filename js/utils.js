
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


function dotProduct(a, b){
	return a.x * b.x + a.y * b.y
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






