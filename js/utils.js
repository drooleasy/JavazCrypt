/**
 * solve a 2nd-degree equation
 * @param  {number} a 2nd degre factor
 * @param  {number} b 1st degree factor
 * @param  {number} c constant factor
 * @return {Array} with the two -possibly equals- solutions or empty if no solution
 */
function solveP2(a, b, c){ // ax2 + bx + c = 0, a!=0 !!!!
	var det = b*b - 4*a*c;
	if(det>=0){
		return [
			(-b + Math.sqrt(det))/(2*a),
			(-b - Math.sqrt(det))/(2*a)
		];
	} else return [];
}


/**
 * compute the segment between an origin and and a point, from this point to a limit distance
 * @param  {number} ox    x-origin of ray
 * @param  {number} oy    y-origin of ray
 * @param  {number} tx    x of start/through point
 * @param  {number} ty    y of start/through point
 * @param  {number} limit max length of ray
 * @return {Segment}       the ray Segment or null if the point is too far
 */
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


/**
 * compute cross product between two vector
 * @param  {object} a vector with x and y properties
 * @param  {object} b vector with x and y properties
 * @return {number}   the cross product
 */
function crossProduct(a,b){
	return a.x * b.y - a.y * b.x;
}

/**
 * compute dot product between two vector
 * @param  {object} a vector with x and y properties
 * @param  {object} b vector with x and y properties
 * @return {number}   the dot product
 */

function dotProduct(a, b){
	return a.x * b.x + a.y * b.y
}

/**
 * compute difference between two points
 * @param  {object} a point with x and y properties
 * @param  {object} b point with x and y properties
 * @return {object}  	the x and y differences
 */
function minus(a,b){
	return {
		x: (a.x - b.x),
		y: (a.y - b.y)
	};
}


/**
 * compute intersction betwwen two ranges. a1<a2 && b1<b2
 * @param {number} a1 first range start
 * @param {number} a2 first range end
 * @param {number} b1 second range start
 * @param {number} b2 second range end
 * @return {Array} the intersection start and end
 */
function intersection(a1,a2,b1,b2){ // a1<a2 && b1<b2

	if(b1>a2 || a1 >b2) return []

	var mn = Math.min(a1,b1);
	var mx = Math.max(a2,b2);

	if(a1>b1 && a2<b2) return [[b1,b2]];
	if(b1>a1 && b2<a2) return [[a1,a2]];

	return [Math.max(mn, a1, b1), Math.min(mx, a2, b2)];

}
/**
 * compute union betwwen two ranges. a1<a2 && b1<b2
 * @param {number} a1 first range start
 * @param {number} a2 first range end
 * @param {number} b1 second range start
 * @param {number} b2 second range end
 * @return {Array} the union start and end or the thwo disjoint ranges
 */

function union(a1,a2,b1,b2){ // a1<a2 && b1<b2

	if(b1>a2 || a1 >b2) return [[a1,a2], [b1,b2]];
	var mn = Math.min(a1,b1);
	var mx = Math.max(a2,b2);
	return [mn,mx]

}
